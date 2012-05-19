function log(str){
	//console.log(str);
}

function makeRegExp(settings){
	var pat = "";
	if( settings.replace_alpha ){
		pat += settings.patternTable.alpha.pat;
	}
	if( settings.replace_num ){
		pat += settings.patternTable.num.pat;
	}
	if( settings.replace_sym ){
		pat += settings.patternTable.syms.pat;
	}
	if( settings.replace_tilde ){
		pat += settings.patternTable.tilde.pat;
	}
	if( settings.replace_space ){
		pat += settings.patternTable.space.pat;
	}

	if( pat.length == 0 )return null;
	
	return new RegExp("[" + pat + "]","g" );
}
chrome.extension.sendRequest({"cmd":"loaded", "url":location.href, "iframe":(self!==top)}, function(res){
	var replaced = 0;
	var siteStatus = res.siteStatus;
	var settings = res.settings;

	var matcher = makeRegExp(settings);
	
	log("loaded response. siteStatus :" + siteStatus);
	if( siteStatus == "ENABLE" && matcher != null ){
		//TODO:except form input 
		var diff = 'Ａ'.charCodeAt(0) - 'A'.charCodeAt(0);
		
		$("body *:not(iframe)").andSelf().contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).each(function(){
			this.textContent = this.textContent.replace(matcher,function(matched){
				replaced++;
				if( matched.charCodeAt(0) == 0x03000 ){
					return ' ';
				}
				return String.fromCharCode(matched.charCodeAt(0)-diff);
			});
		});
		log("request update. replaced :"+replaced);
		chrome.extension.sendRequest({"cmd":"update","replaced":replaced,"iframe":(self!==top)}, function(res){} );
	}
});

