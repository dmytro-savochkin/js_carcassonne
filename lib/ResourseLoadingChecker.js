function ResourseLoadingChecker(tilesParserImageManager, gamezoneImageManager) {
	this.mainData = new MainData();
	
	this.tilesParserImageManager = tilesParserImageManager;
	this.gamezoneImageManager = gamezoneImageManager;

	this.intervalIds = [];
	this.checkerWasStartedTimes = 0; 
	this.resoursesWereReloadedTimes = 0; 
}
var loaderProto = ResourseLoadingChecker.prototype;




loaderProto.checkResourses = function () {
    if(this.intervalIds[0] == undefined) {
    	this.intervalIds.push(window.setInterval(this.startChecking, this.mainData.recheckTimeBasic));
    } else {
    	this.startChecking();	
    } 		
}




loaderProto.startChecking = function () {
    controller.loader.checkerWasStartedTimes++;
    controller.loader.delegateCheckingToObjects();
	
	if(controller.loader.allResoursesAreLoaded()) {
		window.clearInterval(controller.loader.intervalIds.shift());
        controller.continueGameLoading();
		return true;	
	} 
	 
	if(controller.loader.checkerWasExecutedTooManyTimes()) {
        controller.loader.checkerWasStartedTimes = 0;
        controller.loader.reloadResourses();
		if(controller.loader.resoursesWereReloadedTooManyTimes()) {
			window.clearInterval(controller.loader.intervalIds.shift());
            controller.loadingIsFailed();
		}	
	}
}



loaderProto.delegateCheckingToObjects = function () {
    controller.gamezone.imageManager.checkAreAllImagesLoaded();
    controller.tilesParser.imageManager.checkAreAllImagesLoaded();
}	





loaderProto.checkerWasExecutedTooManyTimes = function () {
	if(controller.loader.checkerWasStartedTimes >= controller.loader.mainData.timesToStartChecker) return true;
	return false;
}
loaderProto.resoursesWereReloadedTooManyTimes = function () {
	if(controller.loader.resoursesWereReloadedTimes >= controller.loader.mainData.timesToStartReloader) return true;
	return false;
}





loaderProto.allResoursesAreLoaded = function () {	  	
	return controller.loader.tilesParserImageManager.allImagesAreLoaded &&
        controller.loader.gamezoneImageManager.allImagesAreLoaded &&
		soundManager.loaded;  
}	




loaderProto.reloadResourses = function () {
	this.resoursesWereReloadedTimes++;	    
	if(this.tilesParserImageManager.allImagesAreLoaded == false)    
		this.tilesParserImageManager.reloadImagesTilesParser();  
	if(this.gamezoneImageManager.allImagesAreLoaded == false)    
		this.gamezoneImageManager.reloadImagesGamezone(); 	    
} 