var LIB = LIB || {};

LIB.namespace = function(ns_string) {
    var parts = ns_string.split("."),
        parent = LIB;

    if (parts[0] === "LIB") {
        parts = parts.slice(1);
    }

    for (var i = 0, len = parts.length; i < len; i++) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

LIB.namespace("util.Event");
LIB.namespace("util.Dom");
LIB.namespace("util.Helper");
LIB.namespace("util.localStorage");


;(function(global, app){
	var tempHelper = {};
	app.util.Helper = tempHelper;

	tempHelper.isString = function(arg){
		return typeof arg === "string"; 
	};

})(window, LIB);





;(function(global, app) {

	var $helper = app.util.Helper;


    var tempDom = {};
    app.util.Dom = tempDom;
    tempDom.qs = global.qs = function(selector, context){
    	if($helper.isString(context)){
    		context = tempDom.qs(context);
    	}
    	context = context == undefined ? document : context;
    	return context.querySelector(selector);
    };
    tempDom.qsa = global.qsa = function(selector, context) {
    	if($helper.isString(context)){
    		context = tempDom.qs(context);
    	}
        context = context == undefined ? document : context;
        return context.querySelectorAll(selector);
    };

    tempDom.closest = function(ele, tagName){
    	if($helper.isString(ele)) ele = qs(ele);

    	if(!ele.parentNode){
    		return;
    	}

    	var parent = ele.parentNode;
    	while(parent){
    		if(parent.nodeName.toLowerCase() !== tagName.toLowerCase()){
    			parent = parent.parentNode;
    		}else{
    			return parent;
    		}
    	}
    };
    tempDom.remove = function(ele){
    	if($helper.isString(ele)) ele = qs(ele);

    	if(ele){
    		ele.parentNode.removeChild(ele);
    	}
    };

})(window, LIB);




;(function(global, app) {
	var $dom = app.util.Dom,
		$helper = app.util.Helper;

    var tempEvent = {};
    var $event = app.util.Event = tempEvent;

    if (window.addEventListener) {
        tempEvent.addListener = function(el, type, fn, isUseCapture) {
        	if($helper.isString(el)){
        		el = $dom.qs(el);
        	}
            el.addEventListener(type, fn, !!isUseCapture);
        };
        tempEvent.removeListener = function(el, type, fn, isUseCapture) {
        	if($helper.isString(el)){
        		el = $dom.qs(el);
        	}
            el.removeEventListener(type, fn, !!isUseCapture);
        };
    } else if (document.attachEvent) {
        tempEvent.addListener = function(el, type, fn) {
        	if($helper.isString(el)){
        		el = $dom.qs(el);
        	}
            el.attachEvent("on" + type, fn);
        };
        tempEvent.removeListener = function(el, type, fn) {
        	if($helper.isString(el)){
        		el = $dom.qs(el);
        	}
            el.detachEvent("on" + type, fn);
        };
    } else {
        tempEvent.addListener = function(el, type, fn) {
        	if($helper.isString(el)){
        		el = $dom.qs(el);
        	}
            el["on" + type] = fn;
        };
        tempEvent.removeListener = function(el, type, fn) {
        	if($helper.isString(el)){
        		el = $dom.qs(el);
        	}
            el["on" + type] = null;
        };
    }

    tempEvent.getEvent = function(event) {
        return event ? event : window.event;
    };
    tempEvent.getTarget = function(event) {
        return event.target || event.srcElement;
    };
    tempEvent.preventDefault = function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    };

    tempEvent.stopPropagation = function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    };

    tempEvent.delegate = function(target, selector, type, fn, isUseCapture){
    	function dispatchEvent(event){
    		var tarEle = $event.getTarget(event),
    			potentialEles = $dom.qsa(selector, target),
    			hasMatch = Array.prototype.indexOf.call(potentialEles, tarEle) !== -1;

    		if(hasMatch){
    			fn.call(tarEle, event);
    		}
    	}

    	$event.addListener(target, type, dispatchEvent, !!isUseCapture);
    };

    
})(window, LIB);



;(function(global, app){
    var tempStore = {};
    var $localStorage = app.util.localStorage = tempStore;

    tempStore.set = function(key, value){
        localStorage.setItem(key, JSON.stringify(value));
    };

    tempStore.get = function(key){
        return JSON.parse(localStorage.getItem(key));
    };
    
})(window, LIB);