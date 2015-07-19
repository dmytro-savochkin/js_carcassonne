function MainData() {
	if ( ! MainData._instance)MainData._instance = this;
	else return MainData._instance;
	            
	
	
	this.timesToStartChecker = 5;
	this.timesToStartReloader = 3;
	
	this.recheckTimeBasic = 800;	
	this.recheckTimeForPlayersFromDB = 1000;
	this.recheckTimeForResendingMoves = 5000;
	
	this.statuses = {
		WAITING_FOR_TURN: 1,
		WAITING_FOR_MEEPLE: 2,
		WAITING_FOR_PLAYERS: 3,
		GAME_END: 4,
        WAITING_FOR_GAME_END: 5
	}
	
	this.opacity = {
		low: 0.3,
		full: 1	
	}
	   
	this.serverScriptUp = "scripts/up.php";
	this.serverScriptDown = "scripts/down.php";
	
	this.wallpaperSrc = 'img/textures/1.jpg';
	
	this.soundTilePlacedSrc = "audio/tile.mp3";
	this.soundMeeplePlacedSrc = "audio/meeple.mp3";
	
	this.menuId = "menu";
	this.gameFieldId = "gameField";
	this.gameInfoId = "gameInfo";
	this.gameWindowId = "gameWindow";
	this.canvasId = "gameCanvas";
	this.nextTileImgId = "nextTileImg"; 
	this.loggerId = "logger";
 	this.loggerTextId = "loggerText";
 	this.tilesQueueId = "tilesQueue";
 	this.preloaderId = "preloader";
 	this.imagesErrorId = "imagesError";
 	this.gamesSelectId = "gamesSelect";
 	this.playerNameId = "playerName";
 	this.startGameButtonId = "startGameButton";
 	this.leaveGameButtonId = "leaveGameButton";
 	                                
 	
 	
 	this.defaultPlayerName = "What is your name?";
 	this.provideYourName = "Please, introduce yourself";
 	
 	this.tilesDir = "img/tiles/"; 
 	
 	this.canvasScale = 1;
 	this.canvasMinScale = 0.6;
    this.canvasMaxScale = 1.3;
    this.canvasScaleStep = { plus: 1.25, minus: 0.8 };
    
 	this.tilesCount = 50;
 	this.cellsCount = 9;  
 	this.imageWidthToTileWidth = 0.952;   //0.976 для варианта с сеткой
    this.iframeWithTileStructuresId = '#iframe_tiles_structure';
	this.startingTileNumber = 8; //8
	this.startingTileOrientation = "north";
	this.tileQueueLength = 72; //учитывая также стартовый тайл 72
	
	this.audioSetFieldId = "audioSetTile";		
	
	this.centralFieldCoords = new Coords(this.tilesCount/2 - 1, this.tilesCount/2 - 1);
	                                                               
	
	
	this.highlightedFieldImageSrc = "img/free_field4.png"; 
	this.crossTile = new ImageFactory("img/delete.png"); 
	this.emptyTile = new ImageFactory("img/empty.gif"); 
	this.wallpaperObj = new ImageFactory(this.wallpaperSrc);
	
	var meeplesTypes = ["basic", "peasant"];
	this.meeplesDirBasic = "img/meeple/basic/";
	this.meeplesDirPeasant = "img/meeple/peasant/";
	this.meeplesPlace = "free";
	this.colors = ["red", "black", "blue", "green", "yellow"];   

	this.meeplesImagesSrc = {basic: [], peasant: []};
	for(var i in meeplesTypes) {
		var meepleType = meeplesTypes[i];     
		for(var j in this.colors) {
			this.meeplesImagesSrc[meepleType][j] = {};  
			this.meeplesImagesSrc[meepleType][j].name = this.colors[j];
			this.meeplesImagesSrc[meepleType][j].src = this.meeplesDirBasic + this.colors[j] + ".png";	
		}
	}                        
	this.meeplesImagesSrc.basic.push({src: this.meeplesDirBasic + this.meeplesPlace + ".png", name:this.meeplesPlace});
	this.meeplesImagesSrc.peasant.push({src: this.meeplesDirPeasant + this.meeplesPlace + ".png", name:this.meeplesPlace});
}






MainData.CASTLE_ALREADY_SCORED = true;

MainData.reverseDirections = {
	left: "right",
	right: "left",
	top: "bottom",
	bottom: "top"
};


MainData.orientationArray = [
	{direction: "top",		reverseDirection: "bottom",	xShift: 0,	yShift: -1}, 
	{direction: "bottom",	reverseDirection: "top",	xShift: 0,	yShift: +1}, 
	{direction: "left",		reverseDirection: "right",	xShift: -1,	yShift: 0}, 
	{direction: "right",	reverseDirection: "left",	xShift: +1,	yShift: 0}
];

MainData.zoneTypeNamesRus = {
	grasses: "поле",
	castles: "замок",
	roads: "дорогу",
	cloisters: "монастырь"	
};


MainData.zoneTypes = [
	{name: "castles", letters: ["C", "J"]}, 
	{name: "roads", letters: ["I"]}, 
	{name: "grasses", letters: ["x"]}, 
	{name: "cloisters", letters: ["M"]}
];

MainData.zoneTypesShortly = {
	castles: ["C", "J"], 
	roads: ["I"], 
	grasses: ["x"], 
	cloisters: ["M"]
};

MainData.scoresForZones = {
	castles: 2,
	shields: 2,
	roads: 1,
	cloisters: 1,
	grasses: 0	
};




MainData.rotateArray = {
	"north": {"left": - Math.PI/2, "right":   Math.PI/2},
	"south": {"left":   Math.PI/2, "right": - Math.PI/2},
	"west":  {"left": - Math.PI,   "right": 0},
	"east":  {"left": 0,           "right": Math.PI}
};
MainData.directionsArray = {
	"north": {"left": "west", "right": "east"},
	"south": {"left": "east", "right": "west"},
	"west":  {"left": "south", "right": "north"},
	"east":  {"left": "north", "right": "south"}
};

MainData.orientation2rotation = {
	"north": "top",
	"south": "bottom",
	"west":  "left",
	"east":  "right"	
};

