## typeof g()

```js
var f = function g() {
  return 12;
};

typeof g();

// error
```

## Object.freeze

```js
Object.freeze()
// 冻结一个对象，使得这个对象再不能增加删除修改属性
和const不同的是，const定义的是一个不能再重新分配，不能再修改的变量，而Object.freeze是使得对象具有不可变性
```

## for...in ，Object.keys，Object.getOwnPropertyNames

- for...in 用于枚举可枚举属性，包括原型链上的属性，具有顺序不确定性，不建议遍历数组
- Object.keys 用于枚举自身的可枚举属性，不包括原型链上的
- Object.getOwnPropertyNames 用于枚举自身的可枚举属性和不可枚举属性

## map、parseInt

```js
['1', '2', '3'].map(parseInt); //1,NaN,NaN
```

因为 map 的第一个参数是回调函数，而这个回调函数可以接收三个参数，第一个是当前被处理的参数，第二个是当前被处理的参数的 Index。

因此上述代码实际是：

```js
parseInt('1', 0);
parseInt('2', 1);
parseInt('3', 2);
```

对于 parseInt 来说，第一个参数是要被处理的字符串，第二个参数是解析时的基数，且基数是一个介于 2 和 36 之间的整数

因此：

```js
parseInt('1', 0); //radix为0时，且string参数不以“0x”和“0”开头时，按照10为基数处理。这个时候返回1
parseInt('2', 1); //基数为1（1进制）表示的数中，最大值小于2，所以无法解析，返回NaN，且基数小于2
parseInt('3', 2); //基数为2（2进制）表示的数中，最大值小于3，所以无法解析，返回NaN
```

## 转来转去

在 JS 中，除了 0、“”、null、undefined、NaN 和 false 是假值外，其他的都是真值。空数组[]也是真值。

- 可以使用!运算符来切换 true 和 false
- 可以使用+运算符和后面跟上一个空字符串，将数字转换成字符串

```js
const val = 1 + '';
console.log(val); //"1"
console.log(typeof val); //string
```

- 可以使用+运算符，将字符串或者布尔值转换为数字

```js
let int = '15';
int = +int;

console.log(+true); //1
```

- 在某些情况下（比如字符串），+运算符会被解析成连接操作，这种情况下可以使用两个波浪号~~（两次按位取反）

```js
const int = '15';
int = ~~int;
```

## 过滤唯一值

ES6 中的 Set 对象和延展语法...，可以用来创建一个只包含唯一值的数组。

```js
const array = [1, 1, 2, 3, 4, 4, 1];
const uniqueArray = [...new Set(array)];
console.log(uniqueArray); // [1,2,3,4]
```

这个技巧只支持包含原始类型的数组：undefined，null，boolean，string，number。如果数组包含了对象，函数或者其他嵌套数组就不能使用这种方法了。
