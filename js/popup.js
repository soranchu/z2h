$(function(){
	$(".setting").click(function(){
		chrome.tabs.create({url: "fancy-settings/source/index.html"});
	});
	
	var bg = chrome.extension.getBackgroundPage();
	chrome.tabs.getSelected(null, function(tab){
		var siteStatus = bg.tabStatus[tab.id] ? bg.tabStatus[tab.id].siteStatus : "ENABLE";
		//var replaced =  bg.tabStatus[tab.id] ? bg.tabStatus[tab.id].replaced : 0;
		var domain = tab.url.match( /http:\/\/([^\/]+)/ )[1];
		
		switch(siteStatus){
		case "ENABLE":
			$("#status_ph").text(bg.tabStatus[tab.id].status);
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このページでの半角変換を無効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.addIgnorePage(tab.url);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このドメイン('+domain+')での半角変換を無効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.addIgnoreDomain(domain);
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
					bg.removeIgnorePage(tab.url);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			break;
		case "IGNORE_DOMAIN":
			$("#status_ph").text(bg.tabStatus[tab.id].status);
			$("<div>").addClass("item selectable")
				.append('<div class="arrow">')
				.append('<div class="text">このドメイン('+domain+')での半角変換を有効にする</div>')
				.appendTo(".items")
				.click(function(){
					bg.removeIgnoreDomain(tab.url);
					chrome.tabs.reload(tab.id);
					window.close();
				});
			break;

		}
	});
});
