import React, { StrictMode, Suspense } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { proxy, useProxy, snapshot, subscribe } from '../src/index'
import { proxyWithComputed, attachComputed } from '../src/utils'

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

it('simple computed getters', async () => {
  const computeDouble = jest.fn((x) => x * 2)
  const state = proxyWithComputed(
    {
      text: '',
      count: 0,
    },
    {
      doubled: { get: (snap) => computeDouble(snap.count) },
    }
  )

  const callback = jest.fn()
  subscribe(state, callback)

  expect(snapshot(state)).toMatchObject({ text: '', count: 0, doubled: 0 })
  expect(computeDouble).toBeCalledTimes(1)
  expect(callback).toBeCalledTimes(0)

  state.count += 1
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: '', count: 1, doubled: 2 })
  expect(computeDouble).toBeCalledTimes(2)
  expect(callback).toBeCalledTimes(1)

  state.text = 'a'
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: 'a', count: 1, doubled: 2 })
  expect(computeDouble).toBeCalledTimes(2)
  expect(callback).toBeCalledTimes(2)
})

it('async compute getters', async () => {
  const state = proxyWithComputed(
    { count: 0 },
    {
      delayedCount: {
        get: async (snap) => {
          await sleep(10)
          return snap.count + 1
        },
      },
    }
  )

  const Counter: React.FC = () => {
    const snap = useProxy(state)
    return (
      <>
        <div>
          count: {snap.count}, delayedCount: {snap.delayedCount}
        </div>
        <button onClick={() => ++state.count}>button</button>
      </>
    )
  }

  const { getByText, findByText } = render(
    <StrictMode>
      <Suspense fallback="loading">
        <Counter />
      </Suspense>
    </StrictMode>
  )

  await findByText('loading')
  await findByText('count: 0, delayedCount: 1')

  fireEvent.click(getByText('button'))
  await findByText('loading')
  await findByText('count: 1, delayedCount: 2')
})

it('computed getters and setters', async () => {
  const computeDouble = jest.fn((x) => x * 2)
  const state = proxyWithComputed(
    {
      text: '',
      count: 0,
    },
    {
      doubled: {
        get: (snap) => computeDouble(snap.count),
        set: (state, newValue: number) => {
          state.count = newValue / 2
        },
      },
    }
  )

  expect(snapshot(state)).toMatchObject({ text: '', count: 0, doubled: 0 })
  expect(computeDouble).toBeCalledTimes(1)

  state.count += 1
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: '', count: 1, doubled: 2 })
  expect(computeDouble).toBeCalledTimes(2)

  state.doubled = 1
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: '', count: 0.5, doubled: 1 })
  expect(computeDouble).toBeCalledTimes(3)

  state.text = 'a'
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: 'a', count: 0.5, doubled: 1 })
  expect(computeDouble).toBeCalledTimes(3)
})

it('simple attachComputed', async () => {
  const computeDouble = jest.fn((x) => x * 2)
  const state = proxy({
    text: '',
    count: 0,
  })
  attachComputed(state, {
    doubled: (snap) => computeDouble(snap.count),
  })

  const callback = jest.fn()
  subscribe(state, callback)

  expect(snapshot(state)).toMatchObject({ text: '', count: 0, doubled: 0 })
  expect(computeDouble).toBeCalledTimes(1)
  expect(callback).toBeCalledTimes(0)

  state.count += 1
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: '', count: 1, doubled: 2 })
  expect(computeDouble).toBeCalledTimes(2)
  expect(callback).toBeCalledTimes(1)

  state.text = 'a'
  await Promise.resolve()
  expect(snapshot(state)).toMatchObject({ text: 'a', count: 1, doubled: 2 })
  expect(computeDouble).toBeCalledTimes(2)
  expect(callback).toBeCalledTimes(2)
})

it('async attachComputed', async () => {
  const state = proxy({ count: 0 })
  attachComputed(state, {
    delayedCount: async (snap) => {
      await sleep(10)
      return snap.count + 1
    },
  })

  const Counter: React.FC = () => {
    const snap = useProxy(
      state as { count: number; delayedCount: Promise<number> }
    )
    return (
      <>
        <div>
          count: {snap.count}, delayedCount: {snap.delayedCount}
        </div>
        <button onClick={() => ++state.count}>button</button>
      </>
    )
  }

  const { getByText, findByText } = render(
    <StrictMode>
      <Suspense fallback="loading">
        <Counter />
      </Suspense>
    </StrictMode>
  )

  await findByText('loading')
  await findByText('count: 0, delayedCount: 1')

  fireEvent.click(getByText('button'))
  await findByText('loading')
  await findByText('count: 1, delayedCount: 2')
})
