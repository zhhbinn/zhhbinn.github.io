### 函数声明

```js
function checkName() {}

function checkEmail() {}
```

### 函数的表达式

```js
var checkName = function() {};

var checkEmail = function() {};
```

### 用对象收编变量

```js
var CheckObject = {
  checkName: function() {},
  checkEmail: function() {},
};

CheckObject.checkName();
```

### 对象的另一种形式

```js
var CheckObject = function() {};

CheckObject.checkName = function() {};

CheckObject.checkEmail = function() {};
```

这个对象是不能复制的，或者说这个对象类在用 new 关键字创建新的对象时，新创建的对象是不能继承这些方法的。

### 真假对象

```js
var CheckObject = function() {
  return {
    checkName: function() {},
    checkEmail: function() {},
  };
};
var a = CheckObject();
a.checkName();
```

当每次调用这个函数的时候，把里层的对象返回出来。这不是一个真正意义上类的创建方式，并且创建的对象 a 和对象 CheckObject 没有任何关系。

### 类

```js
var CheckObject = function() {
  this.checkName = function() {};
  this.checkEmail = function() {};
};

var a = new CheckObject();
a.checkName();
```

每次对类实例化，都会有一套属于自己的方法。因为所有的方法都在函数内部，通过 this 定义，所以每次通过 new 关键字创建新对象的时候,新创建的对象都会对类的 this 上的属性进行复制，所以这些新创建的对象都会有自己的一套方法，不过有时候这么做造成的消耗是很奢侈的。

所以应该改进一下：

```js
var CheckObject = function() {
  CheckObject.prototype.checkName = function() {};
  CheckObject.prototype.checkEmail = function() {};
};
```

这样创建对象实例的时候，创建出来的对象所拥有的方法就都是一个了，因为它们都要以来 prototype 原型一次寻找，而找到的方法都是同一个，他们都绑在 CheckObject 的原型上。

简写：

```js
var CheckObject = function() {
  CheckObject.prototype = {
    checkName: function() {},
    checkEmail: function() {},
  };
};
```

### 方法的另一种使用方法（链式调用）

```js
var CheckObject = {
  checkName: function() {
    return this;
  },
  checkEmail: function() {
    return this;
  },
};

CheckObject.checkName().checkEmail();
```

同样的方式也可以用到类的原型当中：

```js
var CheckObject = function() {
  CheckObject.prototype = {
    checkName: function() {
      return this;
    },
    checkEmail: function() {
      return this;
    },
  };
};
```
