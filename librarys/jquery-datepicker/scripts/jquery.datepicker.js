/**
 * @Author:      allenAugustine
 * @Email:       iallenaugustine@gmail.com  -  misterji0708@qq.com
 * @DateTime:    2018-09-30 11:54:40
 * @Description: 模仿华为EMUI 8.1.0 input date 样式实现的日期选择器
 */

~(function($) {
  'use strict';
  if (typeof jQuery === 'undefined') {
    throw 'jquery.datepicker requires jQuery to be loaded first';
  }

  (function() {
    var initializing = false,
      fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
    window.Class = function() {};
    Class.extend = function(prop) {

      var _super = this.prototype;
      initializing = true;
      var prototype = new this();
      initializing = false;

      for (var name in prop) {
        prototype[name] = typeof prop[name] == "function" &&
          typeof _super[name] == "function" && fnTest.test(prop[name]) ?
          (function(name, fn) {
            return function() {
              var tmp = this._super;
              this._super = _super[name];
              var ret = fn.apply(this, arguments);
              this._super = tmp;
              return ret;
            };
          })(name, prop[name]) :
          prop[name];
      }

      function Class() {
        if (!initializing && this.init)
          this.init.apply(this, arguments);
      }

      Class.prototype = prototype;
      Class.prototype.constructor = Class;
      Class.extend = Class.extend;
      return Class;
    };
  })();

  var MJDatePicker = Class.extend({

    init: function(element, options) {
      this.daysData = [];
      var tempDateStr = element[0].nodeName === 'INPUT' ? element.val() : element.text();
      if(tempDateStr.split(/[^0-9]/).slice(0,3)){
        var tempDate = tempDateStr.split(/[^0-9]/).slice(0,3);
        this.date = new Date(tempDate[0],tempDate[1]*1 - 1,tempDate[2])
      }else{
        this.date = new Date();
      }
      this.currentYear = this.date.getFullYear();
      this.currentMonth = this.date.getMonth() + 1;
      this.currentDate = this.date.getDate();
      this.currentWeek = this.date.getDay();
      this.weeks = ['日', '一', '二', '三', '四', '五', '六'];
      this.currentChooseYear = this.date.getFullYear();
      this.currentChooseMonth = this.date.getMonth() + 1;
      this.currentChooseDate = this.date.getDate();
      this.currentChoosedYear = this.date.getFullYear();
      this.currentChoosedMonth = this.date.getMonth() + 1;
      this.currentChoosedDate = this.date.getDate();
      this.options = options;
      this.element = element;
      this.render();
    },

    //渲染日历控件DOM结构
    render: function() {
      $('.mj--datepicker-mask').remove();
      var weekDOM = '';
      this.weeks.forEach(function(item, index) {
        weekDOM += '<div class="mj--datepicker-item">' + item + '</div>';
      });
      var DOM = '<div class="mj--datepicker-mask" data-origin="mask">'
        + '  <div class="mj--datepicker-wapper">'
        + '    <style>'
        + '      .mj--datepicker-mask .mj--datepicker-items .active { background: ' + this.options.bg + '; color: ' + this.options.color + '; ' + this.options.activeExtend + ' }'
        + '      .mj--datepicker-mask .mj--datepicker-theme { background: ' + this.options.bg + '; color: ' + this.options.color + '; }'
        + '    </style>'
        + '    <div class="mj--datepicker-header mj--datepicker-theme">'
        + '      <h3 class="mj--datepicker-title"></h3>'
        + '    </div>'
        + '    <div class="mj--datepicker-content">'
        + '      <div class="mj--datepicker-control">'
        + '        <div class="mj--datepicker-prev mj--datepicker-control-btn" data-type="prev">'
        + '          <div class="mj-datepicker-arrow"></div>'
        + '        </div>'
        + '        <div class="mj--datepicker-show"></div>'
        + '        <div class="mj--datepicker-next mj--datepicker-control-btn" data-type="next">'
        + '          <div class="mj-datepicker-arrow"></div>'
        + '        </div>'
        + '      </div>'
        + '      <div class="mj--datepicker-week">' + weekDOM + '</div>'
        + '      <div class="mj--datepicker-items"></div>'
        + '    </div>'
        + '    <div class="mj--datepicker-footer">'
        + '      <div class="mj--datepicker-cancel mj--datepicker-btn">取消</div>'
        + '      <div class="mj--datepicker-confirm mj--datepicker-btn">确定</div>'
        + '    </div>'
        + '  </div>'
        + '</div>';
      $('body').append(DOM);
      this.mask = $('.mj--datepicker-mask');
      this.title = this.mask.find('.mj--datepicker-title');
      this.week = this.mask.find('.mj--datepicker-week');
      this.day = this.mask.find('.mj--datepicker-items');
      this.showTime = this.mask.find('.mj--datepicker-show');
      this.confirm = this.mask.find('.mj--datepicker-confirm');
      this.cancel = this.mask.find('.mj--datepicker-cancel');
      this.controls = this.mask.find('.mj--datepicker-control-btn');
      this.renderData();
      this.bindEvent();
      this.renderTitle(this.currentChooseYear, this.currentChooseMonth, this.currentDate);
      this.mask.fadeIn();
    },

    //获取当月的天数
    getThisMonthDays: function(year, month) {
      return new Date(year, month, 0).getDate();
    },

    //获取某天是星期几
    getDayOfWeek: function(year, month, day) {
      return new Date(Date.UTC(year, month - 1, day)).getDay();
    },

    //计算当月的天数
    calculateDays: function(year, month) {
      this.daysData = [];
      var thisMonthDays = this.getThisMonthDays(year, month);
      for (var i = 1; i <= thisMonthDays; i++) {
        this.daysData.push({
          day: i,
          choosed: false
        });
      }
    },

    //绑定事件
    bindEvent: function() {
      var self = this;
      //点击上一月 下一月
      this.controls.unbind();
      this.controls.on('click', function(e) {
        var type = $(this).data('type');
        // 添加点击动画
        $(".mj--datepicker-mask .ripple").remove();
        var posX = $(this).offset().left,
          posY = $(this).offset().top,
          buttonWidth = $(this).width(),
          buttonHeight = $(this).height();
        $(this).prepend('<span class="ripple"></span>');
        buttonHeight = buttonWidth >= buttonHeight ? buttonWidth : buttonHeight;
        var x = e.pageX - posX - buttonWidth / 2;
        var y = e.pageY - posY - buttonHeight / 2;

        $(".ripple").css({
          width: buttonWidth,
          height: buttonHeight,
          top: y + 'px',
          left: x + 'px'
        }).addClass("rippleEffect");

        //切换展示的日期
        switch (type) {
          case 'prev':
            self.currentChooseMonth--;
            if (self.currentChooseMonth < 1) {
              self.currentChooseMonth = 12;
              self.currentChooseYear--;
            }
            break;
          case 'next':
            self.currentChooseMonth++;
            if (self.currentChooseMonth > 12) {
              self.currentChooseMonth = 1;
              self.currentChooseYear++;
            }
            break;
          default:
            break;
        }
        self.renderData();
      });

      //点击天数
      this.dayItem.unbind();
      this.dayItem.on('click', function(e) {
        if (!$(this).is(":empty")) {
          $(this).addClass('active').siblings().removeClass('active');
          self.renderTitle(self.currentChooseYear, self.currentChooseMonth, $(this).text());
          self.currentChoosedDate = $(this).text();
          self.currentChoosedYear = self.currentChooseYear;
          self.currentChoosedMonth = self.currentChooseMonth;
          // self.confirm.trigger("click");
        }
      });

      //点击确定
      this.confirm.unbind();
      this.confirm.on('click', function(e) {
        var txt = self.currentChoosedYear + (self.options.formate == 'cn' ? '年' : self.options.formate) + self.currentChoosedMonth + (self.options.formate == 'cn' ? '月' : self.options.formate) + self.currentChoosedDate + (self.options.formate == 'cn' ? '日' : '');
        if (self.element[0].nodeName === 'INPUT') {
          self.element.val(txt);
        } else {
          self.element.text(txt)
        }
        self.mask.fadeOut('fast', function() {
          self.mask.remove();
        });
        if(self.options.callback){
          self.options.callback(self.currentChoosedYear,self.currentChoosedMonth,self.currentChoosedDate);
        }
      });

      //点击取消
      this.cancel.unbind();
      this.cancel.on('click', function(e) {
        self.mask.fadeOut('fast', function() {
          self.mask.remove();
        });
      });

      //点击遮罩层
      this.mask.unbind();
      this.mask.on('click', function(e) {
        if ($(e.target).data('origin') == 'mask') {
          self.mask.fadeOut('fast', function() {
            self.mask.remove();
          });
        }
      })
    },

    //渲染数据
    renderData: function() {
      // 渲染该月的每一天
      this.calculateDays(this.currentChooseYear, this.currentChooseMonth);
      var self = this,
        dayDOM = '',
        thisFirstDayWeek = this.getDayOfWeek(this.currentChooseYear, this.currentChooseMonth, 1);
      for (var i = 0; i < thisFirstDayWeek; i++) {
        dayDOM += '<div class="mj--datepicker-item"></div>';
      }
      this.daysData.forEach(function(item, index) {
        if (self.currentChoosedYear == self.currentChooseYear && self.currentChoosedMonth == self.currentChooseMonth && self.currentChoosedDate == item.day)
          dayDOM += '<div class="mj--datepicker-item active">' + item.day + '</div>';
        else
          dayDOM += '<div class="mj--datepicker-item">' + item.day + '</div>';
      });
      this.day.html(dayDOM);
      this.showTime.text(this.currentChooseYear + '年' + this.currentChooseMonth + '月');
      this.dayItem = this.day.find('.mj--datepicker-item');
      this.bindEvent();
    },

    //渲染标题
    renderTitle: function(year, month, day) {
      var week = this.getDayOfWeek(year, month, day);
      this.title.html(year + '年<span>' + month + '月' + day + '日周' + this.weeks[week] + '</span>')
    }
  });

  $.fn.extend({
    mjDatePicker: function(options) {
      var defaults = {
        color: '#ffffff',
        bg: '#00aeff',
        activeExtend: 'box-shadow: 0px 10px 30px 0px rgba(9, 177, 255, 0.4);',
        callback:function(){},
        formate:'cn'
      };
      $.extend(defaults, options);
      this.on('click', function() {
        new MJDatePicker($(this), defaults);
      })
    }
  });
})(jQuery);
