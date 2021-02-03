## Vue 下的性能数据收集

_水平十分有限，如果理解错误，劳烦指正。_

### 普通 HTML

如果是传统 HTML，使用`window.performance`即可覆盖大部分的前端页面性能监控。

```js
console.log(window.performance.timing);

// {
// connectEnd: 1611559812293
// connectStart: 1611559812163
// domComplete: 1611559814245
// domContentLoadedEventEnd: 1611559812645
// domContentLoadedEventStart: 1611559812642
// domInteractive: 1611559812641
// domLoading: 1611559812546
// domainLookupEnd: 1611559812159
// domainLookupStart: 1611559812159
// fetchStart: 1611559812159
// loadEventEnd: 1611559814245
// loadEventStart: 1611559814245
// navigationStart: 1611559812158
// redirectEnd: 0
// redirectStart: 0
// requestStart: 1611559812294
// responseEnd: 1611559812595
// responseStart: 1611559812536
// secureConnectionStart: 1611559812165
// unloadEventEnd: 0
// unloadEventStart: 0
//}
```

不同定义的性能指标，基本都能通过该 API 提供的时间节点去计算。例如

```js
// 白屏时间
const PFT = domInteractive - fetchStart;
// 完全可交互时间
const FTTI = domComplete - fetchStart;
```

### Vue-Single Page Application

对于常见的基于 Vue 的 SPA 应用，上面提到的`window.performance`就不是很适用了。在 Vue 中，切换路由时，如果不刷新页面，performance 的值是不会更新的，一直都是初次渲染时的 performance 值。因此无法通过该 API 去获取每一个子路由切换时的渲染性能指标。

所以对于 SPA 具体的性能指标定义，以及打点的具体方案，有了以下的探（zhe）索（teng）。

#### vue-router（×）

一开始是打算使用 vue-router 的 2 个钩子：`beforeEach`和`afterEach`。分别在其中 new 时间戳，然后得到一个时间差。后来发现，这里的差值只是路由切换所消耗的时间，并不包括新组件页面的生命周期流程，没什么实际意义。

> 完整的导航解析流程：
> 导航被触发。
> 在失活的组件里调用 beforeRouteLeave 守卫。
> 调用全局的 beforeEach 守卫。
> 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
> 在路由配置里调用 beforeEnter。
> 解析异步路由组件。
> 在被激活的组件里调用 beforeRouteEnter。
> 调用全局的 beforeResolve 守卫 (2.5+)。
> 导航被确认。
> 调用全局的 afterEach 钩子。
> 触发 DOM 更新。
> 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。

#### Vue performance

我在 Vue 的官方文档中可以看到 performance 这个 API，使用时需要在 main.js 开启`Vue.config.performance = true`，且仅在开发环境下有效。
于是到 Vue 的源码中查找相关的实现。

```js
// src/core/instance/init.js
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  startTag = `vue-perf-start:${vm._uid}`;
  endTag = `vue-perf-end:${vm._uid}`;
  mark(startTag);
}
//... 省略中间代码

vm._self = vm;
initLifecycle(vm);
initEvents(vm);
initRender(vm);
callHook(vm, 'beforeCreate');
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
callHook(vm, 'created');

//...

if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  vm._name = formatComponentName(vm, false);
  mark(endTag);
  measure(`vue ${vm._name} init`, startTag, endTag);
}
```

这是 Vue 实例的初始化过程的一部分代码，十分容易理解。对于性能表现的时间打点，主要涉及到了`performance.mark`和`performance.measure`这 2 个 API。前者可以理解为做一个标记，后者可以理解为计算 2 个标记之间的时间戳。具体使用细节可以参考 MDN。上面的代码标记了初始化开始到 created 钩子函数运行后之间时间差。

```js
// src/platform/web/entry-runtime-with-compiler.js
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  mark('compile');
}

const { render, staticRenderFns } = compileToFunctions(
  template,
  {
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments,
  },
  this,
);
options.render = render;
options.staticRenderFns = staticRenderFns;

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  mark('compile end');
  measure(`vue ${this._name} compile`, 'compile', 'compile end');
}
```

这部分代码同样使用了 mark 和 measure，主要计算了编译的一个时间。

Vue 给出了一个方案，在关键的生命周期前后， 利用 mark 和 measure 打点， 可以计算出 Vue 实例初始化和编译渲染等周期的一个过程时间差。

#### Vue devtool

接着我又发现 Vue 的浏览器开发辅助工具 devtool 中也有 Performance 一栏。

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210126102940.png)

好奇的我又去扒了一下 devtool 的源码。

```js
//packages/app-backend/src/hook.js
hook.once('init', (Vue) => {
  hook.Vue = Vue;
  Vue.prototype.$inspect = function () {
    const fn = target.__VUE_DEVTOOLS_INSPECT__;
    fn && fn(this);
  };
});
```

