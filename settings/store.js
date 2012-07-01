//
// Copyright (c) 2011 Frank Kohlhepp
// https://github.com/frankkohlhepp/store-js
// License: MIT-license
//
(function () {
    var Store = this.Store = function (name, defaults, onReady) {
        this.name = name;
        this.cache = {};
        this.changedListeners = {};
        
    	chrome.storage.sync.get(null,(function(items){
            var key;
    		this.cache = items;
    		if (defaults !== undefined) {
                for (key in defaults) {
                    if (defaults.hasOwnProperty(key) && this.get(key) === undefined) {
                        this.set(key, defaults[key]);
                    }
                }
	        }
        	if( typeof onReady === "function" ){
        		setTimeout(onReady,0);
        	}
    	}.bind(this)));
    	chrome.storage.onChanged.addListener((function(changes, namespace){
    		if( namespace === "sync" ){
    			for( var key in changes ){
    				var oldv = changes[key].oldValue;
    				var newv = changes[key].newValue;
    				console.log( "storage.onChanged : key:" + key + " value:" + JSON.stringify(oldv) + " -> " + JSON.stringify(newv));
    				if( newv ){
    					this.cache[key] = newv;
    				}
    				if( this.changedListeners[key] && typeof  this.changedListeners[key] === "function"){
    					if( newv === undefined ){
    						newv = defaults[key];
    					}
    					this.changedListeners[key](newv);
    				}
    			}
    		}
    	}.bind(this)));
    };

    Store.prototype.addListener = function (name, fn) {
    	console.log("settings listener added for " + name);
    	this.changedListeners[name] = fn;
    };

    Store.prototype.get = function (name) {
    	return this.cache[name];
    	/*
        name = "store." + this.name + "." + name;
        if (localStorage.getItem(name) === null) { return undefined; }
        try {
            return JSON.parse(localStorage.getItem(name));
        } catch (e) {
            return null;
        }*/
    };
    
    Store.prototype.set = function (name, value) {
        if (value === undefined) {
            this.remove(name);
        } else {
            if (typeof value === "function") {
                value = null;
            } /* else {
                try {
                    value = JSON.stringify(value);
                } catch (e) {
                    value = null;
                }
            }
            localStorage.setItem("store." + this.name + "." + name, value);
            */
            this.cache[name] = value;
            var change = {};
            change[name] = value;
            chrome.storage.sync.set(change,function(){
            	console.log("storage.sync.set({"+name+":"+value+"}) done");
            });
        }
        
        return this;
    };
    
    Store.prototype.remove = function (name) {
        //localStorage.removeItem("store." + this.name + "." + name);
        delete this.cache[name];
        chrome.storage.sync.remove(name,function(){
        	console.log("storage.sync.remove("+name+") done");
        });
        return this;
    };
    
    Store.prototype.removeAll = function () {
        /*
    	var name,
            i;
        
        name = "store." + this.name + ".";
        for (i = (localStorage.length - 1); i >= 0; i--) {
            if (localStorage.key(i).substring(0, name.length) === name) {
                localStorage.removeItem(localStorage.key(i));
            }
        }
        */
    	this.cache = {};
        chrome.storage.sync.clear(function(){
        	console.log("storage.sync.clear() done");
        });
    	
        return this;
    };
    
    Store.prototype.toObject = function () {
        /*
    	var values,
            name,
            i,
            key,
            value;
        
        values = {};
        name = "store." + this.name + ".";
        for (i = (localStorage.length - 1); i >= 0; i--) {
            if (localStorage.key(i).substring(0, name.length) === name) {
                key = localStorage.key(i).substring(name.length);
                value = this.get(key);
                if (value !== undefined) { values[key] = value; }
            }
        }
        
        return values;
        */
    	return this.cache;
    };
    
    Store.prototype.fromObject = function (values, merge) {
        if (merge !== true) { this.removeAll(); }
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                this.set(key, values[key]);
            }
        }
        
        return this;
    };
}());
