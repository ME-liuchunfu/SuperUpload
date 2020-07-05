/**
 * 超级文件上传插件，
 * 版本v0.0.1
 * 作者：liuchunfu
 * 邮箱：429829320@qq.com
 */


//兼容bind函数
if(!Function.prototype.bind){
    Function.prototype.bind = function(){
        if(typeof this !== 'function'){
　　　　　　throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
　　　　}
        var _this = this;
        var obj = arguments[0];
        var ags = Array.prototype.slice.call(arguments,1);
        return function(){
            _this.apply(obj,ags);
        };
    };
}

/**
 * 超级文件上传插件
 * @param {json} conf 接收一个json格式的配置参数
 * json：
 * 	el: 绑定触发元素 --》String，
 * 	url: 文件上传的路径 --》 string，
 * 	async: 是否异步，默认true异步，false为同步
 * 	file: 指定input[file] 标签属性 --》json,
 * 	preview: 获取到文件后 --》function,
 * 	done: 上传文件成功或者失败的回调 --》function,
 * 
 */
function SuperUpload(conf){
	if (conf === undefined || conf === "" || conf === null || conf === "function") {
		throw new TypeError('new SuperUpload(conf) this conf is not a object, example {}');
	}
	if (typeof conf === "object" || typeof conf !== "Object") {
		this.conf = conf;
		this.init();
	}
};

/**
 * 默认配置
 * @return {json conf} 获取插件默认的配置参数
 */
SuperUpload.prototype.default_conf = function(){
	var _default_conf = {
		el: '',
		type: '',
		async: true,
		file: {
			type: 'file',
			multiple: 'multiple',
			/**accept: 'MIME_type,audio/*,video/*,image/*'**/
		},
		beforeSend: function(){ // 发送前预览
			return true;
		},
		preview: function(e){ // 文件改变预览
			console.log(e);
		},
		done: function(e){ // 文件上传后
			console.log(e);
		}
	};
	return _default_conf;
};

/**
 * 初始化函数
 * @return {[current SuperUpload instance]} 返回当前SuperUpload实例
 */
SuperUpload.prototype.init = function(){
	var _conf = this.default_conf();
	this.copyJsonObject(_conf, this.conf);
	this.conf = _conf;
	// 创建节点
	var _inp = this.createDom('input');
	_inp.style.display = 'none';
	var that = this;
	if (this.conf['bindEl']) {
		var bindEl = document.getElementById(this.conf['bindEl']);
		this.bindEl = bindEl;
		this.addListener(bindEl, 'click', function(e){
			that.upload(that.option);
		});
	}
	this.each(this.conf['file'], function(idx, itm){
		_inp[idx] = itm;
	}).addListener(_inp, 'change', function(e){
		that.option = {};
		if (that.conf['file'].multiple != "multiple" || that.conf['file'].multiple != true) {
			that.conf['preview'] && that.conf['preview'].call(that, e, e.target.files[0]);
		}else{
			that.conf['preview'] && that.conf['preview'].call(that, e, e.target.files);
		}
		var option = {};
		option['url'] = that.conf['url'];
		option['callback'] = that.conf['done'];
		if (that.conf['beforeSend']) {
			option['beforeSend'] = that.conf['beforeSend'];
		}
		if (that.conf['file'].multiple != "multiple" || that.conf['file'].multiple != true) {
			option['files'] = e.target.files[0];
		}else{
			option['files'] = e.target.files;
		}
		if (that.conf['async'] === false) {
			that.upload(option);
		}else{
			if (that.bindEl) {
				that.bindEl.click();
			}
		};
	});
	var _target = document.getElementById(this.conf['el']);
	this.addListener(_target, 'click', function(e){
		that._inp.click();
	});
	_target.parentNode.insertBefore(_inp, _target);
	this._target = _target;
	this._inp = _inp;
	// 初始化监听
	return this;
};

/**
*异步上传文件
*option参数
*	url：上传路径
*	files：文件对象
* 	data:上传的其他数据{id："1"}
*  	callback：回调函数（可空）
*   beforeSend:上传前函数（可空）
*/
SuperUpload.prototype.upload = function(option) {
	this.safe = false;
	var that = this;
    var fd = new FormData(),
        xhr = new XMLHttpRequest();
    if (option.beforeSend instanceof Function) {
        if (option.beforeSend(option.files) === false) {
            return false;
        }
    }
    if (option.data) {
        for (var name in option.data) {
            fd.append(name, option.data[name]);
        }
    }
    fd.append('file', option.files);
    xhr.open('post', option.url);
    xhr.onreadystatechange = function () {
        if (xhr.status == 200) {
            if (xhr.readyState == 4) {
                if (option.callback instanceof Function) {
                	try{
                		option.callback(JSON.parse(xhr.responseText), 200);
                	}catch(e){
                		option.callback(xhr.responseText, 200);
                	}
                }
                that.safe = true;
            }
        } else {
            try{
        		option.callback(JSON.parse(xhr.responseText), 500);
        	}catch(e){
        		option.callback(xhr.responseText, 500);
        	}
        	that.safe = true;
        }
    }
    xhr.upload.onprogress = function (event) {
        var pre = Math.floor(100 * event.loaded / event.total);
        if (option.uploading instanceof Function) {
            option.uploading(pre);
        }
    }
    xhr.send(fd);
};

