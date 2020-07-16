/*** 1. new Promise时，需要传递一个 executor 执行器，执行器立刻执行* 2. executor 接受两个参数，分别是 resolve 和 reject* 3. promise 只能从 pending 到 rejected, 或者从 pending 到 fulfilled* 4. promise 的状态一旦确认，就不会再改变* 5. promise 都有 then 方法，then 接收两个参数，分别是 promise 成功的回调 onFulfilled,* 和 promise 失败的回调 onRejected* 6. 如果调用 then 时，promise已经成功，则执行 onFulfilled，并将promise的值作为参数传递进去。* 如果promise已经失败，那么执行 onRejected, 并将 promise 失败的原因作为参数传递进去。* 如果promise的状态是pending，需要将onFulfilled和onRejected函数存放起来，等待状态确定后，再依次将对应的函数执行(发布订阅)* 7. then 的参数 onFulfilled 和 onRejected 可以缺省* 8. promise 可以then多次，promise 的then 方法返回一个 promise* 9. 如果 then 返回的是一个结果，那么就会把这个结果作为参数，传递给下一个then的成功的回调(onFulfilled)* 10. 如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个then的失败的回调(onRejected)* 11.如果 then 返回的是一个promise,那么需要等这个promise，那么会等这个promise执行完，promise如果成功，* 就走下一个then的成功，如果失败，就走下一个then的失败*/
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  onDecided = [];

  status = PENDING;
  value = null;

  constructor(fn) {
    try {
      fn(this._resolve.bind(this), this._reject.bind(this));
    } catch (err) {
      this._reject(err);
    }
  }

  _resolve(value) {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.onDecided.forEach((obj) => obj.onFulfilled()); //PromiseA+ 2.2.6.1
    }
  }
  _reject(reason) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.value = reason;
      this.onDecided.forEach((obj) => obj.onRejected()); //PromiseA+ 2.2.6.2
    }
  }

  then(onFulfilled_, onRejected_) {
    let onFulfilled =
      typeof onFulfilled_ === "function"
        ? onFulfilled_
        : (value) => value;
    let onRejected =
      typeof onRejected_ === "function"
        ? onRejected_
        : (reason) => {
            throw reason;
          };

    let pro2 = new MyPromise((resolve, reject) => {
      if (this.status === PENDING) {
        let onDecided = {
          onRejected: () => {
            setTimeout(() => {
              try {
                let ret = onFulfilled(this.value);
                resolvePromise(pro2, ret, resolve, reject);
              } catch (err) {
                reject(err);
              }
            });
          },
          onFulfilled: () => {
            setTimeout(() => {
              try {
                let ret = onRejected(this.value);
                this.resolvePromise(pro2, ret, resolve, reject);
              } catch (err) {
                reject(err);
              }
            });
          },
        };

        this.onDecided.push(onDecided);
      } else {
        let callback =
          this.state === FULFILLED ? onFulfilled : onRejected;
        setTimeout(() => {
          try {
            //PromiseA+ 2.2.7.1
            let ret = callback(this.value);
            resolvePromise(pro2, ret, resolve, reject);
          } catch (err) {
            //PromiseA+ 2.2.7.2
            reject(err);
          }
        });
      }
    });
    return pro2;
  }
}

function resolvePromise(pro2, ret, resolve, reject) {
  if (pro2 === ret) {
    reject(new TypeError("Chaining cycle"));
  }
  if (
    (ret && typeof ret === "object") ||
    typeof ret === "function"
  ) {
    let used; //PromiseA+2.3.3.3.3 只能调用一次
    try {
      let then = ret.then;
      if (typeof then === "function") {
        //PromiseA+2.3.3
        then.call(
          ret,
          (y) => {
            //PromiseA+2.3.3.1
            if (used) return;
            used = true;
            resolvePromise(pro2, y, resolve, reject);
          },
          (r) => {
            //PromiseA+2.3.3.2
            if (used) return;
            used = true;
            reject(r);
          }
        );
      } else {
        //PromiseA+2.3.3.4
        if (used) return;
        used = true;
        resolve(ret);
      }
    } catch (err) {
      //PromiseA+ 2.3.3.2
      if (used) return;
      used = true;
      reject(err);
    }
  } else {
    //PromiseA+ 2.3.3.4
    resolve(ret);
  }
}

exports.deferred = () => {
  let dfd = {};
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

new MyPromise((resolve, reject) => {
  console.log("begin pro1");
  setTimeout(() => {
    reject("pro1 reject");
  }, 1000);
})
  .then(
    (result) => {
      console.log("result in pro2's resolve:", result);
      return result;
    },
    (error) => {
      console.log("error in pro2's reject:", error);
      return "error msg from pro2";
    }
  )
  .then((result) => {
    return new MyPromise((resolve) => {
      setTimeout(() => {
        console.log("result in pro3's resolve:", result);
        resolve("msg from pro3");
      }, 1000);
    });
  });
