$(document).ready(function(){
	module("Basic",{
		setup:function(){
			
		}
	});
    
	test("get Background object", function() {
		var bg = chrome.extension.getBackgroundPage().background;
		notEqual( bg, undefined, "get bg obj ok");

		bg.init();
		
	});
	
	module("Module A");
	
	test("first test within module", function() {
	  ok( true, "all pass" );
	});
	
	test("second test within module", function() {
	  ok( true, "all pass" );
	});
	
	module("Module B");
	
	test("some other test", function() {
	  expect(2);
	  equal( true, false, "failing test" );
	  equal( true, true, "passing test" );
	});

});