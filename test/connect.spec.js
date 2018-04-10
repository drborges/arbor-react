import React from "react"
import sinon from "sinon"
import { expect } from "chai"
import { mount } from "enzyme"

import Arbor, { connect } from "../src"

describe("connect", () => {
  const Counter = ({ counter }) => {
    return (
      <div>
        <span>{counter.count}</span>
        <button onClick={() => counter.count++} />
      </div>
    )
  }

  it("subscribes a React component to store mutations", () => {
    const store = new Arbor({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    const wrapper = mount(<CounterApp />)

    store.state.counter.count++

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("1")

    store.state.counter.count++

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("2")
  })

  it("can mutate state from within a stateless component", () => {
    const store = new Arbor({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    const wrapper = mount(<CounterApp />)

    wrapper.find("button").props().onClick()

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("1")

    wrapper.find("button").props().onClick()

    wrapper.update()

    expect(wrapper.find("span")).to.have.text("2")
  })

  it("unsubscribes a React component from store mutations", () => {
    const store = new Arbor({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    const wrapper = mount(<CounterApp />)

    expect(store.tree.pubsub.subscriptions["/"]).to.not.be.empty

    wrapper.instance().componentWillUnmount()

    expect(store.tree.pubsub.subscriptions["/"]).to.be.empty
  })

  it("provides a human-friendly displayName to the connected component", () => {
    const store = new Arbor({ counter: { count: 0 } })
    const CounterApp = connect(store)(Counter)

    expect(CounterApp.displayName).to.eq("Connect(Counter)")
  })

  it("forwards the props to the wrapped component", () => {
    const App = (props) => (
      <div>
        <span>{props.description}</span>
        <span>{props.name}</span>
        <span>{props.number}</span>
      </div>
    )

    const store = new Arbor({ description: "foo" })
    const ConnectedApp = connect(store)(App)

    const wrapper = mount(<ConnectedApp name="bar" number={10}/>)

    expect(wrapper.find(App).props()).to.deep.equal({
      description: "foo",
      name: "bar",
      number: 10,
    })
  })
})
