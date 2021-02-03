# Sequelize 入门

> https://www.sequelize.com.cn/

## 模型基础

### 定义

> 在内部,sequelize.define 调用 Model.init,因此两种方法本质上是等效的.

```js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define(
  'User',
  {
    // 在这里定义模型属性
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull 默认为 true
    },
  },
  {
    // 这是其他模型参数
  },
);

// `sequelize.define` 会返回模型
console.log(User === sequelize.models.User); // true
```

```js
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory');

class User extends Model {}

User.init(
  {
    // 在这里定义模型属性
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull 默认为 true
    },
  },
  {
    // 这是其他模型参数
    sequelize, // 我们需要传递连接实例
    modelName: 'User', // 我们需要选择模型名称
  },
);

// 定义的模型是类本身
console.log(User === sequelize.models.User); // true
```

### 表面推断

> 默认情况下,当未提供表名时,Sequelize 会自动将模型名复数并将其用作表名. 这种复数是通过称为 inflection 的库在后台完成的,因此可以正确计算不规则的复数(例如 person -> people)

### 数据类型

### 列参数

## 模型实例

假设模型是 User 类，模型都是 ES6 类，jane 为类的实例

### 创建实例

```js
User.build();
jane.save();

// 等于
User.create();
```

#### 默认值

```js
User.create({ name: 'test' });
```

#### 实例记录

```js
jane.toJSON();
```

### 更新实例

#### 赋值后调用

```js
jane.save();
```

#### 仅保存部分字段

```js
jane.save({ fields: ['name'] });
```

### 删除实例

```js
jane.destroy();
```

### 重载实例

```js
jane.reload();
```

### 递增和递减整数值

```js
jane.increment('age', { by: 2 });
jane.decrement({ age: 10, year: 100 });
```

## 模型查询

### insert 查询

```js
// 这可以限制 User 模型只设置 name，而不设置 age
User.create({ name: '1', age: 1 }, { fields: ['name'] });
```

### > select 查询

#### 直接读取整张表

```js
User.findAll()

> select * from User;
```

#### 查询特定属性

```js
User.findAll({
  attributes:['foo','bar]
})

> select foo,bar from User;

// 可以用嵌套数组来重命名属性
User.findAll({
  attributes:['foo',['bar','qar']]
})

> select foo,bar AS qar from User;

// 聚合函数 AVG，COUNT（行数），SUM，MIN，MAX
User.findAll({
  attributes:[
    'foo',
    [sequelize.fn('COUNT',sequelize.col('hats')),'n_hats']
  ]
})

> select foo,COUNT(cats) as n_hats from User;

// 有时,如果只想添加聚合,那么列出模型的所有属性可能会很麻烦
User.findAll({
  attributes:[
    'foo','qar',
    [sequelize.fn('COUNT', sequelize.col('hats')), 'n_hats']
  ]
})

// 可以简写成
User.findAll({
  attributes:[
    include:[
      [sequelize.fn('COUNT', sequelize.col('hats')), 'n_hats']
    ]
  ]
})

> select foo,qar,COUNT(hats) AS n_hats from User;

// 同时也可以排除一些属性
User.findAll({
  attributes:[
    exclude:[
      'foo'
    ]
  ]
})
```

### where 语句

#### 基础

```js
const { Op } = require("sequelize");
// 不显式指定，默认为相等
User.findAll({
  where:{
    id:2
  }
})

> select * from User where id = 2

// 等同于
User.findAll({
  where:{
    id:{
      [Op.eq]:2
    }
  }
})

// 多个校验,不显式指定，默认为AND
User.findAll({
  where:{
    id:2,
    name:'1'
  }
})

> select * from User where id = 2 and name = '1';

// 等同于
User.findAll({
  where:{
    [Op.and]:{
      id:2,
      name:'1'
    }
  }
})

// 也可以or
User.findAll({
  where:{
    [Op.or]:{
      id:2,
      id:1
    }
  }
})

> select * from User where id = 2 or id = 1;

// 当条件相同时，可以写成
User.findAll({
  where:{
    id:{
      [Op.or]:[1,2]
    }
  }
})

> select * from User where id = 2 or id = 1;
```

