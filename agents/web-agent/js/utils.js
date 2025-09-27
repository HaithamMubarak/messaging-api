function loadInputDomVal(el,key,defaultValue,bindInputChange,base64Mode){
	el.value = loadStorageValue(key,base64Mode) || defaultValue;
	
	el.onkeyup = function(){
		saveStorageValue(key,el.value,base64Mode);
	}
}

function loadStorageValue(key,base64Mode){
	var value = localStorage[key];
	
	if(value){
		
		if(base64Mode){
			value = atob(value);
		}
		
		return value;
	}
}

function saveStorageValue(key,value,base64Mode){
	if(base64Mode){
		value = btoa(value);
	}
	console.log('saving value '+value+' to key '+key)
	localStorage[key] = value;
}


		
function parseHashParameters(hash){
	
	if(typeof hash == 'undefined'){
		hash = hash || window.location.hash;
	}
	
	var map = {};	
	var items = [];
	
	var end = false;
	
	do{			
		hash = hash.substring(1);
		
		if(hash){
			var nextHashIndex = hash.indexOf('#');
			
			if(nextHashIndex == -1){
				end = true;
				nextHashIndex =  hash.length;
			}

			var token = hash.substring(0,nextHashIndex);

			hash = hash.substring(nextHashIndex);

			var equalsIndex = token.indexOf('=');
			var underIndex = token.indexOf('_');	
			
			equalsIndex = equalsIndex == -1 ? Infinity:equalsIndex;
			underIndex = underIndex == -1 ? Infinity:underIndex;
			
			var index = Math.min(equalsIndex,underIndex);
			index = index == Infinity? -1 : index;
			
			var key,value;
			
			if(index != -1){
				map[token.substring(0,index)] = token.substring(index+1);
				items.push(token);
			}else{
				map[token] = true;
				items.push(token);
			}
		}else{
			end = true;
		}
		
	}while(!end);
	
	return map;
	
}