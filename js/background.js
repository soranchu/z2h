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
	console.log(str);
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
function getSiteStatus(url){
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
	return "ENABLE";
}

function setIconStatus(tabid){
	var enabled = true;
	var visible = false;
	
	if( tabStatus[tabid] ){
		if( tabStatus[tabid].siteStatus !== "ENABLE" ){
			tabStatus[tabid].status = "さよなら全角英数は無効になっています";
			enabled = false;
			visible = true;
		}else if( tabStatus[tabid].replaced > 0 ){
			tabStatus[tabid].status = ""+tabStatus[tabid].replaced+"文字の全角英数を半角に置換しました";
			enabled = true;
			visible = true;
		}else{
			enabled = true;
			visible = false;
		}
	}
	
	chrome.pageAction.setIcon({
		"tabId":tabid,
		"path":enabled ? "res/icon_19_red.png" : "res/icon_19_gray.png"
	});
	chrome.pageAction.setTitle({
		"tabId":tabid,
		"title":tabStatus[tabid].status
	});
	if( visible ){
		chrome.pageAction.show(tabid);
	}else{
		chrome.pageAction.hide(tabid);
	}
}

function onTabUpdated(tabId, changeInfo, tab){
	log("tab updated : tabid:" +tabId + " info:status:" + changeInfo.status + " info.url:" +changeInfo.url );
	setIconStatus(tabId);
}
function onRequest(request, sender, sendResponse) {
	var res = {};
	
	log("[bg] onRequest cmd:" + request.cmd + " sender:" + sender.tab.id + " url:" + request.url + " iframe:"+request.iframe );
	var iframe = request.iframe;
	
	if( request.cmd === "loaded" ){
		
		res.siteStatus = getSiteStatus(request.url);
		res.settings = settings.toObject();
		
		if (!iframe){
			tabStatus[sender.tab.id] = {
					"siteStatus":res.siteStatus,
					"replaced":0,
					"status":""
			};
			setIconStatus(sender.tab.id);
		}
	}else if( request.cmd === "update" ){

		if( !iframe ){
			tabStatus[sender.tab.id].replaced = request.replaced;
		}else{
			tabStatus[sender.tab.id].replaced += request.replaced;
		}
		setIconStatus(sender.tab.id);
	}
	sendResponse(res);
};
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.extension.onRequest.addListener(onRequest);

