# SuperUpload
超级文件上传插件，可同步上传，可异步上传。

使用方式，将js文件夹下的SurperUpload.js引入。
例子：
~~~js
new SuperUpload({
    el: 'btn', // 绑定触发文件选择的节点
    url: '', // 文件上传的地址
    async: false, // 是否异步上传， false为同步上传，选择文件后立即上传，默认true异步上传
    bindEl: 'sc', // 使用dom元素触发文件上传（可选）
    file: { // input file的属性
      type: 'file',
      multiple: 'multiple',
      accept: 'audio/*,video/*,image/*'
    },
    preview: function(e, files){ // 选择文件之后的预览回调，e为event事件， files为文件对象，如果设置了multiple则为files列表，否则问file对象
      console.log(e);
      console.log(files);
    },
    done: function(e,code){ // 上传成功的回调，参数一： 服务器的响应信息， code成功为200，异常为500
      console.log(e, code);
    }
  });

~~~
效果图：
![Image text]( https://github.com/ME-liuchunfu/SuperUpload/blob/master/image/111.png)
![Image text]( https://github.com/ME-liuchunfu/SuperUpload/blob/master/image/222.png)
![Image text]( https://github.com/ME-liuchunfu/SuperUpload/blob/master/image/333.png)

