$(function(){
	$(".setting").click(function(){
		chrome.tabs.create({url: "fancy-settings/source/index.html"});
	});
	
	var bg = chrome.extension.getBackgroundPage();
	chrome.tabs.getSelected(null, function(tab){
		var siteStatus = bg.tabStatus[tab.id] ? bg.tabStatus[tab.id].siteStatus : "ENABLE";
		//var replaced =  bg.tabStatus[tab.id] ? bg.tabStatus[tab.id].replaced : 0;
		var match = bg.urlMatcher( tab.url );
		if( !match || match.length <= 3 ){
			return;
		}
		switch(siteStatus){
		case "ENABLE":
			$("#status_ph").text(bg.tabStatus[tab.id].status);
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このページ('+match[2]+')での半角変換を無効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.addIgnorePage(match[2]);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このドメイン('+match[3]+')での半角変換を無効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.addIgnoreDomain(match[3]);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			break;
		case "IGNORE_PAGE":
			$("#status_ph").text(bg.tabStatus[tab.id].status);
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このページでの半角変換を有効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.removeIgnorePage(match[2]);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			break;
		case "IGNORE_DOMAIN":
			$("#status_ph").text(bg.tabStatus[tab.id].status);
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このドメイン('+match[3]+')での半角変換を有効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.removeIgnoreDomain(match[3]);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			break;

		}
	});
});
