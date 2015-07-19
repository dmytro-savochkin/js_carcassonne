function BrowserChecker() {}






BrowserChecker.isNewBrowser = function () {	var bc = BrowserChecker;
	if (bc.isCanvasSupported() && bc.isDefineProperySupported() && bc.isJSONSupported() && !bc.isIE()) {
		return true;	
	}               
	return false;
}




BrowserChecker.isCanvasSupported = function () {
	var elem = document.createElement('canvas');
	return !!(elem.getContext && elem.getContext('2d'));
}

BrowserChecker.isDefineProperySupported = function() {
	return (typeof Object.defineProperties == 'function');	
}

BrowserChecker.isJSONSupported = function() {
	return (typeof JSON == 'object');
}

BrowserChecker.isIE = function() {
	if (navigator.userAgent.indexOf('MSIE') != -1) {
		return true;	
	}               
	return false;
}	