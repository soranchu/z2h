$(document).ready(function() {

	var removeListeners = function(){
		while( chrome.tabs.onUpdated.listeners_.length >1 ){
			chrome.tabs.onUpdated.removeListener(chrome.tabs.onUpdated.listeners_[1]);
		}
		while( chrome.extension.onRequest.listeners_.length >1 ){
			chrome.extension.onRequest.removeListener(chrome.extension.onRequest.listeners_[1]);
		}
	};
	
	test("instantiate", 2, function() {
		notEqual( Background, undefined, "check Background variable exists");
		var bg = Background();
		notEqual( bg, undefined, "instantiate Background");
		localStorage["ignorePages"] = "http://www.ignore.com/pages";
		bg.init();
	});

	module("Settings");

	test("import v1.0 ignore page settings", function() {
		localStorage.clear();
		var bg = Background();
		var urls = [
				    "",
				    "http://www.ignore.com",
				    "http://www.ignore.com/",
				    "http://www.ignore.com/pages",
				    "http://www.ignore.com/pages/hoge",
				    "http://www.ignore.com/pages/hoge/",
				    "http://www.ignore.com/pages.html",
				    "http://www.ignore.com/pages.html?param=value",
				    "http://www.ignore.com/pages.html?param=value&param2=value2",
				    "http://www.ignore.com/pages.html#anchor",
				    "https://www.https.ignore.org/",
				    "https://www.https.ignore.com/pages.html?param=value&param2=value2",
		];
		
		expect(urls.length + 4);
		
		var expected = [
					    "",
					    "www.ignore.com",
					    "www.ignore.com/",
					    "www.ignore.com/pages",
					    "www.ignore.com/pages/hoge",
					    "www.ignore.com/pages/hoge/",
					    "www.ignore.com/pages.html",
					    "www.ignore.com/pages.html",
					    "www.ignore.com/pages.html",
					    "www.ignore.com/pages.html",
					    "www.https.ignore.org/",
					    "www.https.ignore.com/pages.html",
		];
		localStorage["ignorePages"] = urls.join(",");
		notEqual(localStorage["ignorePages"],undefined, "preconfig1");
		
		bg.init();
		equal(localStorage["ignorePages"],undefined, "remove old localStorage[ignorePages] settings");
		
		var resultjson = localStorage["store.settings.ignorePages"];
		notEqual(resultjson, undefined, "localStorage store");
		
		var results = JSON.parse(resultjson);
		notEqual(results, undefined, "stored setting parse");
		
		for( var i = 0; i < urls.length; ++i){
			equal(results[i],expected[i], "import test #"+i);
		}
	});
	
	test("import v1.0 ignore domain settings", function() {
		localStorage.clear();
		var bg = Background();
		var urls = [
				    "",
				    "http://www.ignore.com",
				    "http://www.ignore.com/",
				    "http://www.ignore.com/pages",
				    "http://www.ignore.com/pages/hoge",
				    "http://www.ignore.com/pages/hoge/",
				    "http://www.ignore.com/pages.html",
				    "http://www.ignore.com/pages.html?param=value",
				    "http://www.ignore.com/pages.html?param=value&param2=value2",
				    "http://www.ignore.com/pages.html#anchor",
				    "https://www.https.ignore.org/",
				    "https://www.https.ignore.com/pages.html?param=value&param2=value2",
		];
		
		expect(urls.length + 4);
		
		var expected = [
					    "",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.ignore.com",
					    "www.https.ignore.org",
					    "www.https.ignore.com",
			];
		localStorage["ignoreDomains"] = urls.join(",");
		notEqual(localStorage["ignoreDomains"],undefined, "preconfig1");
		
		bg.init();
		equal(localStorage["ignoreDomains"],undefined, "remove old localStorage[ignoreDomains] settings");
		
		var resultjson = localStorage["store.settings.ignoreDomains"];
		notEqual(resultjson, undefined, "localStorage store");
		
		var results = JSON.parse(resultjson);
		notEqual(results, undefined, "stored setting parse");
		
		for( var i = 0; i < urls.length; ++i){
			equal(results[i],expected[i], "import test #"+i);
		}
	});

	test("second test within module", function() {
		ok(true, "all pass");
	});

	module("Module B");

	test("some other test", function() {
		expect(2);
		equal(true, false, "failing test");
		equal(true, true, "passing test");
	});

});