module.exports = {
  title: '一个好鱼',
  dest: 'dist',
  plugins: [
    ['@vuepress/back-to-top'],
    ['@vuepress/medium-zoom'],
    ['@vuepress/nprogress'],
    [
      '@vuepress/google-analytics',
      {
        ga: 'UA-187734663-1', // UA-00000000-0
      },
    ],
  ],
  themeConfig: {
    sidebarDepth: 4,
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
    searchMaxSuggestions: 10,
    smoothScroll: true,
    nextLinks: true,
    prevLinks: true,
    subSidebar: 'auto',
    nav: [
      { text: '关于', link: '/' }, // 内部链接 以docs为根目录
      { text: 'GitHub', link: 'https://github.com/zhhbinn' }, // 外部链接
    ],
    sidebar: [
      {
        title: 'Vue', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [['/posts/Vue/Vue下的性能数据收集', 'Vue下的性能数据收集']],
      },
      {
        title: '数据库', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [
          ['/posts/数据库/Mongoose的聚合函数', 'Mongoose的聚合函数'],
          ['/posts/数据库/Sequelize入门', 'Sequelize入门'],
        ],
      },
      {
        title: '服务端', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [
          ['/posts/服务端/Puppeteer连接池', 'Puppeteer连接池'],
          ['/posts/服务端/Jenkins自动化部署Egg.js', 'Jenkins自动化部署Egg.js'],
          ['/posts/服务端/nginx的基本操作', 'nginx的基本操作'],
        ],
      },
      {
        title: '移动端', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [
          ['/posts/小程序/小程序的坑', '小程序的坑'][
            ('/posts/移动端/微信H5开发中的一些问题', '微信H5开发中的一些问题')
          ],
        ],
      },
      {
        title: '设计模式', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [],
      },
      {
        title: 'HTML', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [],
      },
      {
        title: 'CSS', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [],
      },
      {
        title: 'JavaScript', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
        children: [['/posts/JavaScript/定时器管理池', '定时器管理池']],
      },
    ],
  },
};