#### 操作符

```js
User.findAll({
  where:{
    [Op.and]:[{a:5},{b:5}],
    [Op.or]:[{a:5},{b:6}],
    // eq,ne(!=),is,not,or,

    // gt(>),gte(>=),lt(<),lte(<=),between,notBetween

    // in,notIn,like,notLike,startsWith,endsWith,

    id:{
      [Op.eq]:3,

      // > ALL (SELECT 1)
      [Op.all]: sequelize.literal('SELECT 1'),

    }
  }
})

// [Op.in]的等同写法
User.findAll({
  where:{
    id:[1,2,3]
  }
})

> select * from User where 'User'.'id' in (1,2,3);
```

### update 查询

```js
await User.update(
  {
    lastName: 'aa',
  },
  {
    where: {
      lastName: null,
    },
  },
);
```

### delete 查询

```js
await User.destroy({
  where: {
    lastName: 'aa',
  },
});

// 删除全部
await User.destroy({
  truncate: true,
});
```

### 批量创建

```js
// captains为创建后的结果数组
const user = await User.bulkCreate([
  { name: 'Jack Sparrow' },
  { name: 'Davy Jones' },
]);

// 如果要进行验证，必须手动配置validate: true，而create自带验证
const Foo = sequelize.define('foo', {
  bar: {
    type: DataTypes.TEXT,
    validate: {
      len: [4, 6],
    },
  },
});

// 这不会引发错误,两个实例都将被创建
await Foo.bulkCreate([{ name: 'abc123' }, { name: 'name too long' }]);

// 这将引发错误,不会创建任何内容
await Foo.bulkCreate([{ name: 'abc123' }, { name: 'name too long' }], {
  validate: true,
});

// foo 和 bar 都不会是管理员.
await User.bulkCreate([{ username: 'foo' }, { username: 'bar', admin: true }], {
  fields: ['username'],
});
```

### 排序分组

#### 排序

```js
// DESC 降序  ASC 升序 如果省略方向,则默认升序
User.findAll({
  order: [
    // 将转义 title 并针对有效方向列表进行降序排列
    ['title', 'DESC'],

    // 将按最大年龄进行升序排序
    sequelize.fn('max', sequelize.col('age')),
  ],
});
```

#### 分组

> 分组和排序的语法相同,只是分组不接受方向作为数组的最后一个参数(不存在 ASC, DESC, NULLS FIRST 等)

> 你还可以将字符串直接传递给 group,该字符串将直接(普通)包含在生成的 SQL 中. 请谨慎使用,请勿与用户生成的内容一起使用

```js
// 生成 'GROUP BY name'

Project.findAll({ group: 'name' });
```

### 限制分页

```js
// 提取10个实例/行
Project.findAll({ limit: 10 });

// 跳过8个实例/行
Project.findAll({ offset: 8 });

// 跳过5个实例,然后获取5个实例
Project.findAll({ offset: 5, limit: 5 });
```

### 实用方法

```js
//count
console.log(`这有 ${await Project.count()} 个项目`);

// max min sum

//假设我们有三个用户,分别是10、5和40岁

await User.max('age'); // 40
await User.max('age', { where: { age: { [Op.lt]: 20 } } }); // 10
await User.min('age'); // 5
await User.min('age', { where: { age: { [Op.gt]: 5 } } }); // 10
await User.sum('age'); // 55
await User.sum('age', { where: { age: { [Op.gt]: 5 } } }); // 50
```

## 模型查询（查找器）

```js
User.findAll();

// 根据主键查询一个条目
User.findbyPk();

// 找到第一个符合的条目
User.findOne();

// 找或者创建。使用 defaults 参数来定义必须创建的内容. 如果 defaults 不包含每一列的值,则 Sequelize 将采用 where 的值(如果存在)
User.findOrCreate();
const [user, created] = await User.findOrCreate({
  where: { username: 'aaa' },
  defaults: {
    job: 'Technical Lead JavaScript',
  },
});
console.log(user.username); // 'aaa'
console.log(user.job); // 这可能是也可能不是 'Technical Lead JavaScript'
console.log(created); // 指示此实例是否刚刚创建的布尔值
if (created) {
  console.log(user.job); // 这里肯定是 'Technical Lead JavaScript'
}

// 找并计数
User.findAndCountAll();
const { count, rows } = await Project.findAndCountAll({
  where: {
    title: {
      [Op.like]: 'foo%',
    },
  },
  offset: 10,
  limit: 2,
});
console.log(count);
console.log(rows);
```

