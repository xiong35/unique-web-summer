const nodePatchTypes = {
  CREATE: "create node",
  REMOVE: "remove node",
  REPLACE: "replace node",
  UPDATE: "update node",
  INSERT: "insert node",
  MOVE: "move node",
};

const propPatchTypes = {
  REMOVE: "remove prop",
  UPDATE: "update prop",
};

class VDom {
  createElement = (vDom) => {
    if (typeof vDom === "string" || typeof vDom === "number") {
      return document.createTextNode(vDom);
    }

    const { tag, props, children } = vDom;

    const element = document.createElement(tag);

    for (let propName in props) {
      element.setAttribute(propName, props[propName]);
    }

    if (children) {
      children
        .map(this.createElement)
        .forEach(element.appendChild.bind(element));
    }
    return element;
  };

  static toVDom = (tag, props, ...children) => {
    return {
      tag,
      props: props || {},
      children: [].concat.apply([], children) || [],
    };
  };

  diff = (vDomOld, vDomNew) => {
    // add
    if (!vDomOld) {
      return {
        type: nodePatchTypes.CREATE,
        vDom: vDomNew,
      };
    }

    // del
    if (!vDomNew) {
      return { type: nodePatchTypes.REMOVE };
    }

    // replace
    if (
      typeof vDomOld !== typeof vDomNew ||
      ((typeof vDomOld === "string" ||
        typeof vDomOld === "number") &&
        vDomOld !== vDomNew) ||
      vDomOld.tag !== vDomNew.tag
    ) {
      return {
        type: nodePatchTypes.REPLACE,
        vDom: vDomNew,
      };
    }

    // update child
    if (vDomOld.tag) {
      const propsDiff = this._diffProps(vDomOld, vDomNew);
      const { children, moves } = this.diffChildren(
        vDomOld,
        vDomNew
      );

      if (
        propsDiff.length > 0 ||
        children.some((patch) => !!patch)
      ) {
        return {
          type: nodePatchTypes.UPDATE,
          props: propsDiff,
          moves,
          children,
        };
      }
    }
  };

  _diffProps = (vDomOld, vDomNew) => {
    const patches = [];
    const allProps = { ...vDomOld.props, ...vDomNew.props };

    for (let propName in allProps) {
      const oldVal = vDomOld.props[propName];
      const newVal = vDomNew.props[propName];

      // del
      if (!newVal) {
        patches.push({
          type: propPatchTypes.REMOVE,
        });
      }
      // update
      else if (!oldVal || oldVal !== newVal) {
        patches.push({
          type: propPatchTypes.UPDATE,
          propName,
          value: newVal,
        });
      }
    }
    return patches;
  };

  _diffChildren = (vDomOld, vDomNew) => {
    const patches = [];

    const childLength = Math.max(
      vDomOld.children.length,
      vDomNew.children.length
    );

    for (let i = 0; i < childLength; i++) {
      patches.push(
        this.diff(vDomOld.children[i], vDomNew.children[i])
      );
    }

    return patches;
  };

  diffChildren = (vDomOld, vDomNew) => {
    const patches = new Array(vDomNew.children.length);
    const moves = new Array(vDomOld.children.length);
    /* 
    node obj:
    {
      oldInd: <number>
      vDom: <vDom>
    }
    */

    const nodesWithKey = {};

    const nodesWithoutKey = [];
    let noKeyInd = 0;

    const oldChildren = vDomOld.children;

    const newChildren = vDomNew.children;

    let lastIndex = 0;

    // 将子元素分成有key和没key两组
    oldChildren.forEach((child, ind) => {
      const props = child.props;

      if (props !== undefined && props.key !== undefined) {
        nodesWithKey[props.key] = {
          oldInd: ind,
          vDom: child,
        };
      } else {
        nodesWithoutKey[noKeyInd++] = {
          oldInd: ind,
          vDom: child,
        };
      }
    });

    // 插入 / 更新新元素, 移动老元素
    newChildren.forEach((newChild, newInd) => {
      // 找能不能复用
      let oldObj;
      if (newChild && newChild.props && newChild.props.key) {
        oldObj = nodesWithKey[newChild.props.key];
        // 设置 key 被用过了
        nodesWithKey[newChild.props.key] = undefined;
      } else {
        // 尝试找到没有 key 的相同元素, 找到就复用, 找不到就插入
        oldObj = nodesWithoutKey.find((obj, ind) => {
          if (obj && sameVnode(obj.vDom, newChild)) {
            nodesWithoutKey[ind] = undefined;
            return true;
          }
        });
      }
      // 移动 / 插入 元素
      if (!oldObj) {
        // 如果对应的 key 没有旧元素可复用
        // 就在新元素的位置创建并 插入 元素
        patches[newInd] = {
          insert: true,
          rDom: this.createElement(newChild),
          at: newInd,
        };
      } else {
        if (oldObj.oldInd < lastIndex) {
          /* 当前节点在老集合中的位置与 lastIndex 进行比较，
           if (child.oldInd >= lastIndex)，
           说明老元素中, 他前面的节点都被处理过 / 将要被处理
           他自己只要顺位往前排就好了, 不会有人插到前面
           则不进行节点移动操作，否则执行该操作 */
          moves[oldObj.oldInd] = {
            type: nodePatchTypes.INSERT,
            from: oldObj.oldInd,
            at: newInd,
          };
        }
        lastIndex = Math.max(oldObj.oldInd, lastIndex);
        // 移动后如何更新新dom
        patches[newInd] = this.diff(oldObj.vDom, newChild);
      }
    });

    // 清理未被复用的元素
    for (let key in nodesWithKey) {
      let oldObj = nodesWithKey[key];
      if (oldObj) {
        moves[oldObj.oldInd] = {
          type: nodePatchTypes.REMOVE,
          from: oldObj.oldInd,
        };
      }
    }
    for (let ind = 0; ind < nodesWithKey.length; ind++) {
      let oldObj = nodesWithKey[ind];
      if (oldObj) {
        moves[oldObj.oldInd] = {
          type: nodePatchTypes.REMOVE,
          from: oldObj.oldInd,
        };
      }
    }

    // 删除多余元素
    return { children: patches, moves };
  };

