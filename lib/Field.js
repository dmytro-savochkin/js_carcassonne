function Field(game, orientation) {
	this.mainData = new MainData();
	this.game = game;
	
	this.x;
	this.y;
	this.isClosed = false;
	this.structure = new Array(); 
	this.meeplePlaces = new Array();
	this.image;
	this.typeId;  
	
	this.left;
	this.right;
	this.top;
	this.bottom;
	
	this.zones;
	this.zoneCreator;	 
                   
	if(orientation != undefined) {
		this.structure = this.structure.createMultidimensionalArray(2, this.mainData.cellsCount);
		this.orientation = orientation;
		this.setTypeId();
		this.setImage();	    
		this.fillStructure();
		this.fillSidesTypes();
		this.fillMeeplePlaces();  
		
		this.zoneCreator = new ZoneCreator(this);	
		this.zoneCreator.createZones();	
		this.zones = this.zoneCreator.getLocalZones();	          
	}                                   
	
}
var fieldProto = Field.prototype;





fieldProto.updateStructureAndZones = function(rotate) {
	this.fillStructure();	
	this.fillSidesTypes();
	this.fillMeeplePlaces();
	  	
	this.zoneCreator.setFieldStructure(this.structure);
	this.zoneCreator.rotateLocalZones(rotate);	
	this.zones = this.zoneCreator.getLocalZones();	
}


fieldProto.setTypeId = function() {
	this.typeId = this.game.tilesQueue.shift();
	if(this.typeId == undefined) {
		throw new Error("queueIsOver");	
	}
}


fieldProto.setImage = function() {
	this.image = this.game.tilesStructure[this.typeId].image;	
}






fieldProto.fillStructure = function() {
	for(var i = 0; i < this.mainData.cellsCount; i++) {
		for(var j = 0; j < this.mainData.cellsCount; j++) {
			this.structure[i][j] = this.game.tilesStructure[this.typeId].structure[i][j];
		}	
	}	                                  

	if(this.orientation != "north") {  
		this.rotateStructureMatrix();
	}
}


fieldProto.rotateStructureMatrix = function() {
 	var a = this.structure;    	
    var n = a.length;
	var rotate = this.orientation;
	var tmp;   
	                           
	if(rotate == "west" || rotate == "east") {	
		for (var i = 0; i < n/2; i++){    
			for (var j = i; j < n-i-1; j++){
				tmp = a[i][j];
				if(rotate == "east") { 
					a[i][j] = a[j][n-i-1];
					a[j][n-i-1] = a[n-i-1][n-j-1];
					a[n-i-1][n-j-1] = a[n-j-1][i];
					a[n-j-1][i] = tmp;
				} else if(rotate == "west") {	
					a[i][j] = a[n-j-1][i];	
					a[n-j-1][i] = a[n-i-1][n-j-1];
					a[n-i-1][n-j-1] = a[j][n-i-1]; 		
					a[j][n-i-1] = tmp;	
				}  
	        }
		}
	} else if(rotate == "south") {
		for(var k = 0; k < (n*n)/2; k++) {
			i = Math.floor(k/n);	
		    j = k%n;
		    tmp = a[i][j];            
   			a[i][j] = a[n-i-1][n-j-1];	
   			a[n-i-1][n-j-1] = tmp;	
		}         
	} else {
		return false;	
	}

	this.structure = a;
}






fieldProto.fillMeeplePlaces = function() {
	for(var i in this.game.tilesStructure[this.typeId].meeples) {
		this.meeplePlaces[i] = this.game.tilesStructure[this.typeId].meeples[i];	
	}                                 
	this.checkIsRotationMeeplePlacesNecessary();
}

fieldProto.checkIsRotationMeeplePlacesNecessary = function() {
	if(this.orientation == "west") {     
		this.rotateMeeplePlaces("left");
	} else if(this.orientation == "east") {   
		this.rotateMeeplePlaces("right");	
	} else if(this.orientation == "south") { 
		this.rotateMeeplePlaces("bottom");
	}	
}

fieldProto.rotateMeeplePlaces = function(rotate) { 
	for(var i in this.meeplePlaces) {
		this.meeplePlaces[i] = this.rotateCoordsInCell(this.meeplePlaces[i], rotate);
	} 
}



fieldProto.rotateCoordsInCell = function(coords, rotate) {
	var n = this.mainData.cellsCount;
	var x = coords[0];
	var y = coords[1];

	var array = [];
    switch(rotate) {
        case "top":
            array[0] = x;
            array[1] = y;
            break;
        case "left":
            array[0] = y;
            array[1] = n-1-x;
            break;
        case "right":
            array[0] = n-1-y;
            array[1] = x;
            break;
        case "bottom":
            array[0] = n-1-x;
            array[1] = n-1-y;
            break;
    }
	return array;	
}



fieldProto.fillSidesTypes = function() {
	var tilesStructure = this.game.tilesStructure[this.typeId];

    switch(this.orientation) {
        case "north":
            this.left = tilesStructure.left;
            this.right = tilesStructure.right;
            this.top = tilesStructure.top;
            this.bottom = tilesStructure.bottom;
            break;
        case "west":
            this.left = tilesStructure.top;
            this.right = tilesStructure.bottom;
            this.top = tilesStructure.right;
            this.bottom = tilesStructure.left;
            break;
        case "east":
            this.left = tilesStructure.bottom;
            this.right = tilesStructure.top;
            this.top = tilesStructure.left;
            this.bottom = tilesStructure.right
            break;
        case "south":
            this.left = tilesStructure.right;
            this.right = tilesStructure.left;
            this.top = tilesStructure.bottom;
            this.bottom = tilesStructure.top
            break;
    }
}



