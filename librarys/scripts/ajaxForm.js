/**
* 因安卓触发多次点击，故强制表单使用ajax提交，请到表单的 按钮上加上 ajax-form class名 并用data-form指定表单form 的id
*
*
*/

	//判断访问终端
var browser={
    versions:function(){
        var u = navigator.userAgent, 
            app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " qq" //是否QQ
        };
    }(),
    language:(navigator.browserLanguage || navigator.language).toLowerCase()
}

function load_app(){	
    var ios = $("meta[name='ios-app-url']").attr("content");
	var android = $("meta[name='android-app-url']").attr("content")
	if(browser.versions.weixin){	
		if(browser.versions.ios){	
			window.location.href = ios					
		}else{
			window.location.href = 'http://sj.qq.com/myapp/detail.htm?apkName=com.ebz.xingshuo'
		}
	} else{
		if(browser.versions.ios){
			window.location.href = ios
		}else{	
			window.location.href = android
		}
	}
}
(function($){
  // $.toast.prototype.defaults.duration = 200000;
	var disabled = false;

	$(".ajax-form").click(function(e){
		e.preventDefault();
		e.stopPropagation();

		if(disabled) return;

		var id = $(this).data('form');
		var that = this;
		disabled = true;
	    $(this).prop('disabled',true);
		var formData = new FormData($(id)[0]);
		$.ajax({
			type: 'post',
			url:$(id).attr('action'),
			data:formData,
			contentType: false,
			processData: false,
			success:function(ret){
				setTimeout(function(){
					disabled = false;
					$(that).prop('disabled',false);
				},2000)
				if(ret.code == 1){
					$.toast(ret.msg,function(){
						if(ret.url){
							location.href = ret.url
						}else{
							//location.reload()
						}
					})
					return;
				}
				var error = ret.data.error || '';
				if(error){
					//return;
				}
				$.toast(ret.msg,'text',function(){

				})
			}
		})
		return false;
	})

	$(document).on('click',".ajax-url",function(){


		var href = $(this).attr("href");
		var confirm  = $(this).data("confirm");
		var time  = $(this).data("time");
		if(!time){
			time = 2000
		}
		var request = function(){
			$.post(href,{},function(ret){			
				if(ret.code == 1){

					$.toast(ret.msg,time,function(){
					
						if(ret.url){
							location.href = ret.url
						}else{
							location.reload()
						}
					})
					return;
				}
				$.toast(ret.msg,'text',function(){

				})
			},'json')
		}
		if(confirm){
			$.confirm(confirm, function() {
			  request()
			});
		}else{
			request()
		}

		return false;
	})
	
	  $(document).on('click',".dl-load-app",function(){
		load_app();		
	})


    $(document).on('click',"[location-href]",function(){
		window.location.href =  $(this).attr("location-href");	
	})
	
	
	$(document).on('click','[vlidata-code]',function(){
	   var  m = $(this).find('m');
        try{
			var is = m.size();
		}catch(e){
			var is = m.length || 0 ;
		}		
		if(is){
			// $.toast('请勿重试');
			return false;
		}
		var par = $(this).parents('[vlidata-box]');
		var token = par.data('token');
		var url  = par.data('url');
		var mobile  = par.find('[vlidata-mobile]').val();
		$.post(url,{mobile:mobile,token:token},function(result){
			if(result.code = 1){
				
				par.find('[vlidata-code-id]').val(result.data.code_id);	
				$.cookie("checkCode",60)				
				codetimes(par.find('[vlidata-code]'));	
			}
			$.toast(result.msg,'text');
			
		},'json')
		
	})
 
	var codetimes = function(obj){	
		var time = $.cookie("checkCode");
		//console.log(time)
		if(time && time >0){
			obj.html('<m>' + time + 's</m>');			
			time --;
			$.cookie("checkCode",time)
			setTimeout(function(){
				codetimes(obj)
				
			},1000)
			
			return;
		}
		obj.html('发送验证码');			
	}
	
	var time =  $.cookie("checkCode");
	if(time && time >0){
		codetimes($('[vlidata-code]'))
		return;
	}

})(jQuery)
