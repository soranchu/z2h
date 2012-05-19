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
		
		
		var expected = [
					    "www.ignore.com/",
					    "www.ignore.com/pages",
					    "www.ignore.com/pages/hoge",
					    "www.ignore.com/pages/hoge/",
					    "www.ignore.com/pages.html",
					    "www.https.ignore.org/",
					    "www.https.ignore.com/pages.html",
		];

		expect(expected.length + 5);

		localStorage["ignorePages"] = urls.join(",");
		notEqual(localStorage["ignorePages"],undefined, "preconfig1");
		
		bg.init();
		equal(localStorage["ignorePages"],undefined, "remove old localStorage[ignorePages] settings");
		
		var resultjson = localStorage["store.settings.ignorePages"];
		notEqual(resultjson, undefined, "localStorage store");
		
		var results = JSON.parse(resultjson);
		notEqual(results, undefined, "stored setting parse");
		
		equal(results.length, expected.length, "result size check");
		for( var i = 0; i < expected.length; ++i){
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
		
		
		var expected = [
					    "www.ignore.com",
					    "www.https.ignore.org",
					    "www.https.ignore.com",
			];
		expect(expected.length + 5);

		localStorage["ignoreDomains"] = urls.join(",");
		notEqual(localStorage["ignoreDomains"],undefined, "preconfig1");
		
		bg.init();
		equal(localStorage["ignoreDomains"],undefined, "remove old localStorage[ignoreDomains] settings");
		
		var resultjson = localStorage["store.settings.ignoreDomains"];
		notEqual(resultjson, undefined, "localStorage store");
		
		var results = JSON.parse(resultjson);
		notEqual(results, undefined, "stored setting parse");
		
		equal(results.length, expected.length, "result size check");
		for( var i = 0; i < expected.length; ++i){
			equal(results[i],expected[i], "import test #"+i);
		}
	});

	test("translate pattern table", function() {
		localStorage.clear();
		var bg = Background();

		bg.init();
		var patjson = localStorage["store.settings.patternTable"];
		notEqual(patjson, undefined, "get stored value");
		
		var pat = JSON.parse(patjson);
		var expected = {
			alpha : {
				pat   : "\\uff21-\\uff3a\\uff41-\\uff5a",
				chars : "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ"
			},
			num : {
				pat   : "\\uff10-\\uff19",
				chars : "０１２３４５６７８９"
			},
			syms : {
				pat   : "\\uff01-\\uff0f\\uff1a-\\uff20\\uff3b-\\uff40\\uff5b-\\uff5d",
				chars : "！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝"
			},
			tilde : {
				pat   : "\\uff5e-\\uff5e",
				chars : "～"
			},
			space : {
				pat   : "\\u3000-\\u3000",
				chars : "　"
			},
			_version: 2.2
		};
		deepEqual(pat,expected, "check pattern table");
	});

	module("Module B");

	test("some other test", function() {
		expect(2);
		equal(true, false, "failing test");
		equal(true, true, "passing test");
	});

});