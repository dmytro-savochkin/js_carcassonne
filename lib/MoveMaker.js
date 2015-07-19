function MoveMaker(fields) {
	this.mainData = new MainData();
    this.fields = fields;
}
var moveMakerProto = MoveMaker.prototype;




moveMakerProto.createCoordsForNearFields = function(fieldCoords) {
	var x = fieldCoords.x; 
	var y = fieldCoords.y;
	var nearFieldsCoords = {left:"", right:"", top:"", bottom:""};	
	
	for(var i in MainData.orientationArray) {
		nearFieldsCoords[MainData.orientationArray[i].direction] = new Coords(x + MainData.orientationArray[i].xShift, y + MainData.orientationArray[i].yShift);
	}
	return nearFieldsCoords;
}



moveMakerProto.isFieldCanBeSettedThere = function(field, nearFieldsCoords) {  	
	var isFieldCanBeSetted = this.fields.isFieldEmpty(field);
	for(var i in MainData.orientationArray) {
		var nearFieldDirection = MainData.orientationArray[i].direction;
		isFieldCanBeSetted = isFieldCanBeSetted && this.checkNearFieldForMatch(field, nearFieldsCoords[nearFieldDirection], nearFieldDirection);
	}
	       
	return isFieldCanBeSetted;	
}


moveMakerProto.deleteNearFieldsCoords = function(nearFieldsCoords) {	
	for(var i in MainData.orientationArray) {
		delete nearFieldsCoords[MainData.orientationArray[i].direction];
	}
}


moveMakerProto.checkNearFieldForMatch = function(fieldToSet, nearFieldCoords, directionToNearField) {
	if( ! this.fields.isFieldEmpty(nearFieldCoords)) {
		var nearField = this.fields[nearFieldCoords.x][nearFieldCoords.y];

		var directionValid;
		for(var i in MainData.orientationArray) {
			var direction = MainData.orientationArray[i].direction;
			var reverseDirection = MainData.orientationArray[i].reverseDirection;
			
			if(directionToNearField == direction) {
				directionValid = true;
				if(fieldToSet[direction] != nearField[reverseDirection]) {	
					return false;	
				}
			}	
		}

		if(directionValid == undefined) {
			return false;	
		} 
	}           
	
	return true;			
}







moveMakerProto.checkAreFieldsClosedNow = function(nearFieldsCoords) {
	var settedField = {x: (nearFieldsCoords.left.x + 1), y: nearFieldsCoords.left.y};

	this.checkIsFieldClosedNow(settedField);
	for(var i in MainData.orientationArray) {
		this.checkIsFieldClosedNow(nearFieldsCoords[MainData.orientationArray[i].direction]);
	}
}


moveMakerProto.checkIsFieldClosedNow = function(fieldCoords) {
	if( ! this.fields.isFieldEmpty(fieldCoords)) {
		if(this.fields[fieldCoords.x][fieldCoords.y].isClosed == false) {
			var fieldIsClosed = true;
			
			for(var i in MainData.orientationArray) {
				var nearField = new Coords(
					fieldCoords.x + MainData.orientationArray[i].xShift,
					fieldCoords.y + MainData.orientationArray[i].yShift
				);
				fieldIsClosed = fieldIsClosed && ( ! this.fields.isFieldEmpty(nearField)); 	
			}
			
			if(fieldIsClosed) {
				this.fields[fieldCoords.x][fieldCoords.y].isClosed = true;	
			}
		}
	}	
}