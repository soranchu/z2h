var background = (function(){
	"use strict";
	var log = function(str){
		//console.log(str);
	};
	
	var defaultOptions = {
	    "ignorePages": [],
	    "ignoreDomains": [],
	    "highlightPages": [],
	    "replace_alpha": true,
	    "replace_num": true,
	    "replace_kana": true,
	    "replace_space": true,
	    "replace_sym": true,
	    "replaceSymOptions" : [
	        true,true,true,true,true,true,true,true,
	        true,true,true,true,true,true,true,true,
	        true,true,true,true,true,true,true,true,
	        true,true,true,true,true,true,true,false
	    ],
	    "supportAjax" : false,
	    "supportHttps" : false,
	    "keepHeadingMBSpace" : false
	};
	
	var tabStatus = {};
	
	var settings = null;
	
	var patternTable = null;
	
	var customSymPattern = "";
	
	var initialized = false;
	var initWaiters = [];

	var importFromLocalStorage = function(name){
		var pat = localStorage.getItem("store.settings." + name);
		if( pat != undefined ){
			pat = JSON.parse(pat);
			settings.set(name, pat);
			localStorage.removeItem("store.settings." + name);
		}
	};
	
	var importOldSettings = function(){
		
		var showUpdatedPage = false;
		
		var prevVersion = localStorage.getItem("__version");
		if( ! prevVersion || parseFloat(prevVersion) <= 2.5 ){
			//update chrome.storage.sync from localStorage
			importFromLocalStorage("highlightPages");
			importFromLocalStorage("ignoreDomains");
			importFromLocalStorage("ignorePages");
			importFromLocalStorage("keepHeadingMBSpace");
			importFromLocalStorage("replaceSymOptions");
			importFromLocalStorage("replace_alpha");
			importFromLocalStorage("replace_num");
			importFromLocalStorage("replace_kana");
			importFromLocalStorage("replace_space");
			importFromLocalStorage("replace_sym");
			importFromLocalStorage("supportAjax");
			importFromLocalStorage("supportHttps");
			
			localStorage.removeItem("store.settings.patternTable");
			
			localStorage.setItem("__version", 2.6);
			if(parseFloat(prevVersion) < 2.5){
				showUpdatedPage = true;
			}
		}
		
		return showUpdatedPage;
	};
	
	var arrayContains = function(arr, val){
		if( arr === undefined )return false;
		for(var i = 0; i < arr.length; ++i){
			if( val == arr[i] ){
				return true;
			}
		}
		return false;
	};
	
	var createTranslateTable = function(){
		//var pat = settings.get("patternTable");
		//if( ! pat || pat._version <= 2.3 ){
			
			var pat = {};
			pat.alpha =  makePattern([{from:'Ａ',to:'Ｚ'},{from:'ａ',to:'ｚ'}]);
			pat.num = makePattern([{from:'０',to:'９'}]);
			pat.syms = makePattern([{from:'！',to:'／'},{from:'：',to:'＠'},{from:'［',to:'｀'},{from:'｛',to:'～'}]);
			//pat.syms_custom = pat.syms;
			//pat.tilde = makePattern([{from:'～',to:'～'}]);
			pat.space = makePattern([{from:'　',to:'　'}]);
			//pat.kana = makePattern([{from:'｡',to:'ﾟ'}]);
		
			pat._version = 2.5;
			
			patternTable = pat;
		//}
	};
	
	var updateCustomSymPattern = function(symValues){
		var symChars = patternTable.syms.chars;
		if( !symValues ){
			//customSymPattern = settings.get("patternTable").syms;
			//return;
			symValues = settings.get("replaceSymOptions");
		}
		
		var pat = [];
		var last = null;
		var char,lastChar = null;
		for( var i=0;i<symValues.length;++i){
			char = symChars[i];
			if( symValues[i] ){
				if( last != null && lastChar.charCodeAt(0)+1 == char.charCodeAt(0)){
					last.to = char;
				}else{
					if( last != null ){
						pat.push(last);
					}
					last = {};
					last.from = char;
				}
			}else{
				if( last != null ){
					pat.push(last);
					last = null;
				}
			}
			lastChar = char;
		}
		if( last != null ){
			pat.push(last);
		}
		customSymPattern = makePattern(pat);
		//log(pat);
		log("custom sym pat:" + customSymPattern.pat + "chars:"+customSymPattern.chars);
	};
	
	var makePattern = function(ranges){
		var pat = [];
		var str = "";
	
		for(var r = 0;r < ranges.length; ++r){
			var range = ranges[r];
	
			if( range.to === undefined ){
				str += range.from[0];
			}else{
				for( var i = range.from.charCodeAt(0); i <= range.to.charCodeAt(0); ++i){
					str += String.fromCharCode(i);
				}
			}
			var from = "000" + range.from.charCodeAt(0).toString(16);
			from = from.substr(from.length-4);
			
			if( range.to === undefined || range.from === range.to ){
				pat.push("\\u"+from);
			}else{
				var to = "000" + range.to.charCodeAt(0).toString(16);
				to = to.substr(to.length-4);
				
				pat.push("\\u"+from+"-\\u"+to);
			}
		}
	
		return {"pat":pat.join(""),"chars":str};
	};
	
	var getPattern = function(){
		var pat = "";
		var table = patternTable;
		if( settings.get("replace_alpha") ){
			pat += table.alpha.pat;
		}
		if( settings.get("replace_num") ){
			pat += table.num.pat;
		}
		if( settings.get("replace_sym") ){
			pat += customSymPattern.pat;
		}
		/*
		if( settings.replace_tilde ){
			pat += settings.patternTable.tilde.pat;
		}*/
		if( settings.get("replace_space") ){
			pat += table.space.pat;
		}
		return pat;
	};

	var getManifest = function(cb){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "manifest.json");
		xhr.onreadystatechange = function() {
			if( xhr.readyState == 4 ){
				var json = JSON.parse(xhr.responseText);
				cb(json);
			}
		};
		xhr.send();
	};
	
	var setIconStatus = function(tabid){
		var enabled = true;
		var visible = false;
		if( typeof tabid  != "number" || tabid <= 0 ){
			log("setIconStatus: invalid tabid:" + tabid);
		}
		if( tabStatus[tabid] ){
			if( tabStatus[tabid].siteStatus === "HIGHLIGHT" ){
				if( tabStatus[tabid].appended ){
					tabStatus[tabid].status = "全角英数を強調表示中(合計" + tabStatus[tabid].replaced+"文字変換しました)";
				}else{
					tabStatus[tabid].status = "全角英数を強調表示中(" + tabStatus[tabid].replaced+"文字ありました)";
				}
				enabled = true;
				visible = true;
			}else if( tabStatus[tabid].siteStatus !== "ENABLE" ){
				tabStatus[tabid].status = "さよなら全角英数は無効になっています";
				enabled = false;
				visible = true;
			}else if( tabStatus[tabid].replaced > 0 ){
				if( tabStatus[tabid].appended ){
					tabStatus[tabid].status = "合計"+tabStatus[tabid].replaced+"文字の全角英数を半角に置換しました";
				}else{
					tabStatus[tabid].status = ""+tabStatus[tabid].replaced+"文字の全角英数を半角に置換しました";
				}
				enabled = true;
				visible = true;
			}else{
				enabled = true;
				visible = false;
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
			log("setIconStatus tab:" + tabid +" visible:" + visible + " enable:" + enabled);
		}else{
			chrome.pageAction.hide(tabid);
			log("setIconStatus tab:" + tabid +" visible: false (undefined tabStatus)");
		}
		
	};
	
	var getSiteStatus = function(url){
		var match = urlMatcher(url);
		if( match ){
			if( !settings.get("supportHttps") && match.protocol == "https://" ){
				return "DISABLE";
			}
			var highlights = settings.get("highlightPages");
			if( arrayContains(highlights, match.page) ){
				return "HIGHLIGHT";
			}
			var ignorePages = settings.get("ignorePages");
			if( arrayContains(ignorePages, match.page) ){
				return "IGNORE_PAGE";
			}
			var ignoreDomains = settings.get("ignoreDomains");
			if( arrayContains(ignoreDomains, match.domain) ){
				return "IGNORE_DOMAIN";
			}
		}
		return "ENABLE";
	};
	
	var urlMatcher = function(url){
		if( !url )return;
		var match = url.match(/^(.*:\/\/)?(([^\/]+)(\/[^?#]*)?)/);
		if( match ){
			var page = match[2];
			if( page.indexOf("/") < 0 ){
				page += "/";
			}
			return {
				protocol : match[1],
				page : page,
				domain : match[3]
			};
		}
		//return url && url.match(/(https?|file):\/\/(([^\/]+)\/[^?#]*)/);
	};
	
	var onTabUpdated = function(tabId, changeInfo, tab){
		log("tab updated : tabid:" +tabId + " info:status:" + changeInfo.status + " info.url:" +changeInfo.url );
		if( changeInfo.url && ( 
				changeInfo.url.indexOf("http") != 0 
				|| (!settings.get("supportHttps") && changeInfo.url.indexOf("https") == 0) ) ){
			delete tabStatus[tabId];
		}
		setIconStatus(tabId);
	};
	var onTabClosed = function(tabId){
		delete tabStatus[tabId];
	};
	var onRequest = function(request, sender, sendResponse) {
		var res = {};
		
		var iframe = request.iframe;
		var append = request.append;
		
		if( request.cmd === "loaded" ){
			res.siteStatus = getSiteStatus(request.url);
			res.pattern = getPattern();
			res.supportAjax = settings.get("supportAjax");
			res.keepHeadingMBSpace = settings.get("keepHeadingMBSpace");
			res.replace_kana = settings.get("replace_kana");

			log("[bg] onRequest cmd:" + request.cmd + " sender:" + sender.tab.id + " url:" + request.url + " iframe:"+request.iframe + " status:" + res.siteStatus);
			
			if (!iframe ){
				if( res.siteStatus != "DISABLE" ){
					tabStatus[sender.tab.id] = {
							"siteStatus":res.siteStatus,
							"replaced":0,
							"status":"",
							"appended":false
					};
				}else{
					delete tabStatus[sender.tab.id];
				}
				setIconStatus(sender.tab.id);
			}
		}else if( request.cmd === "update" ){
			log("[bg] onRequest cmd:" + request.cmd + " sender:" + sender.tab.id + " relpaced:" + request.replaced + " iframe:"+request.iframe );
			
			if( ! tabStatus[sender.tab.id] ){
				log("unknown tab :" + sender.tab.id);
			}else{
				if( !iframe && !append ){
					tabStatus[sender.tab.id].replaced = request.replaced;
				}else{
					tabStatus[sender.tab.id].replaced += request.replaced;
					tabStatus[sender.tab.id].appended |= append;
				}
			}
			setIconStatus(sender.tab.id);
		}
		sendResponse(res);
	};
	
	var showOptionPage = function(){
		chrome.tabs.query({url:chrome.extension.getURL("settings/index.html")},function(tabs){
			if( tabs && tabs.length > 0 ){
				if( tabs.length > 1 ){
					log("showOptionPage:found 2 or more option page tabs. close them.");
					var closeTabIds = [];
					for( var i = 0; i< tabs.length-1; ++i){
						closeTabIds.push(tabs[i].id);
					}
					chrome.tabs.remove(closeTabIds);
					chrome.tabs.reload(tabs[tabs.length-1].id);
					chrome.tabs.update(tabs[tabs.length-1].id, {active:true});
				}else{
					log("showOptionPage:found an option page tab. activate it.");
					chrome.tabs.update(tabs[0].id, {active:true});
				}
			}else{
				log("showOptionPage:opening new option page tab.");
				chrome.tabs.create({url: "settings/index.html"});
			}
		});

	};
	
	return {
		setHighlight : function(url, enable){
			
			var highlight = settings.get("highlightPages");
			if( enable && !arrayContains(highlight, url) ){
				highlight.push(url);
			}else if( ! enable ){
				for( var i = 0; i < highlight.length; ++i){
					if( highlight[i] === url ){
						highlight.splice(i,1);
						break;
					}
				}
			}
			settings.set("highlightPages",highlight);
		},
		addIgnorePage : function(url){
			var ignorePages = settings.get("ignorePages");
			if( !arrayContains(ignorePages, url) ){
				ignorePages.push(url);
				settings.set("ignorePages",ignorePages);
			}
		},
		removeIgnorePage : function(url){
			var ignorePages = settings.get("ignorePages");
			for(var i = 0; i < ignorePages.length; ++i){
				if( url == ignorePages[i] ){
					ignorePages.splice(i,1);
					settings.set("ignorePages",ignorePages);
					return;
				}
			}
		},
		addIgnoreDomain : function(url){
			var ignoreDomains = settings.get("ignoreDomains");
			if( !arrayContains(ignoreDomains, url) ){
				ignoreDomains.push(url);
				settings.set("ignoreDomains",ignoreDomains);
			}
		},
		
		removeIgnoreDomain : function(url){
			var ignoreDomains = settings.get("ignoreDomains");
			for(var i = 0; i < ignoreDomains.length; ++i){
				if( url.indexOf(ignoreDomains[i]) == 0 ){
					ignoreDomains.splice(i,1);
					settings.set("ignoreDomains",ignoreDomains);
					return;
				}
			}
		},
		
		urlMatcher : urlMatcher,
		
		init : function(){
			createTranslateTable();
			settings = new Store("settings", defaultOptions, function(){
				var updated = importOldSettings();
				updateCustomSymPattern();
				
				chrome.tabs.onUpdated.addListener(onTabUpdated);
				chrome.tabs.onRemoved.addListener(onTabClosed);
				chrome.extension.onRequest.addListener(onRequest);
				initialized = true;
				for( var i = 0; i < initWaiters.length;++i){
					(initWaiters[i])();
				}
				initWaiters = [];
				if( updated ){
					//chrome.tabs.create({url: "settings/index.html"});
					showOptionPage();
				}
				log("init finished");
			});
		},
		tabStatus : tabStatus,
		
		getSettings : function(){
			return settings;
		},
		
		waitForInit : function(cb){
			if( initialized ) {
				cb();
			}else{
				initWaiters.push(cb);
			}
		},
		
		getSyms : function(){
			return patternTable.syms.chars;
		},
		updateSettings : function(symValues){
			updateCustomSymPattern(symValues);
		},
		getCustomSymPattern : function(){
			return customSymPattern;
		},
		showOptionPage : showOptionPage,
		
		enableUnitTest : false
	};
})();
background.init();