可以看到，devtool 在此处接收了 Vue 的一个实例。结合 Vue 的源码可以知道，Vue 实例在 init 初始化时，会向 devtool`emit`Vue 实例。

```js
//src/platforms/web/runtime/index.js
if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      }
      //...
    }
  });
}
```

devtool 相关的一个计时逻辑如下。

```js
//packages/app-backend/src/perf.js
const COMPONENT_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroyed',
  'destroyed',
];

const RENDER_HOOKS = {
  beforeMount: { after: 'mountRender' },
  mounted: { before: 'mountRender' },
  beforeUpdate: { after: 'updateRender' },
  updated: { before: 'updateRender' },
};
//...
function applyHooks(vm) {
  if (vm.$options.$_devtoolsPerfHooks) return;
  vm.$options.$_devtoolsPerfHooks = true;

  const renderMetrics = {};

  COMPONENT_HOOKS.forEach((hook) => {
    const renderHook = RENDER_HOOKS[hook];

    const handler = function () {
      if (SharedData.recordPerf) {
        // Before
        const time = performance.now();
        if (renderHook && renderHook.before) {
          // Render hook ends before one hook
          const metric = renderMetrics[renderHook.before];
          if (metric) {
            metric.end = time;
            addComponentMetric(
              vm.$options,
              renderHook.before,
              metric.start,
              metric.end,
            );
          }
        }

        // After
        this.$once(`hook:${hook}`, () => {
          const newTime = performance.now();
          addComponentMetric(vm.$options, hook, time, newTime);
          if (renderHook && renderHook.after) {
            // Render hook starts after one hook
            renderMetrics[renderHook.after] = {
              start: newTime,
              end: 0,
            };
          }
        });
      }
    };
    const currentValue = vm.$options[hook];
    if (Array.isArray(currentValue)) {
      vm.$options[hook] = [handler, ...currentValue];
    } else if (typeof currentValue === 'function') {
      vm.$options[hook] = [handler, currentValue];
    } else {
      vm.$options[hook] = [handler];
    }
  });
}

function addComponentMetric(options, type, start, end) {
  const duration = end - start;
  const name = getComponentName(options);

  const metric = (componentMetrics[name] = componentMetrics[name] || {
    id: name,
    hooks: {},
    totalTime: 0,
  });

  const hook = (metric.hooks[type] = metric.hooks[type] || {
    count: 0,
    totalTime: 0,
  });
  hook.count++;
  hook.totalTime += duration;

  metric.totalTime += duration;

  bridge.send('perf:upsert-metric', { type: 'componentRender', data: metric });
}
```

上述`applyHooks`中的 HOOK 为组件的生命周期，其中包括了 2 组渲染 HOOK。其中渲染 HOOK 都是成对存在的，因此在 applyHook 函数中，通过判断 RENDER_HOOKS 对象中的 after 和 before，去构建一个成对的 startTime 和 endTime。然后利用`performance.now`去计算之间的时间差作为一个组件的渲染性能指标。

在`packages/app-backend/src/index.js`这个文件里，devtool 通过`scan()`去扫描页面遍历寻找根级别的 Vue 实例。接着通过递归去寻找子 Vue 实例。（此处逻辑有点多，建议仔细观看源码。反正我没怎么理解- -）。扫描完通过设置一个特殊的 id，将实例推进`instanceMap`中。

```js
function mark(instance) {
  if (!instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
    instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance);
    instance.$on('hook:beforeDestroy', function () {
      instanceMap.delete(instance.__VUE_DEVTOOLS_UID__);
    });
  }
}
```

接着调用`initPerfBackend`，将`instanceMap`中每个实例都遍历执行`applyHooks`。

~~#### Vue performance devtool（×）~~

~~又找到了一款插件 Vue performance devtool。它的作用和 Vue devtool 中的 performance 基本一致，于是我又又又扒了一下它的源码。~~

~~这款插件的遍历实例的思路和 Vue devtool 一致。也是扫描页面遍历寻找根级别的 Vue 实例接着寻找子实例。~~

~~接着的实例 hook，有一说一，我没有很看懂……~~

#### 结论

结合上述的代码，可以知道实际上 Vue 的性能监控的单位主要是实例（组件）级别的。但是业务中，我们一般需要的是路由页面级别的，也就意味着，某个页面当中具有多少组件，它们的具体时间是多少我并不关心（也不一定），但是我需要知道整个页面的性能指标。所以其实只能还是通过手动在特定的页面，特定的生命周期，比如`beforeCreate`和`created`，去加入时间打点。这个打点可以使用`performance.mark`和`performance.measure`，或者`performance.now`，甚至是`new Date().getTime()`。然后结合具体的业务去定义当前页面的一个性能指标。
