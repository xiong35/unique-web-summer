class MyRedux {
  reducer = () => {};
  state = {};
  listeners = [];

  createStore = (handler) => {
    this.reducer = handler;
    this.state = handler();

    this.listeners = [];

    let getState = () => {
      return this.state;
    };

    let subscribe = (curListener) => {
      this.listeners.push(curListener);
      return () => {
        this.listeners = this.listeners.filter((item) => {
          return item !== curListener;
        });
      };
    };

    let dispatch = (action) => {
      this.state = this.reducer(this.state, action);
      this.listeners.forEach((listener) => {
        listener();
      });
    };

    let replaceReducer = (handler) => {
      this.reducer = handler;
    };

    return {
      getState,
      subscribe,
      dispatch,
      replaceReducer,
    };
  };

  combineReducers = (reducers) => {
    return (state = {}, action) => {
      return Object.keys(reducers).reduce((nextState, key) => {
        nextState[key] = reducers[key](state[key], action);
        return nextState;
      }, {});
    };
  };
}
