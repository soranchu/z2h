function log(str){
	//console.log(str);
}
/*
function makeRegExp(settings, option){
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
	
	//if( settings.replace_tilde ){
	//	pat += settings.patternTable.tilde.pat;
	//}
	if( settings.replace_space ){
		pat += settings.patternTable.space.pat;
	}

	if( pat.length == 0 )return null;
	var opt = option || "";
	return new RegExp("[" + pat + "]"+opt,"g" );
}*/

chrome.extension.sendRequest({"cmd":"loaded", "url":location.href, "iframe":(self!==top)}, function(res){
	var replaced = 0;
	var siteStatus = res.siteStatus;
	var pattern = res.pattern;

	var matcher = pattern ? new RegExp("[" + pattern + "]","g" ) : null;
	var diff = 'Ａ'.charCodeAt(0) - 'A'.charCodeAt(0);
	
	log("loaded response. siteStatus :" + siteStatus);
	if( siteStatus == "ENABLE" && matcher != null ){
		
		$("body *:not(iframe,textarea,script)").andSelf().contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).each(function(){
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

	}else if ( siteStatus == "HIGHLIGHT" && matcher != null ){
	
		var regex = pattern ? new RegExp("[" + pattern + "]+","g" ) : null;
		$("body *:not(iframe,textarea,script)").andSelf().contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).each(function(){
			var arr = {};
			var _this = this;
			
			// highlighting-jquery-plugin
			// http://johannburkard.de/resources/Johann/jquery.highlight-3.js
			// MIT License
			while( ( arr = regex.exec(_this.textContent)) != null ){
				var spannode = document.createElement('span');
			    spannode.className = '_z2h_highlight';
			    var middlebit = _this.splitText(arr.index);
			    var endbit = middlebit.splitText(arr[0].length);
			    var middleclone = middlebit.cloneNode(true);
			    spannode.appendChild(middleclone);
			    middlebit.parentNode.replaceChild(spannode, middlebit);
			    
			    replaced += arr[0].length;
			    _this = endbit;
			    regex.lastIndex = 0;
			}
		});
		chrome.extension.sendRequest({"cmd":"update","replaced":replaced,"iframe":(self!==top)}, function(res){} );
	}
});

