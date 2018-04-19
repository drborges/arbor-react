import React from "react"
import sinon from "sinon"
import { expect } from "chai"
import { mount } from "enzyme"

import Arbor, { connect } from "../src"

const StatelessCounter = ({ counter }) => {
  return (
    <div>
      <span>{counter.count}</span>
      <button onClick={() => counter.count++} />
    </div>
  )
}

class Counter extends React.PureComponent {
  render() {
    return (
      <span>{`${this.props.label}: ${this.props.counter.count}`}</span>
    )
  }
}

class App extends React.PureComponent {
  state = {
    count: 0
  }

  incInternalCounter = () => {
    this.setState({
      count: this.state.count + 1
    })
  }

  render() {
    return (
      <div>
        <Counter label="Internal Count" counter={this.state} />
        <Counter label="Store Count" counter={this.props.counter} />
      </div>
    )
  }
}

describe("connect", () => {
  it("subscribes a React component to store mutations", () => {
    const store = new Arbor({ counter: { count: 0 } })
    const CounterApp = connect(store)(StatelessCounter)

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
    const CounterApp = connect(store)(StatelessCounter)

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
    const CounterApp = connect(store)(StatelessCounter)

    const wrapper = mount(<CounterApp />)

    expect(store.subscriptions.subscribers).to.not.be.empty

    wrapper.instance().componentWillUnmount()

    expect(store.subscriptions.subscribers).to.be.empty
  })

  it("provides a human-friendly displayName to the connected component", () => {
    const store = new Arbor({ counter: { count: 0 } })
    const CounterApp = connect(store)(StatelessCounter)

    expect(CounterApp.displayName).to.eq("Connect(StatelessCounter)")
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

    const wrapper = mount(<ConnectedApp name="bar" number={10} />)

    expect(wrapper.find(App).props()).to.deep.equal({
      description: "foo",
      name: "bar",
      number: 10,
    })
  })

  context("Internal State", () => {
    it("allows components to have additional internal state", () => {
      const store = new Arbor({
        counter: {
          count: 1
        }
      })

      const ConnectedApp = connect(store)(App)
      const wrapper = mount(<ConnectedApp />)
      const spans = wrapper.find("span")

      expect(spans.first()).to.have.text("Internal Count: 0")
      expect(spans.last()).to.have.text("Store Count: 1")
    })

    it("mutates internal state without affecting the store", () => {
      const store = new Arbor({
        counter: {
          count: 1
        }
      })

      const ConnectedApp = connect(store)(App)
      const wrapper = mount(<ConnectedApp />)

      wrapper.find(App).instance().incInternalCounter()

      const spans = wrapper.find("span")

      expect(spans.first()).to.have.text("Internal Count: 1")
      expect(spans.last()).to.have.text("Store Count: 1")
    })

    it("mutates store without affecting internal state", () => {
      const store = new Arbor({
        counter: {
          count: 1
        }
      })

      const ConnectedApp = connect(store)(App)
      store.state.counter.count++

      const wrapper = mount(<ConnectedApp />)
      const spans = wrapper.find("span")

      expect(spans.first()).to.have.text("Internal Count: 0")
      expect(spans.last()).to.have.text("Store Count: 2")
    })
  })

  context("PureComponent", () => {
    it("does not re-render if neither props nor state have changed", () => {
      const store = new Arbor({
        counter: {
          count: 1
        }
      })

      const ConnectedApp = connect(store)(App)

      const wrapper = mount(<ConnectedApp />)
      const internalCounterRender = sinon.spy(wrapper.find(Counter).first().instance(), "render")
      const storeCounterRender = sinon.spy(wrapper.find(Counter).last().instance(), "render")

      store.state.unusedProp = true

      expect(internalCounterRender).to.have.not.been.called
      expect(storeCounterRender).to.have.not.been.called
    })
  })
})
