$(document).ready(function(){

	var config;
	var loaderEl = 
	$('<div style="position : fixed;left:0;bottom: 0;top:0;right:0;background-color: rgba(0, 188, 212, 0.32);border: 1px solid gray;z-index:99;"></div>');
	
	loaderSubEl = $('<div style=""></div>');
	loaderSubEl.attr('style','margin: 0 auto;width: 220px;height: 150px;background-color: white;color: #03A9F4;border: 1px solid gray;box-shadow: 2px 2px 5px #03A9F4;box-sizing: border-box;')
	loaderEl.append(loaderSubEl);
	
	var titleEl,imageEl;
	
	loaderSubEl.append(titleEl = $('<div style="padding : 10px;">Some title</div>'));
	loaderSubEl.append(imageEl = $('<div><img/></div>'));
	
	var timeout;
	window.MyLoader = {
		
		el : function(){
			return {
				parent : loaderEl,
				title : titleEl,
				image : imageEl
			}
		},
		title : function(html){
			titleEl.html(html);
			return this;
		},
		image : function(src){
			imageEl.find('img').attr('src',src);
			return this;
		},

		show : function(timeout){
			clearTimeout(timeout);
			loaderEl.show();
			var self = this;
			if(timeout){
				timeout = setTimeout(function(){
					self.hide();
				},timeout);
			}
			return this;
		},
		
		
		hide : function(){
			clearTimeout(timeout);
			loaderEl.hide();
			return this;
		}
	}

	var resize = function(){
		loaderSubEl.css('margin-top',$(window).height()/2-loaderSubEl.height()/2);
	}
	
	resize();
	$(window).resize(resize);
	
	loaderEl.hide();
	window.loaderEl = loaderEl;
	$('body').append(loaderEl);
	
	function guid() {
	  function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	}
	
});