function MeeplesManager(globalZones, field) {
	this.globalZones = globalZones;
	this.field = field;
    this.availablePositions = {zone: [], coords: [], zoneTypeName: []};
}
var meeplesManagerProto = MeeplesManager.prototype;




meeplesManagerProto.getAvailablePositions = function() {	
	return this.availablePositions;
}


meeplesManagerProto.calculateAvailablePositions = function() {	
	this.iterateZoneTypes();	
}


meeplesManagerProto.iterateZoneTypes = function() {
	for(var zoneNumber in MainData.zoneTypes) {
		var zoneTypeName = MainData.zoneTypes[zoneNumber].name;
		var globalZones = this.globalZones[zoneTypeName];
		
		this.iterateGlobalZones(zoneTypeName, globalZones);	
	}
}


meeplesManagerProto.iterateGlobalZones = function(zoneTypeName, globalZones) {
	for(var gzNum in globalZones) {
		var globalZone = globalZones[gzNum];
			
		if( globalZone.meeples.isEmpty() ) {
			var localZones = globalZone.localZones.valueFrom2DArrayAtCoords(this.field); 				
			var lastAvailablePositionInZones = this.iterateLocalZones(zoneTypeName, localZones);	   
		
			if(lastAvailablePositionInZones) {
				this.availablePositions.zone.push(globalZone);
				this.availablePositions.coords.push(lastAvailablePositionInZones);
				this.availablePositions.zoneTypeName.push(zoneTypeName);
			}
		}							
	}	
}


meeplesManagerProto.iterateLocalZones = function(zoneTypeName, localZones) {
	var lastAvailablePosition = false;
	for(var lzIndex in localZones) { 
 		var lzNum = localZones[lzIndex];
 		for(var meeplePositionIndex in this.field.meeplePlaces) {                                 		   
			if( this.meeplePositionExistsInZone(zoneTypeName, lzNum, meeplePositionIndex) ) {
				lastAvailablePosition = this.field.meeplePlaces[meeplePositionIndex];
	        }			
		}		
 	}
 	
 	return lastAvailablePosition;	
}


meeplesManagerProto.meeplePositionExistsInZone = function(zoneTypeName, lzNum, meeplePositionIndex) {
	return this.field.zones[zoneTypeName][lzNum].data.inArray( this.field.meeplePlaces[meeplePositionIndex] );
}










    
	