## 获取器，设置器&虚拟字段

### 获取器、设置器

```js
const User = sequelize.define('user', {
  username: {
    type: DateTypes.STRING,
    get() {
      // 如果直接使用this.username，将会无限循环，所以要使用getDataValue
      const tmp = this.getDataValue('username');
      return tmp ? tmp.toUpperCase() : null;
    },
    set(value) {
      this.setDataValue('password', hash(this.username + value));
    },
  },
});
```

### 虚拟字段

```js
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  firstName: DataTypes.TEXT,
  lastName: DataTypes.TEXT,
  fullName: {
    // VIRTUAL 字段不会导致数据表也存在此列
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(value) {
      throw new Error('不要尝试设置 `fullName` 的值!');
    },
  },
});
```

## 验证与约束

### 区别

- 验证是在纯 JS 中在 Sequelize 级别执行的检查。如果验证失败，则根本不会将 SQL 查询发送到数据库
- 约束实在 SQL 级别定义的规则。如果约束检查失败，则数据库将引发错误，并且 Sequelize 会将错误转发给 JS。与验证不同的是，它执行了 SQL 查询

```js
  username:{
    type:DataTypes.TEXT,
    allowNull:false,
    unique:true
  }
```

### 允许/禁止 null

- allowNull 检查是 Sequelize 中唯一由验证和约束混合而成的检查，因为：

> 如果试图将 null 设置到不允许为 null 的字段,则将抛出 ValidationError ,而且 不会执行任何 SQL 查询
> 另外,在 sequelize.sync 之后,具有 allowNull: false 的列将使用 NOT NULL SQL 约束进行定义. 这样,尝试将值设置为 null 的直接 SQL 查询也将失败

### 验证器

验证会在 create、update、save 时运行，也可以手动调用 validate()

```js
  sequelize.define('foo', {
  bar: {
    type: DataTypes.STRING,
    validate: {
      is: /^[a-z]+$/i,          // 匹配这个 RegExp
      is: ["^[a-z]+$",'i'],     // 与上面相同,但是以字符串构造 RegExp
      not: /^[a-z]+$/i,         // 不匹配 RegExp
      not: ["^[a-z]+$",'i'],    // 与上面相同,但是以字符串构造 RegExp
      isEmail: true,            // 检查 email 格式 (foo@bar.com)
      isUrl: true,              // 检查 url 格式 (http://foo.com)
      isIP: true,               // 检查 IPv4 (129.89.23.1) 或 IPv6 格式
      isIPv4: true,             // 检查 IPv4 格式 (129.89.23.1)
      isIPv6: true,             // 检查 IPv6 格式
      isAlpha: true,            // 只允许字母
      isAlphanumeric: true,     // 将仅允许使用字母数字,因此 '_abc' 将失败
      isNumeric: true,          // 只允许数字
      isInt: true,              // 检查有效的整数
      isFloat: true,            // 检查有效的浮点数
      isDecimal: true,          // 检查任何数字
      isLowercase: true,        // 检查小写
      isUppercase: true,        // 检查大写
      notNull: true,            // 不允许为空
      isNull: true,             // 只允许为空
      notEmpty: true,           // 不允许空字符串
      equals: 'specific value', // 仅允许 'specific value'
      contains: 'foo',          // 强制特定子字符串
      notIn: [['foo', 'bar']],  // 检查值不是这些之一
      isIn: [['foo', 'bar']],   // 检查值是其中之一
      notContains: 'bar',       // 不允许特定的子字符串
      len: [2,10],              // 仅允许长度在2到10之间的值
      isUUID: 4,                // 只允许 uuid
      isDate: true,             // 只允许日期字符串
      isAfter: "2011-11-05",    // 仅允许特定日期之后的日期字符串
      isBefore: "2011-11-05",   // 仅允许特定日期之前的日期字符串
      max: 23,                  // 仅允许值 <= 23
      min: 23,                  // 仅允许值 >= 23
      isCreditCard: true,       // 检查有效的信用卡号

      // 自定义验证器的示例:
      isEven(value) {
        if (parseInt(value) % 2 !== 0) {
          throw new Error('Only even values are allowed!');
        }
      }
      isGreaterThanOtherField(value) {
        if (parseInt(value) <= parseInt(this.otherField)) {
          throw new Error('Bar must be greater than otherField.');
        }
      }
    }
  }
});

```

