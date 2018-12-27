/*客户端socket.io接收与发送*/
//连接socket服务器
//连接状态设置为成功
var enterChat = 0;
//author huliangming<215628355@qq.com>

////////////////////////////////////////////////////////////////////////////////////
var Socket = {
    id : '#socket',
	data : null,
	giftArr : [] ,
	gifTimeOut :[],
    setBox : function(id){		
		this.id = id;
	},
	//初始化参数
    init: function (data) {
        var that = this;
        that.data = data;	
	
		setInterval(function () {				
			if (enterChat != 1) {			
				 var msg={ct:'聊天服务器未连接，请刷新'};
				 that.systemNot(msg);
			}
		}, 2000);
    },    
	//创建连接
	
	conn : function(){
		
        var data = this.data;	
		socket.emit('conn', {
			uid      :  data.uid,
			roomnum  :  data.roomnum,
			nickname :  data.user_nicename,
			stream  :   data.stream,
			equipment: 'pc',
			token  :    data.token
		});	
	},
	//发送消息
    emitData: function (event, msg) {
        socket.emit(event, msg);
    },
	//解析消息
	append : function(result){
		if(result== 'stopplay'){			
			return this.stopplay();
		}	
		var json = JSON.parse(result);
		console.log(json)
		var msgObject = json.msg[0];	
		var msgmethod = msgObject._method_;
		
		if(msgmethod=='SendMsg'){ //聊天信息
			this.sendMsg(msgObject);
		}else if(msgmethod=='SendGift'){ //赠送礼物
			this.sendGift(msgObject);
		}else if(msgmethod=='BuyKeeper'){ //购买守护
			//this.buyKeeper(msgObject);
		}else if(msgmethod=='SendHorn'){ //喇叭
			this.sendHorn(msgObject);
		}else if(msgmethod=='SystemNot'){ //系统信息
			this.systemNot(msgObject);
		}else if(msgmethod=='StartEndLive'){ //开关播
			this.stopplay()
		}else if(msgmethod=='CloseVideo'){ //关播
			this.stopplay();
		}
		else if(msgmethod=='light'){ //心赞			
			this.light(msgObject);
		}
		//
	},
	//填入消息并重载
	reload : function(msg,className){
		if(!msg) return null;
		var id = this.id ;	 
		var $li = $('<li />');
		$li.addClass(className);
		$li.append(msg);
	    $(id).append($li);
        if($(id + ' li').length > 100) {
            $(id + ' li').slice(0,50).remove()
			console.clear() 
        }	
		$(id).scrollTop( $(id)[0].scrollHeight );
       	return $li;	
	},
	//异常
	stopplay : function(){		
		window.location.reload()
		return 0;		
	},
	//一般消息
	sendMsg:function(data){
		var msgtype = data.msgtype;		
        var _msg = '';
        if(msgtype==0){
			_msg = '<label data-uid="'+data.ct.uid+'">'+data.ct.user_nicename+' : </label><span>进入房间</span>'  
        }else if(msgtype == 2) {
			_msg = '<label data-uid="'+data.uid+'">'+data.uname+' : </label><span>'+data.ct+'</span>'  
        }         
        this.reload(_msg,'sendmsg');
	},	
	//系统消息	
	systemNot:function(data){
		var _msg = '<label>系统消息 : </label><span>'+data.ct+'</span>'
        this.reload(_msg,'system');	
	},
	//礼物特效
	sendGift:function(data){
		var _msg = '<label data-uid="'+data.uid+'">'+data.uname+' : </label><span>我送了'+data.ct.number+'个'+data.ct.gift_name+'</span>';    
        var $li = this.reload(_msg,'gift');		
		//连击特效
		this.doubleHit(data,$li);
	},
	sendHorn:function(data){
		var action=data.ct.action;
		if(action=='sendsmallhorn'){
			this.sendSmallHorn(data);
		}else if(action=='sendbighorn'){
			this.sendBigHorn(data);
		}
	},
	sendSmallHorn:function(data){
		
	},
	sendBigHorn:function(data){
		var _msg = '<label data-uid="'+data.touid+'">喇叭消息 '+ data.uname +' : </label><span>'+data.ct.content+'['+data.touname+'的直播频道]</span>'
		this.reload(_msg,'horn');	
	},
	showEndRecommend:function(data){
		this.stopplay();
	},
	//连击效果
	doubleHit : function(data,obj){		
	     var gid =  data.ct.giftid;
         //若5秒内再次点击，取消计时
		// console.log(gid);
		 clearTimeout(this.gifTimeOut[gid])	;
       
		//获取礼物所在标签位置
		var img = obj.find('span');
		var top = img.offset().top;
		var left = img.offset().left; 
  
		if(! this.giftArr[gid]){			
			this.giftArr[gid] =  1;
		}else{
			this.giftArr[gid] ++;
		}
		//创建一个元素
        var number = this.giftArr[gid];	
		var content = $('<div> X ' + number + '</div>');
		content.css({
			position : 'absolute',
			top      : top,
			left     : left,
			zIndex   :  9999,
			fontSize : '20px',
			color    : '#fe1950'			
		});
		$('body').append(content);
		//设置动画并移除元素
		content.animate({
			top : 0,
            right:0,
            fontSize:'80px',			
		},'show','swing',function(){			
			content.remove();			
		});
		//重置计数
		var that = this;
		this.gifTimeOut[gid] = setTimeout(function(){			
			that.giftArr[gid] = 0;			
		},5000)
	},
	//心心效果
	//
	light : function(data){
		var rand = function(a,b){
			return a>b?0:Math.round(Math.random()*(b-a)+a);
		}
		var color = 'rgb('+rand(0,255)+','+rand(0,255)+','+rand(0,255)+')';
    
		var content = $('<div class="icon-xin"></div>');
		var top     = $(window).height() - 100;
		content.css({
			position : 'absolute',
			top     :  top + 'px',
			right    : '20px',
			zIndex   :  99999,
			fontSize : '20px',
			color    : color			
		});
		$('body').append(content);
		//设置动画并移除元素
		content.animate({
			top : rand(30,50) +'%',
            right:rand(0,30) +'%',  
			opacity:0			
		},5000,'easeInOutBounce' ,function(){			
			content.remove();			
		});	
	}
}

socket.on('connect', function() {
    console.log("连接成功");
	Socket.conn();
	enterChat = 1;
});
socket.on('disconnect', function() {
    console.log("与服务其断开");
	enterChat = 0;	
});
socket.on('reconnect', function() {
	enterChat = 1;
    console.log("重新连接到服务器");
});

/*客户端广播接收broadcasting*/

socket.on('broadcastingListen', function (data) {
	for(i=0;i<data.length;i++){	
	    //将信息填写到区域中去
		Socket.append(data[i]);		
	}
});
socket.on('heartbeat', function (data) {
    socket.emit("heartbeat","heartbeat");
});
//==========node改====================conn===========================================
socket.on('conn', function (data) {  
	console.log(data)
});
//==========node改====================conn===========================================
