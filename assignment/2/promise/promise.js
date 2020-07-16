const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  status = PENDING;
  onDecided = [];
  value = null;

  constructor(fn) {
    try {
      fn(this._resolve.bind(this), this._reject.bind(this));
    } catch (err) {
      reject(err);
    }
  }

  _resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.onDecided.forEach((obj) => obj.onFulfilled());
    }
  };
  _reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.value = reason;
      this.onDecided.forEach((obj) => obj.onRejected());
    }
  };

  then = (onFulfilled, onRejected) => {
    onFulfilled =
      typeof onFulfilled === "function"
        ? onFulfilled
        : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };
    let pro2 = new Promise((resolve, reject) => {
      if (this.status === PENDING) {
        let callbackObj = {
          onFulfilled: () => {
            setTimeout(() => {
              try {
                let ret = onFulfilled(this.value);
                resolvePromise(pro2, ret, resolve, reject);
              } catch (err) {
                reject(err);
              }
            });
          },
          onRejected: () => {
            setTimeout(() => {
              try {
                let ret = onRejected(this.value);
                resolvePromise(pro2, ret, resolve, reject);
              } catch (err) {
                reject(err);
              }
            });
          },
        };
        this.onDecided.push(callbackObj);
      } else {
        let callback =
          this.status === FULFILLED ? onFulfilled : onRejected;

        setTimeout(() => {
          try {
            let ret = callback(this.value);
            resolvePromise(pro2, ret, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
    });
    return pro2;
  };

  catch = (onError) => {
    return this.then(null, onError);
  };

  finally = (onDone) => {
    if (typeof onDone !== "function") return this.then();
    return this.then(
      (value) => MyPromise.resolve(onDone()).then(() => value),
      (reason) =>
        MyPromise.resolve(onDone()).then(() => {
          throw reason;
        })
    );
  };

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

function resolvePromise(pro2, ret, resolve, reject) {
  if (pro2 === ret) {
    reject(new TypeError("Chaining cycle"));
  }
  if (
    (ret && typeof ret === "object") ||
    typeof ret === "function"
  ) {
    let used;
    try {
      let then = ret.then;
      if (typeof then === "function") {
        then.call(
          ret,
          (y) => {
            if (used) return;
            used = true;
            resolvePromise(pro2, y, resolve, reject);
          },
          (r) => {
            if (used) return;
            used = true;
            reject(r);
          }
        );
      } else {
        if (used) return;
        used = true;
        resolve(ret);
      }
    } catch (err) {
      if (used) return;
      used = true;
      reject(err);
    }
  } else {
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
