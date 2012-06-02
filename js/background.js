"use strict";
var Background = function(){
	var log = function(str){
		//console.log(str);
	};
	
	var tabStatus = {};
	
	var settings = new Store("settings", {
	    "ignorePages": [],
	    "ignoreDomains": [],
	    "highlightPages": [],
	    "patternTable":null,
	    "replace_alpha": true,
	    "replace_num": true,
	    "replace_space": true,
	    "replace_sym": true,
	    "replace_sym_options" : null
//	    "replace_tilde": false
	});
	
	var customSymPattern = "";
	
	var importOldSettings = function(){
		
		// import old localStorage settings
		var pages = localStorage["ignorePages"];
		var domains = localStorage["ignoreDomains"];

		var ignorePages = settings.get("ignorePages");
		var ignoreDomains = settings.get("ignoreDomains");
	
		var updated = false;
		if( pages ){
			pages = pages.split(/,(?=https?\:\/\/)/);
			for(var i = 0; i < pages.length; ++i ){
				if( ! arrayContains(ignorePages, pages[i]) ){
					ignorePages.push(pages[i]);
					updated = true;
				}
			}
		}
		if( domains ){
			domains = domains.split(/,(?=https?\:\/\/)/);
			for(var i = 0; i < domains.length; ++i ){
				if( ! arrayContains(ignoreDomains, domains[i]) ){
					ignoreDomains.push(domains[i]);
					updated = true;
				}
			}
		}
		localStorage.removeItem("ignorePages");
		localStorage.removeItem("ignoreDomains");
		
		//update ignore page/domain urls
		var pat = settings.get("patternTable");
		if( updated || ! pat || pat._version <= 2.1 ){
			log("updating ignore settings");
			
			var newPages = [];
			var newDomains = [];
		
			for( var i = 0 ; i < ignorePages.length; ++ i){
				var match = urlMatcher(ignorePages[i]);
				if( match && match.page ){
					var contains = arrayContains(newPages, match.page);
					log("updating ignore page : " + ignorePages[i] + " -> " + match.page + contains?"(duplicated)":"");
					if( !contains ){
						newPages.push(match.page);
					}
				}
			}
		
			for( var i = 0 ; i < ignoreDomains.length; ++ i){
				var match = urlMatcher(ignoreDomains[i]);
				if( match && match.domain ){
					var contains = arrayContains(newDomains, match.domain);
					log("updating ignore domain : " + ignoreDomains[i] + " -> " + match.domain + contains?"(duplicated)":"");
					if( !contains ){
						newDomains.push(match.domain);
					}
				}
			}
			
			settings.set("ignorePages",newPages);
			settings.set("ignoreDomains",newDomains);
		}
		var showUpdatedPage = false;
		var replaceSym = localStorage.getItem("store.settings.replace_sym") == "true";
		var replaceTilde = localStorage.getItem("store.settings.replace_tilde") == "true";
		var symOpts = settings.get("replaceSymOptions");
		if( symOpts == null ){
			showUpdatedPage = true;
			symOpts = [];
			for( var i = 0;i < 32; ++i){
				if( i == 31){
					symOpts[i] = replaceTilde;
				}else{
					symOpts[i] = replaceSym;
				}
			}
			settings.set("replaceSymOptions", symOpts);
		}
		localStorage.removeItem("store.settings.replace_tilde");
		
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
		var pat = settings.get("patternTable");
		if( ! pat || pat._version <= 2.3 ){
			
			pat = {};
			pat.alpha =  makePattern([{from:'Ａ',to:'Ｚ'},{from:'ａ',to:'ｚ'}]);
			pat.num = makePattern([{from:'０',to:'９'}]);
			pat.syms = makePattern([{from:'！',to:'／'},{from:'：',to:'＠'},{from:'［',to:'｀'},{from:'｛',to:'～'}]);
			//pat.syms_custom = pat.syms;
			//pat.tilde = makePattern([{from:'～',to:'～'}]);
			pat.space = makePattern([{from:'　',to:'　'}]);
		
			pat._version = 2.3;
			
			settings.set("patternTable", pat);
		}
	};
	
	var updateCustomSymPattern = function(symValues){
		var symChars = settings.get("patternTable").syms.chars;
		if( !symValues ){
			customSymPattern = settings.get("patternTable").syms;
			return;
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
		var table = settings.get("patternTable");
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
		
		if( tabStatus[tabid] ){
			if( tabStatus[tabid].siteStatus === "HIGHLIGHT" ){
				tabStatus[tabid].status = "全角英数を強調表示中(" + tabStatus[tabid].replaced+"文字ありました)";
				enabled = true;
				visible = true;
			}else if( tabStatus[tabid].siteStatus !== "ENABLE" ){
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
		}else{
			chrome.pageAction.hide(tabid);
		}
		
	};
	
	var getSiteStatus = function(url){
		var match = urlMatcher(url);
		if( match ){
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
		if( changeInfo.url && changeInfo.url.indexOf("https") == 0 ){
			delete tabStatus[tabId];
		}
		setIconStatus(tabId);
	};
	var onRequest = function(request, sender, sendResponse) {
		var res = {};
		
		var iframe = request.iframe;
		
		if( request.cmd === "loaded" ){
			log("[bg] onRequest cmd:" + request.cmd + " sender:" + sender.tab.id + " url:" + request.url + " iframe:"+request.iframe );
			
			res.siteStatus = getSiteStatus(request.url);
			res.pattern = getPattern();
			
			if (!iframe){
				tabStatus[sender.tab.id] = {
						"siteStatus":res.siteStatus,
						"replaced":0,
						"status":""
				};
				setIconStatus(sender.tab.id);
			}
		}else if( request.cmd === "update" ){
			log("[bg] onRequest cmd:" + request.cmd + " sender:" + sender.tab.id + " relpaced:" + request.replaced + " iframe:"+request.iframe );
			
			if( ! tabStatus[sender.tab.id] ){
				log("unknown tab :" + sender.tab.id);
			}else{
				if( !iframe ){
					tabStatus[sender.tab.id].replaced = request.replaced;
				}else{
					tabStatus[sender.tab.id].replaced += request.replaced;
				}
			}
			setIconStatus(sender.tab.id);
		}
		sendResponse(res);
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
			var updated = importOldSettings();
			createTranslateTable();
			updateCustomSymPattern();
			
			chrome.tabs.onUpdated.addListener(onTabUpdated);
			chrome.extension.onRequest.addListener(onRequest);
			if( updated ){
				chrome.tabs.create({url: "fancy-settings/source/index.html"});
			}
		},
		tabStatus : tabStatus,
		
		getSyms : function(){
			return settings.get("patternTable").syms.chars;
		},
		updateSettings : function(symValues){
			updateCustomSymPattern(symValues);
		},
		getCustomSymPattern : function(){
			return customSymPattern;
		},
		enableUnitTest : false
	};
};
