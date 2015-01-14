function log(str){
	//console.log(str);
}

var han_kana_chars = '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ';
var zen_kana_chars = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜';
var han_dakuon_chars = 'ｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞ';
var zen_dakuon_chars = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴ';

var han_zen_info = (function(){
	var map = {};
	var han_dakuon_list = han_dakuon_chars.match(/.{2}/g);
	for (var index=0, length=han_kana_chars.length; index<length; index++) map[han_kana_chars.charAt(index)] = zen_kana_chars.charAt(index);
	for (var index=0, length=han_dakuon_list.length; index<length; index++) map[han_dakuon_list[index]] = zen_dakuon_chars.charAt(index);
	var kana_matcher = new RegExp("(?:" + han_dakuon_list.join('|') + "|[" + han_kana_chars +"])", "g");
	return {map: map, kana_matcher: kana_matcher};
})();

var translate = function(matcher, target, keepHeadingMBSpace, replace_kana){
	var replaced = 0;
	var diff = 'Ａ'.charCodeAt(0) - 'A'.charCodeAt(0);
	var han_zen_map = han_zen_info.map;
	var kana_matcher = han_zen_info.kana_matcher;
	
	var han_to_zen = function(matched) {
		var zen_char = han_zen_map[matched];
		if (!zen_char) return matched;
		replaced++;
		return zen_char;
	};

	$(target).find("*:not(iframe,textarea,script)").andSelf().contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).each(function(){
		var str = this.textContent;
		var prependSpace = false;
		if( keepHeadingMBSpace ){
			//check textContent starts with MB Space(\u3000)
			if( /^[\u0000-\u0020\u00a0\u2028\u2029]*\u3000/.test(str) ){
				prependSpace = true;
			}
		}
		if (replace_kana) {
    		str = str.replace(kana_matcher, han_to_zen);
		}
		str = str.replace(matcher,function(matched){
			replaced++;
			if( matched.charCodeAt(0) == 0x03000){
				return ' ';
			}
			return String.fromCharCode(matched.charCodeAt(0)-diff);
		});
		if( prependSpace ){
			this.textContent = String.fromCharCode(0x03000) + str.replace(/^[\u0000-\u0020\u00a0\u2028\u2029]+/,'');
		}else{
			this.textContent = str;
		}
	});
	return replaced;
};
var highlight = function(matcher, target, keepHeadingMBSpace){
	var replaced = 0;
	$(target).find("*:not(iframe,textarea,script,span._z2h_highlight)").andSelf().contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).each(function(){
		var arr = {};
		var _this = this;

		//TODO support heading MB Space
		
		// highlighting-jquery-plugin
		// http://johannburkard.de/resources/Johann/jquery.highlight-3.js
		// MIT License
		while( ( arr = matcher.exec(_this.textContent)) != null ){
			var spannode = document.createElement('span');
		    spannode.className = '_z2h_highlight';
		    var middlebit = _this.splitText(arr.index);
		    var endbit = middlebit.splitText(arr[0].length);
		    var middleclone = middlebit.cloneNode(true);
		    spannode.appendChild(middleclone);
		    middlebit.parentNode.replaceChild(spannode, middlebit);
		    
		    replaced += arr[0].length;
		    _this = endbit;
		    matcher.lastIndex = 0;
		}
	});
	return replaced;
};
chrome.extension.sendRequest({"cmd":"loaded", "url":location.href, "iframe":(self!==top)}, function(res){
	if (res.siteStatus == "DISABLE" ){
		log("disabled");
		return;
	}
	
	var replaced = 0;
	var siteStatus = res.siteStatus;
	var pattern = res.pattern;
	var keepHeadingMBSpace = res.keepHeadingMBSpace;
	var replace_kana = res.replace_kana;

	var matcher = null;
	var transFunc = null;
	
	log("loaded response. siteStatus :" + siteStatus + " origin:"+location.origin);
	
	switch( siteStatus ){
	case "ENABLE":
		transFunc = translate;
		matcher = pattern ? new RegExp("[" + pattern + "]","g" ) : null;
		break;
	case "HIGHLIGHT":
		transFunc = highlight;
		if (replace_kana) pattern += han_kana_chars;
		matcher = pattern ? new RegExp("[" + pattern + "]+","g" ) : null;
		break;
	}
	
	if( matcher != null ){
		replaced = transFunc(matcher, document.body, keepHeadingMBSpace, replace_kana);
		
		if(res.supportAjax){
			var rerunTimer = -1;
			var updater = function(e) {
			    if( rerunTimer >= 0 ){
			    	clearTimeout(rerunTimer);
			    }
			    rerunTimer = setTimeout(function(){
					rerunTimer = -1;
			    	log("fireing timer");
			    	$("body").unbind("DOMSubtreeModified", updater);
					var replaced = transFunc(matcher, document.body, keepHeadingMBSpace, replace_kana);
			    	$("body").bind("DOMSubtreeModified", updater);

			    	log("request update in "+ (self!==top?"iframe":"top frame") + " by timer. replaced :"+replaced);
					chrome.extension.sendRequest({"cmd":"update","replaced":replaced,"iframe":(self!==top), append:true}, function(res){} );
			    },1000);
			};
			$("body").bind("DOMSubtreeModified", updater);
		}

		log("request update in "+ (self!==top?"iframe":"top frame") + ". replaced :"+replaced);
		chrome.extension.sendRequest({"cmd":"update","replaced":replaced,"iframe":(self!==top)}, function(res){} );
	}
});

