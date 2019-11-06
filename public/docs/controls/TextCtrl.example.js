
var using = ["TextCtrl"];

$(function () {
	var t1 = new TextCtrl(10,0, 'First text');
	var t2 = new TextCtrl(10,100, 'Second text');
	var t3 = new TextCtrl(10,170, 'Third text');
	var t4 = new TextCtrl(100, 200, 'Fourth text');
	var t5 = new TextCtrl(100, 100, 'Fifth text');
	t2.rotate(45);
	t3.scale(7);
	t1.getElement().css('color','blue');
	t1.getElement().css('background','yellow');
	t2.getElement().css('border-style','dashed');
	t4.getElement().css({   'background-color': 'green', 
	                        'font-size': '200%',
	                        'color':'blue',
	                        'border-style':'outset',
	                        'border-width':'7px',
	                        'opacity':'0.8'
	                        
	                    });
	t4.rotate(225);
	t5.setValue('Fifth text changed');
});