如果要传递一个单个数组参数，请传递一个单长度的参数数组。例

```js
isIn: [['foo', 'bar']];
```

#### allowNull 与其他验证器的交互

- 如果 allowNull:false，并且该值设置为 null，则将跳过所有的验证器，并抛出错误

- 如果 allowNull:true，并且该值设置为 null，则仅会跳过内置验证器，而自定义验证器仍将运行

- 可以通过设置 notNull 验证其来自定义 allowNull 的错误消息

```js
class User extends Model {}
User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '请输入你的名字',
        },
      },
    },
  },
  { sequelize },
);
```

#### 模型范围内的验证

```js
class Place extends Model {}
Place.init(
  {
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    latitude: {
      type: DataTypes.INTEGER,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.INTEGER,
      validate: {
        min: -180,
        max: 180,
      },
    },
  },
  {
    sequelize,
    validate: {
      bothCoordsOrNone() {
        // 在这种简单的情况下,如果只给定了纬度或经度,而不是同时给出两者, 则不能验证对象
        if ((this.latitude === null) !== (this.longitude === null)) {
          throw new Error('Either both latitude and longitude, or neither!');
        }
      },
    },
  },
);
```

> 使用模型对象的上下文调用模型验证器方法,如果它们抛出错误,则认为失败,否则将通过. 这与自定义字段特定的验证器相同

> 所收集的任何错误消息都将与字段验证错误一起放入验证结果对象中,其关键字以 validate 选项对象中验证方法失败的键命名. 即便在任何时候每种模型验证方法都只有一个错误消息,但它会以数组中显示为单个字符串的错误形式展示,以最大程度地提高与字段错误的一致性

```js
{
  'latitude': ['Invalid number: latitude'],
  'bothCoordsOrNone': ['Either both latitude and longitude, or neither!']
}
```

## 原始查询

### sequelize.query()

默认会返回 2 个参数，一个结果数组和一个包含元数据的对象

> 在不需要访问元数据的情况下,你可以传递一个查询类型来告诉后续如何格式化结果. 例如,对于一个简单的选择查询你可以做

```js
const { QueryTypes } = require('sequelize');
const users = await sequelize.query('SELECT * FROM `users`', {
  type: QueryTypes.SELECT,
});
```

如果传递模型，将会返回一个模型的实例

```js
// Callee 是模型定义. 这样你就可以轻松地将查询映射到预定义的模型
const projects = await sequelize.query('SELECT * FROM projects', {
  model: Projects,
  mapToModel: true, // 如果你有任何映射字段,则在此处传递 true
});
// 现在,`projects` 的每个元素都是 Project 的一个实例
```

### 点属性和 nest 参数

设置 nest:true,可以将点属性展开变为嵌套对象

```js
const { QueryTypes } = require('sequelize');
const records = await sequelize.query('select 1 as `foo.bar.baz`', {
  nest: true,
  type: QueryTypes.SELECT,
});
console.log(JSON.stringify(records[0], null, 2));
```

```js
{
  "foo": {
    "bar": {
      "baz": 1
    }
  }
}
```

```js
// 没有使用的
{
  "foo.bar.baz": 1
}
```

### 替换

- 如果传递一个数组，`?`将按照它们在数组里出现的顺序被替换
- 如果传递一个对象，`:key`将替换为该对象的键对应的值，如果对象包含在查询中找不到的键,则会抛出异常

