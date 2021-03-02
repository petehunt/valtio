<img src="logo.svg" alt="valtio">
<br />
<br />

<code>npm i valtio</code> makes proxy-state simple

[![Build Status](https://img.shields.io/github/workflow/status/pmndrs/valtio/Lint?style=flat&colorA=000000&colorB=000000)](https://github.com/pmndrs/valtio/actions?query=workflow%3ALint)
[![Build Size](https://img.shields.io/bundlephobia/min/valtio?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=valtio)
[![Version](https://img.shields.io/npm/v/valtio?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/valtio)
[![Downloads](https://img.shields.io/npm/dt/valtio.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/valtio)
[![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/poimandres)

#### Wrap your state object

Valtio turns the object you pass it into a self-aware proxy.

```jsx
import { proxy, useProxy } from 'valtio'

const [useSnapshot, setState] = proxy({ count: 0, text: 'hello' })
```

#### Mutate from anywhere

```jsx
setInterval(() => {
  setState(prev => ({...prev, count: prev.count + 1}));
}, 1000)
```

#### React via useProxy

Create a local snapshot that catches changes. Rule of thumb: read from snapshots, mutate the source. The component will only re-render when the parts of the state you access have changed, it is render-optimized.

```jsx
function Counter() {
  const snapshot = useSnapshot();
  return (
    <div>
      {snapshot.count}
      <button onClick={() => setState(prev => ({...prev, count: count + 1}))}>+1</button>
    </div>
  )
}
```
