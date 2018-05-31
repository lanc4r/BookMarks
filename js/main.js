$("#run").click(function (){

	var keyWords = $("#keywords").val();
	localStorage.keyWords = keyWords;

	// 在点击搜索的时候需要先初始化搜索部分的数据
	init();

	// 在 Run 点击事件触发之后，将用户输入框中的数据存放到 localStorage 中去
	chrome.bookmarks.search(keyWords, function(bookmarkArray){

		// 先展示搜索结果的条目数，如果小于 0，则提示没有搜索数据，并且后面也不用做了
		var length = bookmarkArray.length;
		if (length < 1){
			$("#data-count").html("一条数据也没有找到诶 o(TヘTo).");
			return;
		}

		$("#data-count").html("共为您搜索到: " + bookmarkArray.length + " 条结果.");

		var dataArr = bookmarkArray.map(function (val){
			return getData(val);
		});

		// 拿到 除了标签分类=名字的所有数据，接下来我们需要 将其输出再页面上
		dataArr.forEach(function (val){
			//数据格式： 0xkernel::2017-09-28::1::http://0xkernel.com/#，别 瞎折腾！！！
			var tempArr = val.split("::");
			chrome.bookmarks.get(tempArr[2]+"", function (arr){
				$("#data-view").append(createDataDiv(tempArr[0], tempArr[1], arr[0].title, tempArr[3], tempArr[4]));
			});
		});
	});
});


// 格式化日期 xxxx-xx-xx 年-月-日 形式
function timestamp2Date(timestamp){
	var date = new Date(timestamp);
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();

	if (month < 10){
		month = "0" + month;
	}

	if (day < 10){
		day = "0" + day;
	}
	return year+"-"+month+"-"+day;
}


// 创建显示元素，并将元素添加到显示页面中
function createDataDiv(title, time, category, url, id){
	var $div = $("<div></div>");
	var $spanTitle = $("<p>书签名: " + title + "</p>");
	var $spanTime = $("<p>收藏于: " + time + "</p>");
	var $spanCategory = $("<p>所属分类: " + category +"</p>");
	var $aLocation = $("<a href=" + url + " class='btn btn-info btn-sm' target='_blank'>跳转</a> ");
	var $space = $("<span> <span>");
	var $btnDelte = $("<button id='delete' type='button' class='btn btn-danger btn-sm' value=" + id + " data-toggle='modal' data-target='#confirm-delete'>删除</button>");
	var $hr = $("<hr/>");

	$div.append($spanTitle);
	$div.append($spanTime);
	$div.append($spanCategory);
	$div.append($aLocation);
	$div.append($space);
	$div.append($btnDelte);
	$div.append($hr);

	return $div;
}


// 格式化数据的方法 (书签xxx 于 xxxx-xx-xx 被 收藏于 xxx) ！   将 bookmarkArray 中的 val 格式化为数据的方法
function getData(bookmark){
	var title = bookmark.title;
	var timestamp = bookmark.dateAdded;
	var parentId = bookmark.parentId;
	//getCategoryNameById(parentId);
	//console.log("categoryName2: " + categoryName);
	var url = bookmark.url;
	var id = bookmark.id;
	return title + "::" + timestamp2Date(timestamp) + "::" + parentId + "::" + url + "::" + id;
}


// 初始化函数 —— 初始化显示数据的部分
function init(){
	$("#data-view").empty();
	$("#data-count").empty();
}

// 增加 data-view div 的监听事件，当其 DOM 结构发生改变的时候进行事件的处理
$("#data-view").on("DOMSubtreeModified", function (event){

	$(".btn.btn-danger.btn-sm").click(function(){

		var id = this.value;

		// 这里面再给 按钮添加事件，当按删除按钮之后，调用删除函数，然后刷新页面
		$("#delete-bookmarks").click(function (){
			chrome.bookmarks.remove(id, function (){
				console.log("delete success~");
				window.location.reload();
			});
		});

	});
});



// 为 input 增加 监听事件，当 input 框中的数据为空时候，进行 data-view 子节点 的删除 —— oninput 事件
$("#keywords").on("input", function (event){
	//console.log($(this).val().length);
	var length = $(this).val().length;
	
	// 判断当长度为 0，就将 显示部分的数据清除！  (这样还有也给问题，当用户不通过 输入，直接通过复制的话还是导致 元素不能被删除)
	if (length < 1){
		init();
	}
});


// 监听回车触发事件
$(document).keyup(function (event){
	if (event.keyCode == 13){
		$("#run").trigger("click");
	}
});


// 监听文档初始加载事件，判断 localStorage 是否有数据
$(document).ready(function (){

	// 增加输入框抖动效果
	POWERMODE.colorful = true;    // make power mode colorful
	POWERMODE.shake = false;       // turn off shake
	// TODO 这里根据具体情况修改
	document.body.addEventListener('input', POWERMODE);

	// 如果有数据就 将其放到 input 框中，并且触发 搜索按钮
	keyWords = localStorage.keyWords;

	if (keyWords != null || keyWords.length > 0){
		console.log("papapa~~");
		$("#keywords").val(keyWords);
		$("#run").trigger("click");
	}
});


