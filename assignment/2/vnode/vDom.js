const nodePatchTypes = {
  CREATE: "create node",
  REMOVE: "remove node",
  REPLACE: "replace node",
  UPDATE: "update node",
};

const propPatchTypes = {
  REMOVE: "remove prop",
  UPDATE: "update prop",
};

class VDom {
  vdom = {};

  constructor(vDom) {
    this.vDom = vDom;
  }

  createElement = (vdom) => {
    if (typeof vdom === "string" || typeof vdom === "number") {
      return document.createTextNode(vdom);
    }

    const { tag, props, children } = vdom;

    const element = document.createElement(tag);

    for (let key in props) {
      element.setAttribute(key, props[key]);
    }

    if (children) {
      children
        .map(this.createElement)
        .forEach(element.appendChild.bind(element));
    }
    return element;
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
    if (vDomOld.tag) {
      const propsDiff = this._diffProps(vDomOld, vDomNew);
      const childrenDiff = this._diffChildren(vDomOld, vDomNew);

      if (
        propsDiff.length > 0 ||
        childrenDiff.some((patch) => !!patch)
      ) {
        return {
          type: nodePatchTypes.UPDATE,
          props: propsDiff,
          children: childrenDiff,
        };
      }
    }
  };

  _diffProps = (vDomOld, vDomNew) => {
    const patches = [];
    const allProps = { ...vDomOld.props, ...vDomNew.props };

    for (let key in allProps) {
      const oldVal = vDomOld.props[key];
      const newVal = vDomNew.props[key];

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
          key,
          value: newVal,
        });
      }
    }
    return patches;
  };

  _diffChildren = (vDomOld, vDomNew) => {
    const patches = [];

    if (vDomOld.children === undefined) {
      vDomOld.children = [];
    }
    if (vDomNew.children === undefined) {
      vDomNew.children = [];
    }

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

  patch = (parent, patchObj, index = 0) => {
    if (!patchObj) {
      return;
    }
    // create
    if (patchObj.type === nodePatchTypes.CREATE) {
      // console.log("parent", parent);
      return parent.appendChild(this.createElement(patchObj.vDom));
    }

    const element = parent.childNodes[index];
    // console.log(element);

    // delete
    if (patchObj.type === nodePatchTypes.REMOVE) {
      return parent.removeChild(element);
    }

    // update
    if (patchObj.type === nodePatchTypes.UPDATE) {
      const { props, children } = patchObj;

      this._patchProps(element, props);

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
        element.removeAttribute(patchObj.key);
      }
      // create / update
      else if (obj.type === propPatchTypes.UPDATE) {
        element.setAttribute(obj.key, obj.value);
      }
    });
  };

  render = (parent) => {
    let i = 2;
    let preDom = getDom(2),
      newDom;

    const el = this.createElement(preDom);
    parent.appendChild(el);

    let timeout = setInterval(() => {
      if (i > 10) {
        clearInterval(timeout);
      }
      newDom = getDom(++i);
      const patch = this.diff(preDom, newDom);
      preDom = newDom;
      console.log(patch);
      this.patch(parent, patch);
    }, 1000);
  };
}

function getDom(i) {
  let c = [];
  for (let j = 0; j < i; j++) {
    c.push({
      tag: "li",
      props: { class: "li-item" },
      children: [(j + "").repeat(9)],
    });
  }
  var dom = {
    tag: "div",
    props: { class: "container" },
    children: [
      {
        tag: "button",
        props: { class: "btn" },
        children: ["click"],
      },
      {
        tag: "ul",
        props: {},
        children: c,
      },
      // [1, 2, 3].map((el) => {
      //   return {
      //     tag: "span",
      //     props: { class: el + "" },
      //   };
      // }),
    ],
  };
  return dom;
}
