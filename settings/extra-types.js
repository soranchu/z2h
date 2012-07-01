this.extraTypes = {
	"multiText" : new Class({
        // label, text
        // action -> change & keyup
        "Extends": Setting.Bundle,
        
        "createDOM": function () {
            this.bundle = new Element("div", {
                "class": "setting bundle multitext"
            });
            
            this.container = new Element("div", {
                "class": "setting container multitext"
            });
            
            this.element = new Element("textarea", {
                "class": "setting element multitext"
            });
            
            if (this.params.withButton !== undefined ) {
                this.buttonContainer = new Element("div", {
                    "class": "setting container textareaButton"
                });
	            this.button = new Element("input", {
	                "class": "setting element button",
	                "type": "button"
	            });
            }
            
            this.label = new Element("label", {
                "class": "setting label multitext"
            });
        },
        
        "setupDOM": function () {
            if (this.params.label !== undefined) {
                this.label.set("html", this.params.label);
                this.label.inject(this.container);
                this.params.searchString += this.params.label + "•";
            }
            
            if (this.params.text !== undefined) {
                this.element.set("placeholder", this.params.text);
                this.params.searchString += this.params.text + "•";
            }

            if (this.params.withButton !== undefined ) {
                this.button.set("value", this.params.withButton);
                this.button.set("disabled", "disabled");
            }
            this.element.inject(this.container);
            if (this.params.withButton !== undefined ) {
                this.button.inject(this.buttonContainer);
                this.buttonContainer.inject(this.container);
            }
            this.container.inject(this.bundle);
        },
        
        "addEvents": function () {
            var change = (function (event) {
                this.fireEvent("validate", [this.get(),(function(validated){
                	this.set(validated, true);
                    if (this.params.name !== undefined) {
                        this.settings.set(this.params.name, validated);
                    }
                }).bind(this)]);
                /*
                if (this.params.name !== undefined) {
                    this.settings.set(this.params.name, this.get());
                }
                this.fireEvent("action", this.get());
                */
                if (this.params.withButton !== undefined ) {
                	this.button.set("disabled","disabled");
                }
            }).bind(this);
            
            var enable = (function (event) {
            	this.button.erase("disabled");
            }).bind(this);
            
            if (this.params.withButton !== undefined ) {
            	this.button.addEvent("click", change);
	            this.element.addEvent("change", enable);
	            this.element.addEvent("keyup", enable);
            }else{
	            this.element.addEvent("change", change);
	            this.element.addEvent("keyup", change);
            }
        },
        
        "get": function () {
            return this.element.get("value").trim().split("\n");
        },
        
        "set": function (value, noChangeEvent) {
        	if( typeOf(value) === "array"  || (typeOf(value)==="object" && value.constructor.name === "Array") ){
        		this.element.set("value", value.join("\n"));
        	}else{
        		this.element.set("value", value);
        	}
            if (noChangeEvent !== true) {
                if (this.params.withButton !== undefined ) {
                	this.button.fireEvent("click");
                }else{
    	            this.element.fireEvent("change");
                }
            }
            
            return this;
        }

	}),

	"checkboxTable" : new Class({
        // label
        // action -> change
        "Extends": Setting.Bundle,
        
        "createDOM": function () {
            this.bundle = new Element("div", {
                "class": "setting bundle checkboxTable"
            });
            
            this.container = new Element("div", {
                "class": "setting container checkboxTable"
            });
            
            this.elements = [];
            this.labels = [];
            this.items = [];
            this.rows = this.params.rows || 1;
            this.cols = this.params.cols || 1;
            this.count = this.params.count || 1;
            var item,elm, label;
            for(var i = 0; i < this.count;++i){
                item = new Element("div", {
                    "class": "setting inline_container checkbox"
                });
                this.items.push(item);
	            elm = new Element("input", {
	                "id": String.uniqueID()+"_"+i,
	                "class": "setting element checkbox",
	                "type": "checkbox",
	                "value": "true"
	            });
	            this.elements.push(elm);
	            label = new Element("label", {
	                "class": "setting label checkbox",
	                "for": elm.get("id")
	            });
	            this.labels.push(label);
            }
        },
        
        "setupDOM": function () {
        	for(var i=0;i< this.count;++i){
                this.elements[i].inject(this.items[i]);
                this.labels[i].set("html", this.params.label[i]);
                this.labels[i].inject(this.items[i]);
                this.params.searchString += this.params.label[i] + "•";
                this.items[i].inject(this.container);
        	}
            this.container.inject(this.bundle);
            
        },
        "addEvents": function () {
        	for(var i =0;i<this.count;++i){
	            this.elements[i].addEvent("change", (function (event) {
	                if (this.params.name !== undefined) {
	                    this.settings.set(this.params.name, this.get());
	                }
	                
	                this.fireEvent("action", this.get());
	            }).bind(this));
        	}
        },
        
        
        "get": function () {
        	var ret = [];
        	for(var i = 0; i< this.count;++i){
        		ret.push(this.elements[i].get("checked"));
        	}
            return ret;
        },
        
        "set": function (value, noChangeEvent) {
        	if( typeOf(value) === "array" || (typeOf(value) === "object" && value.constructor.name === "Array") ){
	        	for(var i = 0; i < this.count;++i){
	        		this.elements[i].set("checked", value[i]);
	        	}
        	}else{
	        	for(var i = 0; i < this.count;++i){
	        		this.elements[i].set("checked", value);
	        	}
        	}
            if (noChangeEvent !== true) {
                this.elements[0].fireEvent("change");
            }
            
            return this;
        }
    })
};