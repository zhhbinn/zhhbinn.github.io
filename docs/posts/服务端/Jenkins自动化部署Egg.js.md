## 安装 Jenkins

网上很多教程，自己搜。

## 安装插件

### 安装配置 Nodejs

找到全局工具配置

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141314.png)

选择版本，建议选择 LTS 版本

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141337.png)

### 安装配置 Publish Over SSH

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141405.png)

勾上使用密码。下面有个测试连接按钮。

注意：实际上，这里显示成功后，构建也会提示连接服务器失败，因此需要在项目的构建后配置重新配置服务器的相关账号密码。

### 安装配置 Github API

安装后到 Github 生成 token。

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141441.png)

然后把生成的 token 复制到 secret 处

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141455.png)

填写后，勾上管理 HOOK，然后点击右边的连接测试，成功的话会显示 github 的用户名

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141455.png)

## 配置仓库

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141523.png)

仓库如果为私有，需要配置账号。注意分支名字。

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141538.png)

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141714.png)

## 配置脚本

构建前：

```
node -v
npm -v
pwd
rm -rf node_modules
tar -zcf ../release.tgz .
```

构建后：

```
cd /projects/zhhbinn
tar -xzf /var/lib/jenkins/workspace/release.tgz -C /projects/zhhbinn/egg20
cd /projects/zhhbinn/egg20
npm install --production
npm run stop
npm run start
```

过程：下载 git 最新代码——打包——转移路径——解压——安装/更新依赖——停止——启动

## 遇到的问题

### 构建时连接不上服务器

需要在构建后配置重新配置服务器的相关账号密码。原因不明。

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141738.png)

### 构建成功后内容没变

注意工作路径，这里的路径位于 Jenkins 的工作区：/var/lib/jenkins/workspace。构建实际上是在 Jenkins 的工作区路径完成的。

![](https://raw.githubusercontent.com/zhhbinn/picHome/master/20210204141911.png)
