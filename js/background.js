var tabStatus = {};

var settings = new Store("settings", {
    "ignorePages": [],
    "ignoreDomains": [],
    "patternTable":null,
    "replace_alpha": true,
    "replace_num": true,
    "replace_space": true,
    "replace_sym": true,
    "replace_tilde": false
});
function log(str){
	//console.log(str);
}

importOldSettings();
createTranslateTable();
function importOldSettings(){
	var pages = localStorage["ignorePages"];
	var domains = localStorage["ignoreDomains"];

	if( pages ){
		pages = pages.split(/,(?=https?\:\/\/)/);
		var ignorePages = settings.get("ignorePages");
		for(var i = 0; i < pages.length; ++i ){
			if( ! arrayContains(ignorePages, pages[i]) ){
				ignorePages.push(pages[i]);
			}
		}
		settings.set("ignorePages",ignorePages);
	}
	if( domains ){
		domains = domains.split(/,(?=https?\:\/\/)/);
		var ignoreDomains = settings.get("ignoreDomains");
		for(var i = 0; i < domains.length; ++i ){
			if( ! arrayContains(ignoreDomains, domains[i]) ){
				ignoreDomains.push(domains[i]);
			}
		}
		settings.set("ignoreDomains",ignoreDomains);
	}
	localStorage.removeItem("ignorePages");
	localStorage.removeItem("ignoreDomains");
	
}

function arrayContains(arr, val){
	for(var i = 0; i < arr.length; ++i){
		if( val == arr[i] ){
			return true;
		}
	}
	return false;
}

function createTranslateTable(){
	var pat = settings.get("patternTable");
	if( ! pat || pat._version <= 1 ){
		
		pat = {};
		pat.alpha =  makePattern([{from:'Ａ',to:'Ｚ'},{from:'ａ',to:'ｚ'}]);
		pat.num = makePattern([{from:'０',to:'９'}]);
		pat.syms = makePattern([{from:'！',to:'／'},{from:'：',to:'＠'},{from:'［',to:'｀'},{from:'｛',to:'｝'}]);
		pat.tilde = makePattern([{from:'～',to:'～'}]);
		pat.space = makePattern([{from:'　',to:'　'}]);
	
		pat._version = 2;
		
		settings.set("patternTable", pat);
	}
}
function makePattern(ranges){
	var pat = [];
	var str = "";

	for(var r = 0;r < ranges.length; ++r){
		var range = ranges[r];

		for( var i = range.from.charCodeAt(0); i <= range.to.charCodeAt(0); ++i){
			str += String.fromCharCode(i);
		}
		
		var from = "000" + range.from.charCodeAt(0).toString(16);
		from = from.substr(from.length-4);
		var to = "000" + range.to.charCodeAt(0).toString(16);
		to = to.substr(to.length-4);
		
		pat.push("\\u"+from+"-\\u"+to);
	}

	return {"pat":pat.join(""),"chars":str};
}

function getManifest(cb){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "manifest.json");
	xhr.onreadystatechange = function() {
		if( xhr.readyState == 4 ){
			var json = JSON.parse(xhr.responseText);
			cb(json);
		}
	};
	xhr.send();
}

function addIgnorePage(url){
	var ignorePages = settings.get("ignorePages");
	ignorePages.push(url);
	settings.set("ignorePages",ignorePages);
}
function removeIgnorePage(url){
	var ignorePages = settings.get("ignorePages");
	for(var i = 0; i < ignorePages.length; ++i){
		if( url == ignorePages[i] ){
			ignorePages.splice(i,1);
			settings.set("ignorePages",ignorePages);
			return;
		}
	}
}
function addIgnoreDomain(url){
	var ignoreDomains = settings.get("ignoreDomains");
	ignoreDomains.push("http://"+url);
	settings.set("ignoreDomains",ignoreDomains);
}

function removeIgnoreDomain(url){
	var ignoreDomains = settings.get("ignoreDomains");
	for(var i = 0; i < ignoreDomains.length; ++i){
		if( url.indexOf(ignoreDomains[i]) == 0 ){
			ignoreDomains.splice(i,1);
			settings.set("ignoreDomains",ignoreDomains);
			return;
		}
	}
}
function isIgnoreUrl(url){
	var ignorePages = settings.get("ignorePages");
	for(var i = 0; i < ignorePages.length; ++i){
		if( url == ignorePages[i] ){
			return "IGNORE_PAGE";
		}
	}
	var ignoreDomains = settings.get("ignoreDomains");
	for(var i = 0; i < ignoreDomains.length; ++i){
		if( url.indexOf(ignoreDomains[i]) == 0 ){
			return "IGNORE_DOMAIN";
		}
	}
	return "";
}

function onRequest(request, sender, sendResponse) {
	var res = {};
	
	log("[bg] onRequest cmd:" + request.cmd + " sender:" + sender.tab.id + " url:" + request.url );
	
	if( request.cmd === "isEnabled" ){
		var iframe = sender.tab.url != request.url;
		
		res.enabled = isIgnoreUrl(request.url);
		res.iframe = iframe;
		
		res.settings = settings.toObject();
		
		if (!iframe){
			tabStatus[sender.tab.id] = {
					"enabled":res.enabled,
					"replaced":0,
					"status":""
			};
			if( res.enabled !== "" ){
				log("[bg] set icon status disalbled : " + res.enabled);
				tabStatus[sender.tab.id].status = "さよなら全角英数は無効になっています";
				chrome.pageAction.setIcon({
					"tabId":sender.tab.id,
					"path":"res/icon_19_gray.png"
				});
				chrome.pageAction.setTitle({
					"tabId":sender.tab.id,
					"title":tabStatus[sender.tab.id].status
				});
				chrome.pageAction.show(sender.tab.id);
			}
		}
	}else if( request.cmd === "update" ){
		var iframe = request.iframe;

		if( !iframe ){
			if( request.replaced > 0 ){
				log("[bg] set icon status enabled. replaced :" + request.replaced);
				tabStatus[sender.tab.id].replaced = request.replaced;
				tabStatus[sender.tab.id].status = ""+request.replaced+"文字の全角英数を半角に置換しました";
				chrome.pageAction.setTitle({
					"tabId":sender.tab.id,
					"title":tabStatus[sender.tab.id].status
				});
				chrome.pageAction.setIcon({
					"tabId":sender.tab.id,
					"path":"res/icon_19_red.png"
				});
				chrome.pageAction.show(sender.tab.id);
			}else{
				log("[bg] hide icon");
				chrome.pageAction.hide(sender.tab.id);
			}
		}else{
			log("[bg] add in-frame replaced :" + request.replaced);
			if( request.replaced > 0 && tabStatus[sender.tab.id].replaced > 0 ){
				log("[bg] set icon status enabled.");
				chrome.pageAction.setIcon({
					"tabId":sender.tab.id,
					"path":"res/icon_19_red.png"
				});
				chrome.pageAction.show(sender.tab.id);
			}
			tabStatus[sender.tab.id].replaced += request.replaced;
			tabStatus[sender.tab.id].status = ""+tabStatus[sender.tab.id].replaced+"文字の全角英数を半角に置換しました";
			chrome.pageAction.setTitle({
				"tabId":sender.tab.id,
				"title":tabStatus[sender.tab.id].status
			});
		}
	}
	log("[bg] sending response");
	sendResponse(res);
};

chrome.extension.onRequest.addListener(onRequest);

