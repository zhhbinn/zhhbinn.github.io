import sidebar from './sidebar';
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
    searchMaxSuggestions: 10,
    smoothScroll: true,
    nextLinks: true,
    prevLinks: true,
    subSidebar: 'auto',
    nav: [
      { text: '关于', link: '/' }, // 内部链接 以docs为根目录
      { text: 'GitHub', link: 'https://github.com/zhhbinn' }, // 外部链接
    ],
    sidebar,
  },
};
