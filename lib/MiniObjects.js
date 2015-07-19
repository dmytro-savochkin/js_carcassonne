function Coords(x, y) {
	this.x = x;
	this.y = y;	
}


function GlobalZone() {
	this.localZones = new Array(); 
	this.openedSides = new Array();
	this.closed = false;
	this.score = 0;
	this.meeples = new Array();
	this.zoneTypeName;	
}


function LocalZone() {
	this.global = ""; 
	this.data = new Array();
	this.score = 0;
}


function ZonesList() {
	this.castles = new Array(); 
	this.roads = new Array(); 
	this.grasses = new Array(); 
	this.cloisters = new Array();	
}


function Meeple(player, field, cell) {
	this.player = player; 
	this.field = field; 
	this.cell = cell;	
}


function Player(name, color) {
	this.name = name;
	this.meeples = 7;
	this.color = color;
	this.score = 0; 	
}


function ImageFactory(src) {
	var img = new Image();   
	img.src = src;
	return img;
}


function TilesStructure(cellsCount) {
	this.name = "";
	this.quantity = 0; 
	this.image = undefined;
	this.left = "";
	this.right = "";
	this.top = "";
	this.bottom = ""; 
	this.meeplePlaces = new Array();  
	this.structure = new Array();
	this.structure.createMultidimensionalArray(2, cellsCount);		
}












function TileSentData(myMoveId, gameId, playerId, fieldCoords, orientation) { 
	this.myMoveId = myMoveId;     
	this.action = 'tile_placed'; 
	this.fieldCoordsX = fieldCoords.x; 
	this.fieldCoordsY = fieldCoords.y; 
	this.orientation = orientation; 
	this.gameId = parseInt(gameId); 
	this.playerId = playerId;
	this.dbSaved = false;
}
function MeepleSentData(myMoveId, gameId, playerId, fieldCoords, cellCoords, nextPlayerId, orientation) { 
	this.myMoveId = myMoveId;	
	this.action = 'meeple_placed'; 
	this.fieldCoordsX = fieldCoords.x; 
	this.fieldCoordsY = fieldCoords.y;
	this.cellCoordsX = cellCoords.x; 
	this.cellCoordsY = cellCoords.y; 
	this.orientation = orientation; 
	this.gameId = parseInt(gameId); 
	this.playerId = playerId; 
	this.nextPlayerId = nextPlayerId;
	this.dbSaved = false;
}









