function Managezone() {
	this.mainData = new MainData();
	
	this.tileCanvas = document.getElementById(this.mainData.nextTileImgId);
	this.tileCanvas.context = this.tileCanvas.getContext('2d'); 
	
	this.canvasLayer = new CanvasDrawerNextTilePanel(this.mainData.nextTileImgId);
}
var managezoneProto = Managezone.prototype;




managezoneProto.drawNextTileInGameInfo = function(tileImage) {
	if( ! tileImage) {
		return false;	
	}
	this.canvasLayer.drawTileInGameInfo(0, tileImage);	
}


managezoneProto.rotateNextTileInGameInfo = function(nextField, rotate) { 
	if( ! nextField) {
		throw new Error("fieldDoesntExist");	
	}
	
	var rotateAngle = MainData.rotateArray[nextField.orientation][rotate];
	nextField.orientation = MainData.directionsArray[nextField.orientation][rotate];
	nextField.updateStructureAndZones(rotate);
	
	this.canvasLayer.drawTileInGameInfo(rotateAngle);
}


managezoneProto.removeNextTileInGameInfo = function() {
	this.canvasLayer.drawTileInGameInfo(0, this.mainData.crossTile);
}

managezoneProto.clearNextTileWindow = function() {
	this.canvasLayer.drawTileInGameInfo(0, this.mainData.emptyTile);
}