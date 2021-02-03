### 管道

```js
let aggregateQuery = [
  {
    // 修改输入文档的结构。可以用来重命名、增加或删除域，也可以用于创建计算结果以及嵌套文档
    $project: {
      _id: 1,
    },
  },
  {
    // 查询条件
    $match: whereQuery,
  },
  {
    // 将结果中的某个数组类型字段拆分成多条，其他字段照常复制
    $unwind: '$dataArray',
  },
  {
    //分组

    $group: {
      // 分组依据，可多字段聚合，分组的依据作为查询结果的_id
      _id: {
        origin_pathname: '$origin_pathname',
        module_name: '$module_name',
      },
      // 平均值
      avg: {
        $avg: '$module_perf',
      },

      application_id: {
        // 结果数据格式，和$push一样都是数组结构
        $addToSet: '$application_id',
        // 其他表达式
        // $sum:{},
        // $min:{},
        // $max:{},
        // $push:{},
        // $first:{},
        // $last:{}
      },
    },
  },
  {
    $skip: per_page * (current - 1),
  },
  {
    // 1是正序，-1是反序
    $sort: { create_time: -1 },
  },
  {
    $limit: per_page,
  },
  {
    // 随机返回一条数据
    $sample: { size: 1 },
  },
  {
    // 链表查询
    $lookup: {
      //from: <collection to join>,
      //localField: <field from the input documents>,
      //foreignField: <field from the documents of the "from" collection>,
      //as: <output array field>
    },
  },
];
let res = await db.aggregate(aggregateQuery);
```
