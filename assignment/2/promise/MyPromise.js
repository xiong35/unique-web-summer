/* class MyPromise {
  constructor() {
    console.log("00Z");
  }
  then(onFulfilled, onRejected) {
    //check if args are function
    // onFulfilled only triger once after fulfilled
    // onRejected only triger once after rejected
    //onFulfilled或onRejected在执行上下文堆栈仅包含平台代码之前不得调用。[ 3.1 ]???
    //If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
    //If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1
  }
} */

class MyPromise {
  callbackObjs = [];

  state = "pending";
  value = null;

  constructor(fn) {
    /* 
    fn: 
      传入的回调, 如:
      (resolve) => {
        setTimeout(() => {
          console.log("done");
          resolve("5秒");
        }, 5000);
      };

    this._resolve.bind(this):
      把绑定好的 _resolve 函数赋值给 fn 的参数 resolve
      异步操作结束后就会调用这个类里的 _resolve 回调, 触发所有then函数
    */
    fn(this._resolve.bind(this), this._reject.bind(this));
  }

  then(onFulfilled, onRejected) {
    /*then 方法可以被同一个 promise 调用多次
        当 promise 成功执行时，所有 onFulfilled 需按照其注册顺序依次回调
        当 promise 被拒绝执行时，所有的 onRejected 需按照其注册顺序依次回调 */
    const pro = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        this._handle(
          {
            // 如果then没有传东西, 即
            // 如果 onFulfilled 不是函数且 promise1 成功执行/被拒绝
            // promise2 必须成功/拒绝执行并返回相同的值/据因
            onFulfilled: onFulfilled || null,
            onRejected: onRejected || null,
            resolve,
            reject,
          },
          pro
        );
      });
    });
    return pro;
  }

  catch(onError) {
    return this.then(null, onError);
  }

  finally(onDone) {
    if (typeof onDone !== "function") return this.then();
    let Pro = this.constructor;
    return this.then(
      (value) => Pro.resolve(onDone()).then(() => value),
      (reason) =>
        Pro.resolve(onDone()).then(() => {
          throw reason;
        })
    );
  }

  _handle(callbackObj, pro) {
    if (this.state === "pending") {
      this.callbackObjs.push(callbackObj);
      return;
    }
    let callback =
      this.state === "fulfilled"
        ? callbackObj.onFulfilled
        : callbackObj.onRejected;
    let decition =
      this.state === "fulfilled"
        ? callbackObj.resolve
        : callbackObj.reject;

    if (!callback) {
      // 如果 onFulfilled 不是函数且 promise1 成功执行/被拒绝
      // promise2 必须成功/拒绝执行并返回相同的值/据因

      // 不论 promise1 被 reject 还是被 resolve 时 promise2 都会被 resolve
      // 只有出现异常时才会被 rejected。

      decition(this.value);
      return;
    }
    // 把promise fulfill了的值传给下一个promise
    // 并且激活下一个primise, 获得他的返回值(可能是一个新的promise)
    let ret;

    try {
      ret = callback(this.value);
    } catch (err) {
      ret = err;
      decition = callbackObj.reject;
    } finally {
      if (ret === pro) {
        callbackObj.reject(new TypeError("Chaining cycle"));
        return;
      }
      // 这里的resolve实际上是 promise2 的 _resolve
      // 通过这样的调用来改变/通知 promise2
      // 让上一个promise确定下来
      // 如果给了一个promise, 就将现在的_resolve当作promise的resolve
      // -然后激活这个promise的then
      // -所以下一个promise自己和then都被激活了
      // 且下一个promise的onFulfill==
      // 相当于重新起了一个promise
      decition(ret);
    }
  }

  /* 
  resolve / reject 只是作为信使传递到下一个promise中的
  作用仅在于通知上一个pronise调用完成
  onFulfilled 只是作为成功时执行的回调
  */

  _resolve(value) {
    /* 
    如果 value 为对象或者函数：

    把 value.then 赋值给 then
    如果取 value.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
    如果 then 是函数，将 value 作为函数的作用域 this 调用之。传递两个回调函数作为参数，
    -第一个参数叫做 resolvePromise
    -第二个参数叫做 rejectPromise
      如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
      如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
      如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      如果调用 then 方法抛出了异常 e：
        如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
        否则以 e 为据因拒绝 promise
      如果 then 不是函数，以 value 为参数执行 promise
    */
    if (typeof value === "object" || typeof value === "function") {
      let then = value.then;
      if (typeof then === "function") {
        /* 
        如果是 Promise 实例(有 then 方法)
        就把当前 Promise 实例的状态改变接口重新注册到 resolve 的值对应的 Promise 的 onFulfilled 中
        也就是说当前 Promise 实例的状态要依赖 resolve 的值的 Promise 实例的状态
        
        因为then本来是value.then,它被拿出来赋值给一个变量
        如果直接then()这么调用调用时this就不是value了
        所以通过then.call(value,xxx)让value重新指定为this
        */
        then.call(
          value,
          this._resolve.bind(this),
          this._reject.bind(this)
        );
        return;
      }
    }
    /* 
    value 为对象或函数
    如果 value 不为对象或者函数，以 value 为参数执行 promise */
    this.state = "fulfilled"; //改变状态
    this.value = value; //保存结果
    this.callbackObjs.forEach((callbackObj) =>
      this._handle(callbackObj)
    );
  }

  _reject(error) {
    if (typeof error === "object" || typeof error === "function") {
      let then = error.then;
      if (typeof then === "function") {
        then.call(
          error,
          this._resolve.bind(this),
          this._reject.bind(this)
        );
        return;
      }
    }
    this.state = "rejected";
    this.value = error;
    this.callbackObjs.forEach((callbackObj) =>
      this._handle(callbackObj)
    );
  }

  static resolve(value) {
    if (value && value instanceof MyPromise) {
      return value;
    } else if (
      value &&
      typeof value === "object" &&
      typeof value.then === "function"
    ) {
      let then = value.then;
      return new MyPromise((resolve) => {
        then(resolve);
      });
    } else if (value) {
      return new MyPromise((resolve) => resolve(value));
    } else {
      return new MyPromise((resolve) => resolve());
    }
  }

  static reject(value) {
    if (
      value &&
      typeof value === "object" &&
      typeof value.then === "function"
    ) {
      let then = value.then;
      return new Promise((_, reject) => {
        then(reject);
      });
    } else {
      return new Promise((_, reject) => reject(value));
    }
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let fulfilledCount = 0;
      const itemNum = promises.length;
      const rets = Array(itemNum);
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (result) => {
            fulfilledCount++;
            rets[index] = result;
            if (fulfilledCount === itemNum) {
              resolve(rets);
            }
          },
          (reason) => reject(reason)
        );
      });
    });
  }

  static race(promises) {
    return new Promise(function (resolve, reject) {
      promises.forEach((promise) => {
        Promise.resolve(promise).then(
          (value) => {
            return resolve(value);
          },
          (reason) => {
            return reject(reason);
          }
        );
      });
    });
  }
}

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
  .catch((err) => {
    console.log("catch:", err);
    return MyPromise.resolve("catch msg");
  })
  .then((result) => {
    return new MyPromise((resolve) => {
      setTimeout(() => {
        console.log("result in pro3's resolve:", result);
        resolve("msg from pro3");
      }, 1000);
    });
  })
  .finally(() => {
    console.log("onDone");
  });

exports.deferred = () => {
  let dfd = {};
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