  patch = (parent, patchObj, index = 0) => {
    if (!patchObj) {
      return;
    }

    // insert
    if (patchObj.insert) {
      console.log("insert");
      let atNode = parent.childNodes[patchObj.at];
      parent.insertBefore(patchObj.rDom, atNode);
    }

    // create
    else if (patchObj.type === nodePatchTypes.CREATE) {
      // console.log("parent", parent);
      return parent.appendChild(this.createElement(patchObj.vDom));
    }

    const siblings = parent.childNodes;
    const element = siblings[index];
    // console.log(element);

    // delete
    if (patchObj.type === nodePatchTypes.REMOVE) {
      return parent.removeChild(element);
    }
    // replace
    else if (patchObj.type === nodePatchTypes.REPLACE) {
      return parent.replaceChild(
        this.createElement(patchObj.vDom),
        element
      );
    }

    // update
    else if (patchObj.type === nodePatchTypes.UPDATE) {
      const { props, children, moves } = patchObj;
      this._patchProps(element, props);

      // move
      if (moves) {
        const toRemove = [];

        moves.forEach((obj) => {
          if (obj) {
            if (obj.type === nodePatchTypes.INSERT) {
              children[obj.to] = children[obj.to] || {};

              children[obj.to].rDom = siblings[obj.from];
              children[obj.to].insert = true;
              children[obj.to].at = obj.at;
            }
            toRemove.push(siblings[obj.from]);
          }
        });
        console.log("siblings", siblings);
        console.log("moves", moves);
        console.log("toRemove", toRemove);

        toRemove.forEach((el) => el.parentNode.removeChild(el));
      }

      children.forEach((obj, ind) => {
        // console.log(element);
        this.patch(element, obj, ind);
      });
    }
  };

  _patchProps = (element, props) => {
    if (!props) {
      return;
    }

    props.forEach((obj) => {
      // del
      if (obj.type === propPatchTypes.REMOVE) {
        element.removeAttribute(patchObj.propName);
      }
      // create / update
      else if (obj.type === propPatchTypes.UPDATE) {
        element.setAttribute(obj.propName, obj.value);
      }
    });
  };

  render = (parent) => {
    let i = 1;
    let preDom = getDom(1),
      newDom;

    const el = this.createElement(preDom);
    parent.appendChild(el);

    let timeout = setInterval(() => {
      if (i > 20) {
        clearInterval(timeout);
      }
      newDom = getDom(++i);
      const patch = this.diff(preDom, newDom);
      preDom = newDom;
      // console.log("newDom", newDom);
      // console.log("patch", patch);
      this.patch(parent, patch);
    }, 1000);
  };
}

function sameVnode(a, b) {
  let aType = typeof a;
  let bType = typeof b;
  if (aType === "undefined" || bType === "undefined") {
    return false;
  }
  if (
    (aType === "string" || aType === "number") &&
    (bType === "string" || bType === "number")
  ) {
    return a == b;
  }
  return a.key === b.key && a.tag === b.tag;
}

var c = [];
let keyed = [
  "aa",
  "bb",
  "cc",
  "dd",
  "ee",
  "ff",
  "gg",
  "hh",
  "ii",
  "jj",
  "kk",
  "ll",
  "aaamm",
  "aaann",
  "aaadd",
  "aaaee",
  "aaaff",
  "aaagg",
  "aaahh",
  "aaaii",
  "aaajj",
  "aaakk",
  "aaall",
  "aaamm",
  "aaann",
].map((key, ind) => {
  return {
    tag: "li",
    props: { key },
    children: [key.repeat(3)],
  };
});

function getDom(i) {
  let ind = Math.floor(Math.random() * keyed.length);
  let cind = Math.floor(Math.random() * c.length);
  c.unshift(keyed.splice(ind, 1)[0]);
  console.log(cind);
  c[cind].children = [(i + "").repeat(i)];

  // var dom = VDom.toVDom(
  //   "div",
  //   { class: "container" },
  //   VDom.toVDom("button", { class: "btn" }, "click"),
  //   [1, 2, 3].map((j) => {
  //     return VDom.toVDom("ul", null, c);
  //   })
  // );
  var dom = VDom.toVDom("ul", null, c);
  return dom;
}
