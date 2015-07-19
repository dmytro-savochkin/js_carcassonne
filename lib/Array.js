var arrayProto = Array.prototype;


Object.defineProperty(arrayProto, "createMultidimensionalArray", { 
	enumerable: false,
	value: 
	
	function(order, length) {  
		var array = new Array(length);  	
		order--; 
		if(order > 0 ) {
			for(var i = 0; i < array.length; i++) {
				array[i] = this.createMultidimensionalArray(order, length);	
			}	
		}     
	    return array;
	}
		
});  


Object.defineProperty(arrayProto, "shuffle", { 
	enumerable: false,
	value: 
	
	function(start, end) {
		if(isNaN(start))start = 0;      
		if(isNaN(end))end = this.length - 1;
		var i = end, j, t;
		while (i > start) { 
			i--;      
			j = Math.floor( Math.getRandomInt(start, end) );
			t = this[i];
			this[i] = this[j];
			this[j] = t;
		}
		return this;
	}
		
}); 




Object.defineProperty(arrayProto, "inArray", { 
	enumerable: false,
	value: 
	
	function(value) {    
	    if((typeof value) != "object") {
		    for(var i = 0, l = this.length; i < l; i++)  {
		        if(this[i] == value) {
		            return true;
		        }
	        }
	    } else {  
	    	var ok = [];
	    	for(var i = 0, l = this.length; i < l; i++)  {
		        ok[i] = true; 
		        if(this[i].length != value.length) {
		        	ok[i] = false;	
		        } else {
			        for(var j = 0; j < this[i].length; j++) {
				        if(this[i][j] != value[j]) {
				            ok[i] = false;
				        }
			        }
		        }
	        }   
	        for(var i = 0, l = this.length; i < l; i++)  {
	        	if(ok[i]) {
	        		return true;	
	        	}	
	        }            		
	    }
	    return false;
	} 
	
}); 

Object.defineProperty(HTMLCollection.prototype, "inArray", { 
	enumerable: false,
	value: Array.prototype.inArray 
}); 		


Object.defineProperty(arrayProto, "isEmpty", { 
	enumerable: false,
	value: 
	
	function() {
		for(var i in this) {
			if(this[i] != undefined && this[i] != "") {
				return false;	
			} 	
		}
		return true;
	}
		
});  


Object.defineProperty(arrayProto, "equals", { 
	enumerable: false,
	value: 
	
	function(array) {
		if (array == null) return false;
		if ((typeof array) != "object") return false;
		if (this.length != array.length) return false;
		return !!this && !!array && !(this<array || array<this);
	}
		
});  


Object.defineProperty(arrayProto, "max", { 
	enumerable: false,
	value: 
	
	function(){
    	var max = 0;
    	for(var i in this) {
    		if(this[i] > max)max = this[i];	
    	}
    	return max;
	}
		
});  


Object.defineProperty(arrayProto, "min", { 
	enumerable: false,
	value: 
	
	function(){
    	var min = this[0];
    	for(var i in this) {
    		if(this[i] < min)min = this[i];	
    	}
    	return min;
	}		
}); 



Object.defineProperty(arrayProto, "valueFrom2DArrayAtCoords", { 
	enumerable: false, value: 
	function(coords) {
		if(this == undefined || this.length == 0) {
			return false;
		} if(this[coords.x] == undefined || this[coords.x].length == 0) {
			return false;
		} if(this[coords.x][coords.y] == undefined || this[coords.x][coords.y].length == 0) {
			return false;
		} 
		return this[coords.x][coords.y];
	}			
}); 


Object.defineProperty(arrayProto, "isFieldEmpty", { 
	enumerable: false, value: 
	function(coords) {
		if(coords.x >= 0 && coords.y >= 0) {
			if(this[coords.x] == undefined)	{
				return true;	
			}
			if(this[coords.x][coords.y] == undefined) {
				return true;	
			}
		}
		return false;	
	}			
});