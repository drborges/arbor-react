# arbor-react

Connects a React component to an Arbor store.

# Getting Started

A simple Counter APP...

```jsx
import React from "react"
import Store from "arbor-store"
import connect from "arbor-react"

const CounterApp = ({ counter }) => {
  return (
    <div>
      <span>{counter.count}</span>
      <button onClick={() => counter.count++} />
    </div>
  )
}

const store = new Store({
  counter: {
    count: 0,
  }
})

export default connect(store)(CounterApp)
```

Once an Arbor Store is connected to your React component, the store's state is
passed via props to the connected component. Regular JS mutations can be applied
to any non-primitive prop, under the hoods, Arbor uses proxies to ensure these
mutations do not happen in-place and rather, in an immutable fashion through
structural sharing, allowing React to re-render the UI in an optimal way. This
process behavior is very similar to Redux reducers.