```js
const { QueryTypes } = require('sequelize');

await sequelize.query('SELECT * FROM projects WHERE status = ?', {
  replacements: ['active'],
  type: QueryTypes.SELECT,
});

await sequelize.query('SELECT * FROM projects WHERE status = :status', {
  replacements: { status: 'active' },
  type: QueryTypes.SELECT,
});
```

```js
//数组替换将自动处理,以下查询将搜索状态与值数组匹配的项目.

const { QueryTypes } = require('sequelize');

await sequelize.query('SELECT * FROM projects WHERE status IN(:status)', {
  replacements: { status: ['active', 'inactive'] },
  type: QueryTypes.SELECT,
});
```

## 关联

### 三种关系：

- 一对一
- 一对多
- 多对多

### 四种关联类型：

- HasOne
- BelongsTo
- HasMany
- BelongsToMany

```js
const A = sequelize.define('A');
const B = sequelize.define('B');
A.hasOne(B); //A有一个B，外键在目标模型B中定义
A.belongsTo(B); //A属于B，外键在源模型A中定义
A.hasMany(B); //A有多个B，外键在目标模型B中定义
A.belongsToMany(B, { through: 'C' }); //A属于多个B，通过C联结
```

### 一对一

```js
Foo.hasOne(Bar, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT', //可用的参数为 RESTRICT, CASCADE, NO ACTION, SET DEFAULT 和 SET NULL
  foreignKey: 'myFooId', //自定义外键
  allowNull: false, //设置为强制性关联
});
Bar.belongsTo(Foo);
```

### 一对多

```js
Team.hasMany(Player, {
  foreignKey: {
    name: 'teamId',
  },
});
Player.belongsTo(Team);
```

### 多对多

```js
const Movie = sequelize.define('Movie', { name: DataTypes.STRING });
const Actor = sequelize.define('Actor', { name: DataTypes.STRING });
Movie.belongsToMany(Actor, { through: 'ActorMovies' });
Actor.belongsToMany(Movie, { through: 'ActorMovies' });
```

当联结表的模型中不存在主键时，belongsToMany 将创建一个唯一键，可以使用 uniqueKey 参数覆盖此唯一键名

```js
Project.belongsToMany(User, {
  through: UserProjects,
  uniqueKey: 'my_custom_unique',
});
```

### 基本的涉及关联的查询

```js
// 这是用于以下示例的模型的设置
const Ship = sequelize.define(
  'ship',
  {
    name: DataTypes.STRING,
    crewCapacity: DataTypes.INTEGER,
    amountOfSails: DataTypes.INTEGER,
  },
  { timestamps: false },
);
const Captain = sequelize.define(
  'captain',
  {
    name: DataTypes.STRING,
    skillLevel: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 10 },
    },
  },
  { timestamps: false },
);
Captain.hasOne(Ship);
Ship.belongsTo(Captain);
```

#### 预先加载、延迟加载

```js
// 延迟加载
const awesomeCaptain = await Captain.findOne({
  where: {
    name: 'Jack Sparrow',
  },
});
// 获取有关他的 ship 的信息
const hisShip = await awesomeCaptain.getShip();
```

```js
//预先加载
const awesomeCaptain = await Captain.findOne({
  where: {
    name: 'Jack',
  },
  include: Ship,
});
console.log('Amount of Sails:', awesomeCaptain.ship.amountOfSails);
```

### 关联别名

```js
Ship.belongsTo(Captain, { as: 'leader' });
```

### 自定义外键

```js
// 这将在Ship中创建bossId外键
Ship.belongsTo(Captain, { foreignKey: 'bossId' });
```

### 添加到实例的特殊方法

#### Foo.hasOne(Bar)

- fooInstance.getBar()
- fooInstance.setBar()
- fooInstance.createBar()

```js
const foo = await Foo.create({ name: 'the-foo' });
const bar1 = await Bar.create({ name: 'some-bar' });
const bar2 = await Bar.create({ name: 'another-bar' });
console.log(await foo.getBar()); //null
await foo.setBar(bar1);
console.log(await foo.getBar().name); //some-bar
await foo.createBar({ name: 'yet' });
const newlyAssociatedBar = await foo.getBar();
console.log(newlyAssociatedBar.name); //'yet'
await foo.setBar(null);
console.log(await foo.getBar()); //null
```

