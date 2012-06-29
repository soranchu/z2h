$(function(){
	$(".setting").click(function(){
		chrome.tabs.create({url: "settings/index.html"});
	});
	
	
	var bg = chrome.extension.getBackgroundPage().background;
	
	if( bg.enableUnitTest ){
		$('<span class="tests optionbutton">Tests</span>').prependTo(".footer").click(function(){
			chrome.tabs.create({url: "tests/index.html"});
		});
	}
	chrome.tabs.getSelected(null, function(tab){
		var siteStatus = bg.tabStatus[tab.id] ? bg.tabStatus[tab.id].siteStatus : "ENABLE";
		//var replaced =  bg.tabStatus[tab.id] ? bg.tabStatus[tab.id].replaced : 0;
		var match = bg.urlMatcher( tab.url );
		if( !match ){
			return;
		}
		function addItem(text, func){
			$("<div>").addClass("item selectable")
			.append('<div class="arrow">')
			.append('<div class="text">'+text+'</div>')
			.appendTo(".items")
			.click(function(){
				func();
				chrome.tabs.reload(tab.id);
				window.close();
			});
		}
		$("#status_ph").text(bg.tabStatus[tab.id].status);
		switch(siteStatus){
		case "ENABLE":
			addItem("このページでの半角変換を無効にする", function(){
				bg.addIgnorePage(match.page);
			});
			addItem('このドメイン('+match.domain+')での半角変換を無効にする', function(){
				bg.addIgnoreDomain(match.domain);
			});
			addItem("このページの全角英数を強調表示する", function(){
				bg.setHighlight(match.page, true);
			});
			break;
		case "HIGHLIGHT":
			addItem("全角英数の強調表示を終了する", function(){
				bg.setHighlight(match.page, false);
			});
			break;
		case "IGNORE_PAGE":
			addItem("このページでの半角変換を有効にする", function(){
				bg.removeIgnorePage(match.page);
			});
			break;
		case "IGNORE_DOMAIN":
			addItem('このドメイン('+match.domain+')での半角変換を有効にする', function(){
				bg.removeIgnoreDomain(match.domain);
			});
			break;
		}
	});
});
