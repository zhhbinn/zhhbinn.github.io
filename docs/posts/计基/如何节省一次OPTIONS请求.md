当前端使用 XHR 或者 fetch 等其他方法请求一个跨域资源时，如果是非简单请求，浏览器会自动帮你先发出一个叫做预检（cors-preflight-request）的请求，对应的 HTTP 方法为 OPTIONS。这个请求对服务器是安全的，也就是说不会对服务器的资源做任何改变，仅仅用于确认 header 响应。

该请求 header 会包括以下两个字段：

- Access-Control-Request-Method
- Access-Control-Request-Headers：该字段的值对应当前请求可能会携带的额外的自定义的 header 字段名

对于 OPTIONS 请求，按照规范实现的服务端会响应一组 HTTP header，但不会返回任何实体内容。如果服务器支持该跨域请求，建议返回 2XX。如果不支持，建议返回 4XX。

响应的 header 可以包含以下字段：

- Access-Control-Allow-Origin
- Access-Control-Allow-Credentials：是否携带票据访问，为 true 时 Access-Control-Allow-Origin 不允许为\*
- Access-Control-Allow-Methods
- Access-Control-Allow-Headers
- Access-Control-Max-Age
- Access-Control-Expose-Headers

跨域的请求流程：

1. 当发起跨域请求时，如果是非简单请求，浏览器会自动帮我们自动触发预检请求，用于确认目标资源是否支持跨域，如果是简单请求，则不会触发预检，直接发出正常请求。
2. 浏览器根据服务器响应的 header 自动处理剩余的请求，如果响应支持跨域，则继续发出正常请求，如果不支持，则在控制台显示错误。

由此可见，当触发预检时，一次请求会小号两个 TTL，严重影响性能。

有两个方案可以节省掉 OPTIONS：

1. 发出简单请求
2. 服务器端设置 Access-Control-Max-Age，那么当第一次请求该 URL 时发出 OPTIONS 后，浏览器会根据返回的字段缓存该请求的预检请求的结果，（同时还取决于浏览器的支持的默认最大值）。在缓存的有效期内，该资源的请求（URL 和 header 字段都相同的情况下）不会再触发预检。注意，此缓存无法针对整个域或者模糊匹配 URL 做缓存。该方法很局限，可以考虑封装一下，固定一个接口地址，传不同的 body 内容。

所以一般下将请求改为简单请求比较好，此时必定不会触发预检。

简单请求的条件：

1. 请求方法必须是一下之一：GET，HEAD，POST
2. 只有以下 header 字段允许被修改或设置；

- Accept
- Accept-Language
- Content-language
- DPR、Downlink
- Save-Data
- Viewport-Width
- Width
- Content-Type（只可以被设置为为 application_x-www-form-urlencoded、multipart_form-data、text/plain。也就是说，如果请求的 Content-Type 被设置为 application/json;charset=utf-8 时也必然会触发预检。）