/**
 * 校验是否安全
 * @return {[boolean]} 安全返回true，不安全返回false
 */
SuperUpload.prototype.validata = function(){
	if (this.conf['async'] === true) {
		return true;
	}
	if (this.safe && this.safe === true) {
		return true;
	}
	if (this.safe == undefined || this.safe == null) {
		return true;
	}
	return false;
};

/**
 * 循环迭代
 * @param  {[array or json]} 				arr  迭代的数组对象或者json
 * @param  {[function]} 	 				call callback回调，三个参数（索引，当前项，目标对象）
 * @return {[current SuperUpload instance]}      返回当前SuperUpload实例
 */
SuperUpload.prototype.each = function(arr, call){
	if (arr && (typeof call === "Function" || typeof call === "function")) {
		for(var k in arr){
			call && call.call(this, k, arr[k], arr);
		}
	}else{
		throw new TypeError("SuperUpload.each(arr) this param arr is not null");
	}
	return this;
};

/**
 * 创建dom节点
 * @param  {[string]} name  dom节点名称
 * @return {[dom]}      	dom节点实例
 */
SuperUpload.prototype.createDom = function(name){
	if (name) {
		return document.createElement(name);
	}
	throw new TypeError("SuperUpload.createDom(name) this name in not null");
};

/**
 * 拷贝json数据
 * @param  {[json]} newObj    				需要替换的数据
 * @param  {[json]} targetObj 				存在的数据，将被替换掉的数据
 * @return {[current SuperUpload instance]} 返回当前SuperUpload实例
 */
SuperUpload.prototype.copyJsonObject = function(newObj, targetObj){
	for (var k in targetObj) {
		newObj[k] = targetObj[k];
	}
	return this;
};

/**
 * 判断数据类型
 * @param  {[object]} o 参数对象
 * @return {[string]}   参数对象的类型
 */
SuperUpload.prototype.getClass = function(o) { //判断数据类型
    return Object.prototype.toString.call(o).slice(8, -1);
}

/**
 * 深度拷贝json对象
 * @param  {[json]} obj 目标json对象
 * @return {[json]}     返回拷贝的jsond对象
 */
SuperUpload.prototype.deepCopy = function(obj) {
    var result, oClass = this.getClass(obj);

    if (oClass == "Object") result = {}; //判断传入的如果是对象，继续遍历
    else if (oClass == "Array") result = []; //判断传入的如果是数组，继续遍历
    else return obj; //如果是基本数据类型就直接返回

    for (var i in obj) {
        var copy = obj[i];

        if (this.getClass(copy) == "Object") result[i] = this.deepCopy(copy); //递归方法 ，如果对象继续变量obj[i],下一级还是对象，就obj[i][i]
        else if (this.getClass(copy) == "Array") result[i] = this.deepCopy(copy); //递归方法 ，如果对象继续数组obj[i],下一级还是数组，就obj[i][i]
        else result[i] = copy; //基本数据类型则赋值给属性
    }

    return result;
}

/**
 * 兼容addListener函数
 * @param  {[dom]}   	ele  					 dom元素
 * @param  {[event]}    event 					 事件监听类型
 * @param  {Function} 	fn    					 事件监听回调函数
 * @return {[current 	SuperUpload instance]}   返回当前SuperUpload实例
 */
SuperUpload.prototype.addListener = function(ele,event,fn){
	if (ele) {
		if(ele.addEventListener){
        	ele.addEventListener(event,fn,false);
	    }else{
	        ele.attachEvent('on'+event,fn.bind(ele));
	    }
	}
    return this;
}

/**
 * 兼容removeEventListener函数
 * @param  {[dom]}   	ele  					 dom元素
 * @param  {[event]}    event 					 事件监听类型
 * @param  {Function} 	fn    					 事件监听回调函数
 * @return {[current 	SuperUpload instance]}   返回当前SuperUpload实例
 */
SuperUpload.prototype.removeListener = function(ele,event,fn){
    if(ele.removeEventListener){
        ele.removeEventListener(event,fn,false);
    }else{
        ele.detachEvent('on'+event,fn.bind(ele));
    }
    return this;
}