| 时间       |
| ---------- |
| 2021-03-10 |

这几天实际使用了 Sequelize 的关联查询，特别是多对多关系，有几个点需要注意一下。

1. 定义模型关系时，最好是成对定义。原因文档有所说明。
2. 定义模型时，各属性作用如下

```js
Model.user.belongsToMany(Model.role, {
  foreignKey: 'A', //联结表中与表user对应的字段
  otherKey: 'B', //联结表中与表role对应的字段
  sourceKey: 'C', //指定表user中的外键
  targetKey: 'D', //指定表role中的外键
  through: {
    model: Model.userRole, // 联结表userRole
    scope: {
      // 联结表userRole的作用域，可理解为对于联结表的where查询
      status: 1,
    },
  },
});
```

作用域的详情内容可参考文档的 [配置多对多多态关联](https://www.sequelize.com.cn/advanced-association-concepts/polymorphic-associations#%E9%85%8D%E7%BD%AE%E5%A4%9A%E5%AF%B9%E5%A4%9A%E5%A4%9A%E6%80%81%E5%85%B3%E8%81%94)
