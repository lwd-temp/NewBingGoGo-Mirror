## 创建自己的 cloudflare 的 worker （这是免费的）
首先打开这个网页，然后登录一下，没用登录就注册一下，只需要一个邮箱就可以了，什么邮箱都可以，页面是英语的，但是不会还有人不会用翻译软件吧！
~~~
https://workers.cloudflare.com/
~~~
登录完之后
![](/images/9.png)
![](/images/10.png)
![](/images/11.png)
把代码粘贴进去，代码在这 [worker.js](../代码/cloudflareWorker.js)
![](/images/12.png)
下面这张照片显示的就是你的魔法链接
![](/images/13.png)

.workers.dev 结尾的域名在国内DNS被污染得很严重，甚至有些地区完全无法访问，建议绑定一个自己的域名，这样访问速度更快。当然你可以通过设置host文件解决这个问题，这里我就不细说了。

