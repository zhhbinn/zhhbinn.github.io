## 异步加载 js，async 和 defer

```html
<!-- 立即加载并执行脚本 -->
<script src=""></script>

<!-- 并行下载js，下载完立即执行，不会根据页面的script顺序 -->
<script async src=""></script>

<!-- 并行下载js，会在文档加载结束后，按照页面的script顺序执行js -->
<script defer src=""></script>
```

## e.target 和 e.currentTarget 区别

```html
<ul @click="a">
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
```

点击第一个 li 时，a 事件里打印出来的 e.target 是 li，e.currentTarget 是 ul
