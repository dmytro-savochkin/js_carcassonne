function TilesDataParser() {
	this.mainData = new MainData();

	this.rawTilesStructureData = $(this.mainData.iframeWithTileStructuresId).contents().find('div').html();
	this.tilesDir = this.mainData.tilesDir;
	this.tilesStructure = new Array();	
	this.countOfTilesTypes;
	this.cellsCount = this.mainData.cellsCount;
	
	this.imageManager = new ImageManager(this);
	
	this.tilesStructureData;
	this.currentTileNum;
	this.splittedData;    
	

}
var parserProto = TilesDataParser.prototype;




parserProto.createTilesStructure = function() {   
	var pattern = new RegExp("\n+\s*\n+");
	this.tilesStructureData = this.rawTilesStructureData.split(pattern);
		
	this.countOfTilesTypes = this.tilesStructureData.length;
	this.createTilesStructureObjects();
	this.parseForTilesParamsAndStructure();
	return this.tilesStructure;
}
  

parserProto.createTilesStructureObjects = function() {
	for(var i = 0; i < this.countOfTilesTypes; i++) {
		this.tilesStructure[i] = new TilesStructure(this.cellsCount);
	}	
}

   
parserProto.parseForTilesParamsAndStructure = function() {
	for(this.currentTileNum = 0; this.currentTileNum < this.countOfTilesTypes; this.currentTileNum++) {
		var regExps = this.makeRegExpsForParsing();
		
		this.splitDataByRegExps(regExps);
		
		this.parseForStringParams();
		this.parseForImageAndLoad();
	    this.parseForMeeplesPositions();
        this.parseForStructure();
	}        
}










parserProto.makeRegExpsForParsing = function() {
	var regExps = {name:"", quantity:"", meeples:"", left:"", right:"", top:"", bottom:""};
	for(var i in regExps) {
		regExps[i] = new RegExp(i + ":([^\n]*)", "i");	
	}
	return regExps;	
}

parserProto.splitDataByRegExps = function(regExps) {
	regExps.structure = new RegExp("bottom:[^\n]*\n([a-z\n]*)", "i");
	this.splittedData = {};
	for(var i in regExps) {
		this.splittedData[i] = regExps[i].exec(this.tilesStructureData[this.currentTileNum]);	
	}
}

parserProto.parseForStringParams = function() {
	this.tilesStructure[this.currentTileNum]["name"] = this.splittedData.name[1];
	this.tilesStructure[this.currentTileNum]["quantity"] = this.splittedData.quantity[1];
	this.tilesStructure[this.currentTileNum]["left"] = this.splittedData.left[1];	   
	this.tilesStructure[this.currentTileNum]["right"] = this.splittedData.right[1];	   
	this.tilesStructure[this.currentTileNum]["top"] = this.splittedData.top[1];	   
	this.tilesStructure[this.currentTileNum]["bottom"] = this.splittedData.bottom[1];	
}

parserProto.parseForImageAndLoad = function() {
	var imageSrc = this.tilesDir + this.tilesStructure[this.currentTileNum]["name"];
	this.tilesStructure[this.currentTileNum]["image"] = this.imageManager.loadImage( imageSrc, true );
} 

parserProto.parseForMeeplesPositions = function() {
	var rawTileStructure = this.splittedData.structure[1];  
	var structureCellsRegExp = /\n+/i;
	var tileStructureString = rawTileStructure.split(structureCellsRegExp);		
	var tileStructureArray = new Array(tileStructureString.length);
	for(var j = 0; j < tileStructureArray.length; j++) {
		tileStructureArray[j] = tileStructureString[j].split("");		
	}
	this.tilesStructure[this.currentTileNum]["structure"] = tileStructureArray;	
}

parserProto.parseForMeeplesPositions = function() {
	this.tilesStructure[this.currentTileNum]["meeples"] = this.splittedData.meeples[1].split(" ");
	for(var j in this.tilesStructure[this.currentTileNum]["meeples"]) {
		this.tilesStructure[this.currentTileNum]["meeples"][j] = this.tilesStructure[this.currentTileNum]["meeples"][j].split(",");
		this.tilesStructure[this.currentTileNum]["meeples"][j][0] = parseInt(this.tilesStructure[this.currentTileNum]["meeples"][j][0]);
		this.tilesStructure[this.currentTileNum]["meeples"][j][1] = parseInt(this.tilesStructure[this.currentTileNum]["meeples"][j][1]);	
	}	
}

parserProto.parseForStructure = function() {
	var rawTileStructure = this.splittedData.structure[1];  
	var structureCellsRegExp = /\n+/i;
	var tileStructureString = rawTileStructure.split(structureCellsRegExp);		
	var tileStructureArray = new Array(tileStructureString.length);
	for(var i = 0; i < tileStructureArray.length; i++) {
		tileStructureArray[i] = tileStructureString[i].split("");		
	} 
	
	var midArray = new Array(tileStructureArray.length);
	for(var x = 0; x < tileStructureArray.length; x++) {
		midArray[x] = new Array(tileStructureArray.length);  
		for(var y = 0; y < tileStructureArray.length; y++) {
			midArray[x][y] = tileStructureArray[y][x];
		}	
	}
	
	this.tilesStructure[this.currentTileNum]["structure"] = midArray;   
}





