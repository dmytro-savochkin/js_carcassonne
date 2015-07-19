function Sizer() {}
var sizerProto = Sizer.prototype;








Sizer.setIdsForElements = function () {
	this.mainData = new MainData();
	this.gameWindow = $('#'+this.mainData.gameWindowId);
    this.logger = $('#'+this.mainData.loggerId);
	this.gameCanvas = $('#'+this.mainData.canvasId);
	this.gameField = $('#'+this.mainData.gameFieldId);
	this.gameInfo = $('#'+this.mainData.gameInfoId);
}




Sizer.setSizeOfPanels = function () {
    Sizer.setWindowSizes();
    Sizer.setInfoSizes();       
    Sizer.setLoggerSizes();     
    Sizer.setCanvasSizes();     
    Sizer.setCanvasBackground();
    Sizer.setCanvasPaddings();
    Sizer.setFieldSizes(); 
}











Sizer.setWindowSizes = function () {
    this.gameWindow.height(window.innerHeight - this.logger.height() - 10);
    this.gameWindow.width(document.body.clientWidth - this.gameInfo.width() - 10);
}



Sizer.setInfoSizes = function () {
    this.gameInfo.height(this.gameWindow.height());	
}



Sizer.setLoggerSizes = function () {    
    this.logger.css('top', this.gameWindow.height() + 5); 
    this.logger.width( this.gameWindow.width() );	     
}



Sizer.setCanvasSizes = function () {	
	this.gameCanvas.css('left', (this.gameCanvas.width() - this.gameWindow.width()) / 2);
	this.gameCanvas.css('top', (this.gameCanvas.height() - this.gameWindow.height()) / 2);		
}

Sizer.moveCanvasToCenter = function () {
	this.gameCanvas.css("left", this.gameCanvas.data("Left"));
	this.gameCanvas.css("top", this.gameCanvas.data("Top"));				
}

Sizer.setCanvasBackground = function () {
	this.gameCanvas.css('backgroundImage', 'url('+this.mainData.wallpaperSrc+')');
}

Sizer.setCanvasPaddings = function (tileSize, scale) {
	if(tileSize == undefined)tileSize = 0;
	if(scale == undefined)scale = 0;
	this.gameCanvas
		.data("Left", (this.gameCanvas.width() - this.gameWindow.width()) / 2 + scale * tileSize / 2)
		.data("Top", (this.gameCanvas.height() - this.gameWindow.height()) / 2 + scale * tileSize / 2 );	
}


  
Sizer.setFieldSizes = function () {
	this.gameField.css('left', this.gameWindow.width() - this.gameCanvas.width());
	this.gameField.css('top', this.gameWindow.height() - this.gameCanvas.height()); 
	this.gameField.width(2 * this.gameCanvas.width() - this.gameWindow.width());
	this.gameField.height(2 * this.gameCanvas.height() - this.gameWindow.height()); 	
}



Sizer.memorizeCanvasPaddingsAfterRescaling = function (scale) {
	var WidthWindow = this.gameWindow.width(); 
    var LeftOld = parseInt(this.gameCanvas.css('left'));
    var Left = scale * LeftOld + (WidthWindow/2) * (scale - 1); 
    if(Left < 0) Left = 0;
	    
    var HeightWindow = this.gameWindow.height();
    var TopOld = parseInt(this.gameCanvas.css('top'));
    var Top = scale * TopOld + (HeightWindow/2) * (scale - 1);
    if(Top < 0) Top = 0;
	      
	this.gameCanvas.css('left', Left);
	this.gameCanvas.css('top', Top); 	
}