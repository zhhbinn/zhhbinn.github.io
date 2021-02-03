> Puppeteer(中文翻译”木偶”)  是  Google Chrome  团队官方的无界面（Headless）Chrome  工具，它是一个  Node  库，提供了一个高级的  API  来控制  DevTools  协议上的无头版  Chrome 。也可以配置为使用完整（非无头）的  Chrome。
>  generic-pool  资源池
>   参考链接：
>  https://zhuanlan.zhihu.com/p/158204817 > https://blog.guowenfh.com/2019/06/16/2019/puppeteer-pool/

### 单  pup  实例池

```js
'use strict';
const puppeteer = require('puppeteer');
const genericPool = require('generic-pool');
/**
 * 初始化一个 Puppeteer 池
 * @param {Object} [options={}] 创建池的配置配置
 * @param {Number} [options.max=10] 最多产生多少个 puppeteer 实例 。如果你设置它，请确保 在引用关闭时调用清理池。 pool.drain().then(()=>pool.clear())
 * @param {Number} [options.min=1] 保证池中最少有多少个实例存活
 * @param {Number} [options.maxUses=2048] 每一个 实例 最大可重用次数，超过后将重启实例。0表示不检验
 * @param {Number} [options.testOnBorrow=2048] 在将 实例 提供给用户之前，池应该验证这些实例。
 * @param {Boolean} [options.autostart=false] 是不是需要在 池 初始化时 初始化 实例
 * @param {Number} [options.idleTimeoutMillis=3600000] 如果一个实例 60分钟 都没访问就关掉他
 * @param {Number} [options.evictionRunIntervalMillis=180000] 每 3分钟 检查一次 实例的访问状态
 * @param {Object} [options.puppeteerArgs={}] puppeteer.launch 启动的参数
 * @param {Function} [options.validator=(instance)=>Promise.resolve(true))] 用户自定义校验 参数是 取到的一个实例
 * @param {Object} [options.otherConfig={}] 剩余的其他参数 // For all opts, see opts at https://github.com/coopernurse/node-pool#createpool
 * @return {Object} pool
 */
const initPuppeteerPool = (options = {}) => {
  const {
    max = 10,
    min = 2,
    maxUses = 2048,
    testOnBorrow = true,
    autostart = false,
    idleTimeoutMillis = 3600000,
    evictionRunIntervalMillis = 180000,
    puppeteerArgs = {},
    validator = () => Promise.resolve(true),
    ...otherConfig
  } = options;
  const factory = {
    create: () =>
      puppeteer.launch(puppeteerArgs).then((instance) => {
        // 创建一个 puppeteer 实例 ，并且初始化使用次数为 0
        instance.useCount = 0;
        return instance;
      }),
    destroy: (instance) => {
      instance.close();
    },
    validate: (instance) => {
      // 执行一次自定义校验，并且校验校验 实例已使用次数。 当 返回 reject 时 表示实例不可用
      return validator(instance).then((valid) =>
        Promise.resolve(valid && (maxUses <= 0 || instance.useCount < maxUses)),
      );
    },
  };
  const config = {
    max,
    min,
    testOnBorrow,
    autostart,
    idleTimeoutMillis,
    evictionRunIntervalMillis,
    ...otherConfig,
  };
  const pool = genericPool.createPool(factory, config);
  const genericAcquire = pool.acquire.bind(pool); // 重写了原有池的消费实例的方法。添加一个实例使用次数的增加
  pool.acquire = () =>
    genericAcquire().then((instance) => {
      instance.useCount += 1;
      return instance;
    });
  pool.use = (fn) => {
    let resource;
    return pool
      .acquire()
      .then((r) => {
        resource = r;
        return resource;
      })
      .then(fn)
      .then(
        (result) => {
          // 不管业务方使用实例成功与后都表示一下实例消费完成
          pool.release(resource);
          return result;
        },
        (err) => {
          pool.release(resource);
          throw err;
        },
      );
  };
  return pool;
};
```

### 使用

```js
const pool = initPuppeteerPool({ // 全局只应该被初始化一次
    puppeteerArgs: {
      ignoreHTTPSErrors: true,
      headless: false, // 是否启用无头模式页面
      timeout: 0,
      pipe: true, // 不使用 websocket
    }
})
// 在业务中取出实例使用
const page = await pool.use(instance=>{
  const page = await instance.newPage()
  await page.goto('http://xxx.xxx', { timeout: 120000 })
  // do XXX ...
    return page
})
// do XXX ...
// 应该在服务重启或者关闭时执行
//pool.drain().then(() => pool.clear())
```

### 池中池

```js
// genPool
// 建连接池，重写消费方法
// pagePool
// 使用重写后的连接池新建单个pup实例中的多个页面连接池
// puppeteerPool
// 使用pagePool连接池新建多个pup实例
```