#### Foo.belongsTo(Bar)

来自 Foo.hasOne(Bar) 的相同内容:

- fooInstance.getBar()
- fooInstance.setBar()
- fooInstance.createBar()

#### Foo.hasMany(Bar)

- fooInstance.getBars()
- fooInstance.countBars()
- fooInstance.hasBar()
- fooInstance.hasBars()
- fooInstance.setBars()
- fooInstance.addBar()
- fooInstance.addBars()
- fooInstance.removeBar()
- fooInstance.removeBars()
- fooInstance.createBar()

```js
const foo = await Foo.create({ name: 'the-foo' });
const bar1 = await Bar.create({ name: 'some-bar' });
const bar2 = await Bar.create({ name: 'another-bar' });
console.log(await foo.getBars()); //[]
console.log(await foo.countBars()); //0
console.log(await foo.hasBar(bar1)); //false
await foo.addBars([bar1, bar2]);
console.log(await foo.countBars()); //2
await foo.addBar(bar1);
console.log(await foo.countBars()); //2
console.log(await foo.hasBar(bar1)); //true
await foo.removeBar(bar2);
console.log(await foo.countBars()); //1
await foo.createBar({ name: 'yet-another-bar' });
console.log(await foo.countBars()); // 2
await foo.setBars([]); // 取消关联所有先前关联的 Bars
console.log(await foo.countBars()); // 0
```

#### Foo.belongsToMany(Bar,{through:Baz})

来自 Foo.hasMany(Bar) 的相同内容:

- fooInstance.getBars()
- fooInstance.countBars()
- fooInstance.hasBar()
- fooInstance.hasBars()
- fooInstance.setBars()
- fooInstance.addBar()
- fooInstance.addBars()
- fooInstance.removeBar()
- fooInstance.removeBars()
- fooInstance.createBar()

### 为什么关联是成对定义的

> 当在两个模型之间定义了 Sequelize 关联时,只有 源 模型 知晓关系. 因此,例如,当使用 Foo.hasOne(Bar)(当前,Foo 是源模型,而 Bar 是目标模型)时,只有 Foo 知道该关联的存在. 这就是为什么在这种情况下,如上所示,Foo 实例获得方法 getBar(), setBar() 和 createBar() 而另一方面,Bar 实例却没有获得任何方法.

> 类似地,对于 Foo.hasOne(Bar),由于 Foo 了解这种关系,我们可以像 Foo.findOne({ include: Bar }) 中那样执行预先加载,但不能执行 Bar.findOne({ include: Foo }).

> 因此,为了充分发挥 Sequelize 的作用,我们通常成对设置关系,以便两个模型都 互相知晓.

### 创建引用非主键字段的关联

ORM 允许定义一个关联，该关联使用另一个字段而不是主键字段来建立关联。该字段必须对此具有唯一的约束。

** 外键在源模型上，字段对应 targetKey，外键在目标模型上，字段对应 sourceKey **

#### 对于 belongsTo 关系

> 外键在源模型上

```js
// 这将在源模型(Ship)中创建一个名为 `captainName` 的外键,
// 该外键引用目标模型(Captain)中的 `name` 字段.
Ship.belongsTo(Captain, { targetKey: 'name', foreignKey: 'captainName' });
```

#### 对于 hasOne 和 hasMany 关系

> 可以将完全相同的想法应用于 hasOne 和 hasMany 关联,但是在定义关联时,我们提供了 sourceKey,而不是提供 targetKey. 这是因为与 belongsTo 不同,hasOne 和 hasMany 关联将外键保留在目标模型上

```js
const Foo = sequelize.define(
  'foo',
  {
    name: { type: DataTypes.STRING, unique: true },
  },
  { timestamps: false },
);
const Bar = sequelize.define(
  'bar',
  {
    title: { type: DataTypes.STRING, unique: true },
  },
  { timestamps: false },
);
const Baz = sequelize.define(
  'baz',
  { summary: DataTypes.STRING },
  { timestamps: false },
);
Foo.hasOne(Bar, { sourceKey: 'name', foreignKey: 'fooName' });
Bar.hasMany(Baz, { sourceKey: 'title', foreignKey: 'barTitle' });
// [...]
await Bar.setFoo("Foo's Name Here");
await Baz.addBar("Bar's Title Here");
```

