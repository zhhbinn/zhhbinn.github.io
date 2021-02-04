### 配置别名

> https://juejin.im/post/6844903802009550861

1. 在用户目录下配置

```conf
	sudo vi .bash_profile
```

2. 添加代码

```conf
	alias nginx='/usr/local/nginx/sbin/nginx'
```

3. 保存重置

```conf
	source .bash_profile
```

4. 验证

```conf
	nginx -v
```

### 启动

```conf
	nginx
	# /usr/local/nginx/sbin/nginx

```

### 重启

```conf
	nginx -s reload
	# /usr/local/nginx/sbin/nginx -s reload
```

### 查看 nginx 进程

```conf
	ps -ef | grep nginx
```

### 配置多级目录

> https://www.cnblogs.com/zhuwenjoyce/p/10878804.html

```conf
	server {
		listen       80;
		server_name  localhost;

		location = /page1/ {                         #这里的=号是精准配置
				root  /usr/local/nginx/html/page1/;      #最前面的加上/，是绝对路径地址，建议这样定位文件夹目录。
				index page1.html;
		}

		location = /alias/ {
				alias  /usr/local/nginx/html/alias/;     #alias配置的文件夹目录最末尾一定要加上/
				index  index.html;
		}

		location / {
				root   html;                             # html前面没有/，代表相对路径，指的是nginx安装根目录下的html文件夹
				index  index.html index.htm;             # html文件夹下首先访问index.html，如果不存在，则第二选择访问index.htm
		}

		error_page   500 502 503 504  /50x.html;     #定义http错误码，和http错误码跳转url
		location = /50x.html {
				root   html;
		}
	}
```

alias 指定的目录是准确的，给 location 指定一个目录。
root 指定目录的上级目录，并且该上级目录要含有 location 指定名称的同名目录。

```conf
	location /img/ {
			alias /var/www/image/;
	}
	#若按照上述配置的话，则访问/img/目录里面的文件时，ningx会自动去/var/www/image/目录找文件
	location /img/ {
			root /var/www/image;
	}
	#若按照这种配置的话，则访问/img/目录下的文件时，nginx会去/var/www/image/img/目录下找文件
```

```conf
	#例如：如果有一个请求的URI是/conf/nginx.conf，而用户实际想访问的是 /usr/local/nginx/conf/nginx.conf，则两种方式如下
  # alias:
    location  /conf {
			alias    /usr/local/nginx/conf
		}
	# root:
		location  /conf {
      root    /usr/local/nginx
		}
```

### nginx.conf 配置文件的详解

> https://blog.csdn.net/weixin_42167759/article/details/85049546

### 阿里云安装 nginx

> https://www.jianshu.com/p/6660589df806