```js
// genPool.js
const genericPool = require('generic-pool');
const genPool = (factory, config) => {
  const pool = genericPool.createPool(factory, config);
  const genericAcquire = pool.acquire.bind(pool); // 重写了原有池的消费实例的方法。添加一个实例使用次数的增加 // 消费 // returns a Promise Once a resource in the pool is available
  pool.acquire = () => {
    genericAcquire().then((instance) => {
      instance.useCount += 1;
      return instance;
    });
  }; //This method handles acquiring a resource from the pool, handing it to your function and then calling pool.release or pool.destroy with resource after your function has finished.
  pool.use = (fn) => {
    let resource;
    return pool
      .acquire()
      .then((res) => {
        resource = res;
        return resource;
      })
      .then(fn)
      .then(
        // 不管业务方使用实例成功与后都表示一下实例消费完成
        (res) => {
          pool.release(resource);
          return res;
        },
        (err) => {
          pool.release(resource);
          return err;
        },
      );
  };
  return pool;
};
module.exports = genPool;
```

```js
// pagePool.js
const puppeteer = require('puppeteer');
const genPool = require('./genPool');
const pageTool = async (config, options) => {
  const brower = await puppeteer.launch(options);
  const factory = {
    //a function that the pool will call when it wants a new resource. It should return a Promise that either resolves to a resource or rejects to an Error if it is unable to create a resource for whatever reason.
    create: () => {
      return brower.newPage().then((instance) => {
        instance.useCount = 0;
        return instance;
      });
    }, //a function that the pool will call when it wants to destroy a resource. It should accept one argument resource where resource is whatever factory.create made. The destroy function should return a Promise that resolves once it has destroyed the resource.
    destory: (instance) => {
      instance.close();
    }, //a function that the pool will call if it wants to validate a resource. It should accept one argument resource where resource is whatever factory.create made. // 由testOnBorrow开关控制是否校验
    validate: (instance) => {
      // 执行一次自定义校验，并且校验校验 实例已使用次数。 当 返回 reject 时 表示实例不可用
      return Promise.resolve(instance).then((valid) => {
        Promise.resolve(
          valid && (config.maxUses <= 0 || instance.useCount < config.maxUses),
        );
      });
    },
  };
  const pool = genPool(factory, config);
  pool.closeBrowser = () => {
    return brower.close();
  };
  return pool;
};
module.exports = pageTool;
```

```js
//puppeteerPool.js
const pagePool = require('./pagePool');
const genericPool = require('generic-pool');
/**
 * 生成一个puppeteer链接池
 * @param {Object} [options] 创建池的配置
 * @param {Object} [options.poolConfig] 链接池的配置参数
 * @param {Number} [poolConfig.max = 10] 链接池的最大容量
 * @param {Number} [poolConfig.min = 2] 链接池的最小活跃量
 * @param {Boolean} [poolConfig.testOnBorrow = true] 在将 实例 提供给用户之前，池应该验证这些实例。
 * @param {Boolean} [poolConfig.autoStart = true] 启动时候是否初始化实例
 * @param {Number} [poolConfig.idleTimeoutMillis = 60*60*1000] 实例多久不使用将会被关闭（60分钟）
 * @param {Number} [poolConfig.evictionRunIntervalMillis = 3*60*1000] 多久检查一次是否在使用实例（3分钟）
 * @param {Object} [options.puppeteerConfig] puppeteer的启动参数配置
 */
const puppeteerPool = (options = { poolConfig: {}, puppeteerConfig: {} }) => {
  const config = {
    max: 10,
    min: 2,
    maxUses: 2048,
    testOnBorrow: true,
    autoStart: true,
    idleTimeoutMillis: 60 * 60 * 1000,
    evictionRunIntervalMillis: 3 * 60 * 1000,
    ...options.poolConfig,
  };
  const launchOptions = {
    ignoreHTTPSErrors: true,
    headless: true,
    pipe: true,
    args: [
      // '--disabled-3d-apis',
      // '--block-new-web-contents',
      // '--disable-databases',
      '–disable-dev-shm-usage', // '--disable-component-extensions-with-background-pages',
      '–-no-sandbox', // '--disable-setuid-sandbox',
      '–-no-zygote',
      '–-single-process',
      '--no-first-run',
      '--disable-local-storage', // '--disable-media-session-api', // '--disable-notifications', // '--disable-pepper-3d',
      '--disabled-gpu',
    ],
    ...options.puppeteerConfig,
  };
  const factory = {
    create: async () => {
      const page = await pagePool(config, launchOptions);
      return Promise.resolve(page);
    },
    destory: async (instance) => {
      if (instance.drain) {
        await instance.drain().then(() => {
          instance.clear();
        });
      }
    },
    validate: (instance) => {
      return Promise.resolve(true);
    },
  };
  const pool = genericPool.createPool(factory, config);
  return pool;
};
module.exports = puppeteerPool;
```
