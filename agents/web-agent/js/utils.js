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
    if(typeof hash == 'undefined')
    {
        hash = hash || window.location.hash;
    }

    const map = {};
    const matches = hash.matchAll(/#([^#_]+)_([^#]+)/gi)

    let groups;
    while(!!(groups = matches.next().value))
    {
        console.log(groups[1], '=',  groups[2])
        map[groups[1]] = groups[2];
    }
    return map;
}