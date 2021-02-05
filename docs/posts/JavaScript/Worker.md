# 基本用法

## 构造

```js
var worker = new Worker('work.js');
```

Worker()构造函数的参数是一个脚本文件，该文件就是 Worker 线程所要执行的任务。由于 Worker 不能读取本地文件，所以这个脚本必须来自网络。如果下载没有成功（比如 404 错误），Worker 就会默默地失败。

## 通讯

### 主线程

主线程通过`worker.postMessage()`向 Worker 发送消息。该方法的参数，就是主线程传给 Worker 的数据。它可以是各种数据类型，包括二进制数据。

```js
  worker.postMessage('Hello');
  worker.postMessage({method:'echo',args:['work]});
```

主线程通过`worker.onmessage`指定监听函数，接收子线程的消息。

```js
worker.onmessage = function(event) {
  // do sth
};
```

主线程可以通过`worker.terminate()`关掉子线程。

### 子线程

子线程里面可以有一个监听函数监听 message 事件。其中 self 代表子线程自身，相当于子线程的全局变量。

```js
self.addEventListener('message', function(e) {
  // do sth
});

// 或者;

self.onmessage = function(e) {
  // do sth
};
```

子线程可以通过`self.postMessage()`向主线程发送消息。

## 错误处理

主线程可以监听 worker 是否发生错误。

```js
worker.onerror((e) => {
  //do sth
});
```

## 传值

实际上主线程和子线程的通信是拷贝关系，worker 对通信内容的修改不会影响到主线程。但是该方式的通讯对于大文件可能会影响到性能，所以可以直接转移数据的控制权。

```js
worker.postMessage(arrayBuffer, [arrayBuffer]);

// 例子
let ab = new ArrayBuffer(1);
worker.postMessage(ab, [ab]);
```

> 拷贝方式发送二进制数据，会造成性能问题。比如，主线程向 Worker 发送一个 500MB 文件，默认情况下浏览器会生成一个原文件的拷贝。为了解决这个问题，JavaScript 允许主线程把二进制数据直接转移给子线程，但是一旦转移，主线程就无法再使用这些二进制数据了，这是为了防止出现多个线程同时修改数据的麻烦局面。这种转移数据的方法，叫做 Transferable Objects。这使得主线程可以快速把数据交给 Worker，对于影像处理、声音处理、3D 运算等就非常方便了，不会产生性能负担。

## API

### 主线程

```js
  Worker.onerror：指定 error 事件的监听函数。
  Worker.onmessage：指定 message 事件的监听函数，发送过来的数据在Event.data属性中。
  Worker.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
  Worker.postMessage()：向 Worker 线程发送消息。
  Worker.terminate()：立即终止 Worker 线程。
```

### 子线程

```js
  self.name： Worker 的名字。该属性只读，由构造函数指定。
  self.onmessage：指定message事件的监听函数。
  self.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
  self.close()：关闭 Worker 线程。
  self.postMessage()：向产生这个 Worker 线程发送消息。
  self.importScripts()：加载 JS 脚本。
```

# 嵌入式 worker

> 可在主线程的页面嵌入 worker，脚本写在数据块中。如果一个 `<script>` 标签没有 src 特性，并且它的 type 特性没有指定成一个可运行的 mime-type，那么它就会被认为是一个数据块元素，并且能够被 JavaScript 使用。「数据块」是 HTML5 中一个十分常见的特性，它可以携带几乎任何文本类型的数据。

```html
<script type="app/worker" id="worker">
  <!-- 脚本内容 -->
</script>

<script type="text/javascript">
  const blob = new Blob([document.querySelector('#worker').textContent]);
  const url = window.URL.createObjectURL(blob);
  let worker = new Worker(url);
</script>
```

# 尝试

尝试将 supplier-static 的导出插件使用嵌入式 worker，从而避免使用将插件重复部署到 supplier-web 上。

1. 现将 worker 脚本通过`new Blob()`和`window.URL.createObjectURL(blob)`转成 url，像上述例子操作。遇到问题:worker 脚本里包含使用 import scripts 别的脚本，通过 Blob 转制后无法正确引用对应 js 资源。原因：

> 原因在于通过 window.URL.createObjectURL 生成的 blob 链接，指向的是内存中的数据，这些数据只为当前页面提供服务，因此，在浏览器的地址栏中访问 blob 链接，并不会找到实际的文件；同样的，我们在 blob 链接指向的内存数据中访问相对地址，肯定是找不到任何东西的。

2.尝试将需要引入的资源也采取`new Blob()`和`window.URL.createObjectURL(blob)`转成 url，再进行 import script，却一直报错，提示类型不对。

> Refused to execute script from 'http://local.test-g.qipeipu.net:8081/3f535210-a676-4263-8e86-44ec2b05d5e0' because its MIME type ('text/html') is not executable.

> Uncaught DOMException: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://local.test-g.qipeipu.net:8081/3f535210-a676-4263-8e86-44ec2b05d5e0' failed to load.

3.import scripts 可以引入网络地址的 js，且没有跨域问题，因此可以考虑将需要外部引入的 js 放于静态资源服务器，这个虽然无法彻底摆脱使用静态资源托管的问题，但至少不需要考虑跨域问题。

> 如果想要在这种场景中访问文件，那我们必须向服务器发送 HTTP 请求来获取数据。

# 拓展

- Blob
- window.URL.createObjectURL
- MIME type