#### 对于 belongsToMany 关系

```js
//有四种情况需要考虑：

//我们可能希望使用默认的主键为 Foo 和 Bar 进行多对多关系：
// 这将创建具有字段 `fooId` 和 `barID` 的联结表 `foo_bar`.

Foo.belongsToMany(Bar, { through: 'foo_bar' });

//我们可能希望使用默认主键 Foo 的多对多关系,但使用 Bar 的不同字段：
// 这将创建具有字段 `fooId` 和 `barTitle` 的联结表 `foo_bar`.

Foo.belongsToMany(Bar, { through: 'foo_bar', targetKey: 'title' });

//我们可能希望使用 Foo 的不同字段和 Bar 的默认主键进行多对多关系：
// 这将创建具有字段 `fooName` 和 `barId` 的联结表 `foo_bar`.

Foo.belongsToMany(Bar, { through: 'foo_bar', sourceKey: 'name' });

//我们可能希望使用不同的字段为 Foo 和 Bar 使用多对多关系：
// 这将创建带有字段 `fooName` 和 `barTitle` 的联结表 `foo_bar`.

Foo.belongsToMany(Bar, {
  through: 'foo_bar',
  sourceKey: 'name',
  targetKey: 'title',
});
```

> 在 sourceKey 和 targetKey 之间做出决定的技巧只是记住每个关系在何处放置其外键. 如本指南开头所述：

> A.belongsTo(B) 将外键保留在源模型中(A),因此引用的键在目标模型中,因此使用了 targetKey.

> A.hasOne(B) 和 A.hasMany(B) 将外键保留在目标模型(B)中,因此引用的键在源模型中,因此使用了 sourceKey.

> A.belongsToMany(B) 包含一个额外的表(联结表),因此 sourceKey 和 targetKey 均可用,其中 sourceKey 对应于 A(源)中的某个字段而 targetKey 对应于 B(目标)中的某个字段.

## 偏执表

> 一个 paranoid 表是一个被告知删除记录时不会真正删除它的表.反而一个名为 deletedAt 的特殊列会将其值设置为该删除请求的时间戳

> 这意味着偏执表会执行记录的 软删除,而不是 硬删除

```js
class Post extends Model {}
Post.init(
  {
    /* 这是属性 */
  },
  {
    sequelize,
    paranoid: true,

    // 如果要为 deletedAt 列指定自定义名称
    deletedAt: 'destroyTime',
  },
);

// 删除
await Post.destroy({
  where: {
    id: 1,
  },
});
// UPDATE "posts" SET "deletedAt"=[timestamp] WHERE "deletedAt" IS NULL AND "id" = 1

// 如果你确实想要硬删除,并且模型是 paranoid,则可以使用 force: true 参数强制执行：
await Post.destroy({
  where: {
    id: 1,
  },
  force: true,
});
// DELETE FROM "posts" WHERE "id" = 1

// 要恢复软删除的记录,可以使用 restore 方法,该方法在静态版本和实例版本中都提供
// 我们创建一个帖子,对其进行软删除,然后将其还原
const post = await Post.create({ title: 'test' });
console.log(post instanceof Post); // true
await post.destroy();
console.log('soft-deleted!');
await post.restore();
console.log('restored!');

// 展示静态 `restore` 方法的示例
// 恢复每个 likes 大于 100 的软删除的帖子
await Post.restore({
  where: {
    likes: {
      [Op.gt]: 100,
    },
  },
});

// 其他查询行为
await Post.findByPk(123); // 如果 ID 123 的记录被软删除,则将返回 `null`
await Post.findByPk(123, { paranoid: false }); // 这将检索记录

await Post.findAll({
  where: { foo: 'bar' },
}); // 这将不会检索软删除的记录

await Post.findAll({
  where: { foo: 'bar' },
  paranoid: false,
}); // 这还将检索软删除的记录
```
