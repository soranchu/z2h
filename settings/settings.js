window.addEvent("domready", function () {
	var bg = chrome.extension.getBackgroundPage().background;
	
    new FancySettings.initWithManifest( bg.getSettings(),  function (settings) {
    	settings.manifest.ignorePages.addEvent("validate", function(value, callback){
    		var urls = value;
    		var validated = [];
    		for( var i =0; i < urls.length; ++i ){
    			var m = bg.urlMatcher(urls[i]);
    			if( m && m.page && ! validated.contains(m.page) ){
    				validated.push(m.page);
    			}
    		}
    		callback(validated);
    	});
    	settings.manifest.ignoreDomains.addEvent("validate", function(value, callback){
    		var urls = value;
    		var validated = [];
    		for( var i =0; i < urls.length; ++i ){
    			var m = bg.urlMatcher(urls[i]);
    			if( m && m.domain && ! validated.contains(m.domain) ){
    				validated.push(m.domain);
    			}
    		}
    		callback(validated);
    	});
    	var syms = bg.getSyms();
    	var replaceSymOptions = settings.create({
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replaceSymOptions",
            "type": "checkboxTable",
            "count":syms.length,
            "label": syms
    	});
    	settings.manifest.replaceSymOptions = replaceSymOptions;
    	if(!settings.manifest.replace_sym.get()){
			settings.manifest.replaceSymOptions.container.addClass("disabled");
    		settings.manifest.replaceSymOptions.elements.each(function(elm){
    			elm.set("disabled","disabled");
    		});
    	}
    	settings.manifest.replace_sym.addEvent("action", function(checked){
    		if( checked ){
    			settings.manifest.replaceSymOptions.container.removeClass("disabled");
   	    		settings.manifest.replaceSymOptions.elements.each(function(elm){
   	    			elm.erase("disabled");
   	    		});
    		}else{
    			settings.manifest.replaceSymOptions.container.addClass("disabled");
   	    		settings.manifest.replaceSymOptions.elements.each(function(elm){
   	    			elm.set("disabled","disabled");
   	    		});
    		}
    	});
    	settings.manifest.replaceSymOptions.addEvent("action", function(values){
    		bg.updateSettings(this.get());
    	});
    	
    	if( !settings.manifest.replace_space.get() ){
    		settings.manifest.keepHeadingMBSpace.container.addClass("disabled");
    		settings.manifest.keepHeadingMBSpace.element.set("disabled","disabled");
    	}
    	settings.manifest.replace_space.addEvent("action", function(checked){
    		if( checked ){
        		settings.manifest.keepHeadingMBSpace.container.removeClass("disabled");
        		settings.manifest.keepHeadingMBSpace.element.erase("disabled");
    		}else{
        		settings.manifest.keepHeadingMBSpace.container.addClass("disabled");
        		settings.manifest.keepHeadingMBSpace.element.set("disabled","disabled");
    		}
    	});
    	
    	settings.manifest.keepHeadingMBSpace.container.setStyles({
    		marginLeft:"32px"
    	});
    	settings.manifest.supportHttps.label.innerHTML += '<span class="beta">[Beta]</span>';
    	settings.manifest.supportAjax.label.innerHTML += '<span class="beta">[Beta]</span>';
    	settings.manifest.keepHeadingMBSpace.label.innerHTML += '<span class="beta">[Beta]</span>';
    	
    }, this.extraTypes );
    
});
