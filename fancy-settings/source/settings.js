window.addEvent("domready", function () {
	var bg = chrome.extension.getBackgroundPage().background;
	
	// Option 1: Use the manifest:
    new FancySettings.initWithManifest(function (settings) {
    	settings.manifest.ignorePages.addEvent("validate", function(){
    		var urls = settings.manifest.ignorePages.get();
    		var valdiated = [];
    		for( var i =0; i < urls.length; ++i ){
    			var m = bg.urlMatcher(urls[i]);
    			if( m && m.page && ! valdiated.contains(m.page) ){
   					valdiated.push(m.page);
    			}
    		}
    		settings.manifest.ignorePages.set(valdiated, true);
    	});
    	settings.manifest.ignoreDomains.addEvent("validate", function(){
    		var urls = settings.manifest.ignoreDomains.get();
    		var valdiated = [];
    		for( var i =0; i < urls.length; ++i ){
    			var m = bg.urlMatcher(urls[i]);
    			if( m && m.domain && ! valdiated.contains(m.domain) ){
    				valdiated.push(m.domain);
    			}
    		}
    		settings.manifest.ignoreDomains.set(valdiated, true);
    	});
        /*settings.manifest.myButton.addEvent("action", function () {
            alert("You clicked me!");
        });
        settings.create({
            "tab": i18n.get("details"),
            "group": i18n.get("ignore_settings"),
            "name": "ignorePages",
            "type": "text",
            "label": i18n.get("ignore_urls")
        });*/
    });
    
    
    // Option 2: Do everything manually:
    /*
    var settings = new FancySettings("My Extension", "icon.png");
    
    var username = settings.create({
        "tab": i18n.get("information"),
        "group": i18n.get("login"),
        "name": "username",
        "type": "text",
        "label": i18n.get("username"),
        "text": i18n.get("x-characters")
    });
    
    var password = settings.create({
        "tab": i18n.get("information"),
        "group": i18n.get("login"),
        "name": "password",
        "type": "text",
        "label": i18n.get("password"),
        "text": i18n.get("x-characters-pw"),
        "masked": true
    });
    
    var myDescription = settings.create({
        "tab": i18n.get("information"),
        "group": i18n.get("login"),
        "name": "myDescription",
        "type": "description",
        "text": i18n.get("description")
    });
    
    var myButton = settings.create({
        "tab": "Information",
        "group": "Logout",
        "name": "myButton",
        "type": "button",
        "label": "Disconnect:",
        "text": "Logout"
    });
    
    // ...
    
    myButton.addEvent("action", function () {
        alert("You clicked me!");
    });
    
    settings.align([
        username,
        password
    ]);
    */
});
