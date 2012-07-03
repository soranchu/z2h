function log(str){
	//console.log(str);
}

var translate = function(matcher, target, keepHeadingMBSpace){
	var replaced = 0;
	var diff = 'Ａ'.charCodeAt(0) - 'A'.charCodeAt(0);
	$(target).find("*:not(iframe,textarea,script)").andSelf().contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).each(function(){
		var str = this.textContent;
		var prependSpace = false;
		if( keepHeadingMBSpace ){
			//check textContent starts with MB Space(\u3000)
			if( /^[\u0000-\u0020\u00a0\u2028\u2029]*\u3000/.test(str) ){
				prependSpace = true;
			}
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
		matcher = pattern ? new RegExp("[" + pattern + "]+","g" ) : null;
		break;
	}
	
	if( matcher != null ){
		replaced = transFunc(matcher, document.body, keepHeadingMBSpace);
		
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
					var replaced = transFunc(matcher, document.body, keepHeadingMBSpace);
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

