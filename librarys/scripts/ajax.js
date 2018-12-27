
/** 
 * ajax upload
 * @author xiaofeng<215628355@qq.com>
 */

var XFFILEUPLOAD = {    
        fileObj    : null,
        serverUrl  : null,
        uploadToken : null,
        progress : function(e){},
        success: function(result){},
        error: function(msg,code){},
        init : function(){
            var self = this;
            var fileObj = $(self.fileObj).get(0).files[0]; // js 获取文件对象
            if (typeof (fileObj) == "undefined" || fileObj.size <= 0) {  
                self.error('请选择文件',1);
            }
            var formFile = new FormData();
            formFile.append("token", self.uploadToken);  
            formFile.append("file", fileObj); //加入文件对象

            var data = formFile;
            $.ajax({
                url: self.serverUrl,
                data: data,
                type: "Post",
                dataType: "json",
                cache: false,//上传文件无需缓存
                processData: false,//用于对data参数进行序列化处理 这里必须false
                contentType: false, //必须
                xhr: function(){ //获取ajaxSettings中的xhr对象，为它的upload属性绑定progress事件的处理函数  
                    myXhr = $.ajaxSettings.xhr();  
                    if(myXhr.upload){ //检查upload属性是否存在  
                        //绑定progress事件的回调函数  
                        myXhr.upload.addEventListener('progress',function(e){
                            //处理进度条
                            var percent=e.loaded / e.total;//计算百分比                        
                            self.progress(e);
                        }, false);   
                    }  
                    return myXhr; //xhr对象返回给jQuery使用  
                },

                success: function (result) {   
                    self.success(result);
                },
                error: function(){
                    self.error('上传失败',2);
                }
        })
    }
};
(function($){
    //绑定上传
    $(".ajax-upload").each(function(i,m){    
        var addbinChange = function(e){    
            var obj = $(e).find("input[type='file']");
            obj.change(function(){
                var url   = $(e).data('url')
                var token = $(e).data('token')
                var background = $(e).find('.ajax-upload-image-background');
                var view = $(e).find('.ajax-upload-image');
                var show = $(e).find('.ajax-upload-show');
                var hide = $(e).find('.ajax-upload-hide');
                var progress = $(e).find('.ajax-upload-progress');  
                var input = $(e).find('.ajax-upload-val');
                var params = {
                    fileObj    : obj,
                    serverUrl  : url,
                    uploadToken :token,
                    progress : function(e){
                        var percent = Math.round(e.loaded / e.total * 100);
                        progress.show().val(percent);
                    },
                    success: function(result){
                        if(result.code == 1){
                            $.toast(result.msg)
                            input.val(result.data.id)
                            hide.hide()
                            show.show();
                            background.css({
                                backgroundImage:'url(' + result.data.path + ')'
                            });
                            view.attr('src',result.data.path)               
                            progress.hide()
                       }else{
                           progress.val(0).hide()
                           $.toast(result.msg,'cancel')
                       }                                
                       this.reload()
                    },
                    error: function(msg,code){
                        $.toast(msg,'forbidden')
                        hide.show()
                        show.hide();
                        background.css({
                            backgroundImage:''
                        });
                        view.attr('src','')     
                        progress.val(0).hide()  
                        this.reload()
                    },
                    reload : function(){
                        $(obj).unbind('change'); 
                        var nobj = obj.prop("outerHTML");                    
                        nobj = $(nobj);
                        obj.after(nobj);//克隆一个新的对象
                        obj.remove();//删除原对象              
                        addbinChange(m);
                    }
                }
                console.log('params',params)
                var file = $.extend(XFFILEUPLOAD, params);
                file.init();   
                return false;
            })
        };
        addbinChange(m);
    })
})(jQuery)


