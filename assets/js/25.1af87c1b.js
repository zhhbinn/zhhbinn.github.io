(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{388:function(_,v,l){"use strict";l.r(v);var i=l(25),t=Object(i.a)({},(function(){var _=this,v=_.$createElement,l=_._self._c||v;return l("ContentSlotsDistributor",{attrs:{"slot-key":_.$parent.slotKey}},[l("p",[_._v("大致流程：")]),_._v(" "),l("ol",[l("li",[_._v("微信支付用户点击消息或者扫描二维码在微信浏览器打开了商户 H5 页面，接着在页面请求生成支付订单")]),_._v(" "),l("li",[_._v("商户的后台系统生成商户订单，并且调用统一下单 API")]),_._v(" "),l("li",[_._v("微信支付系统返回预付单的信息（prepay_id）")]),_._v(" "),l("li",[_._v("商户的后台系统生成 JS-API 页面调用的支付参数并签名，然后给微信客户端返回支付参数（prepay_id，paySign）")]),_._v(" "),l("li",[_._v("用户点击发起支付")]),_._v(" "),l("li",[_._v("JS-API 接口向微信支付系统请求支付")]),_._v(" "),l("li",[_._v("微信支付系统检查参数的合法性和授权域权限，并返回验证结果，并要求支付授权")]),_._v(" "),l("li",[_._v("微信客户端提示输入密码")]),_._v(" "),l("li",[_._v("用户确认支付输入密码，并提交支付授权到微信支付系统")]),_._v(" "),l("li",[_._v("微信支付系统验证授权，异步通知商户支付结果")]),_._v(" "),l("li",[_._v("商户后台告知微信支付系统处理结果")]),_._v(" "),l("li",[_._v("微信支付系统同时返回支付结果给微信客户端，并发微信消息提示展示给用户")]),_._v(" "),l("li",[_._v("微信客户端跳转回商户 H5 页面")]),_._v(" "),l("li",[_._v("微信客户端查询商户后台支付结果")]),_._v(" "),l("li",[_._v("商户发货及支付后个性化页面提示")])])])}),[],!1,null,null,null);v.default=t.exports}}]);