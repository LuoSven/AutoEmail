function updateObject(oldObj, newObj){
    if(newObj && oldObj){
        for(filed in newObj){
            oldObj[filed] = newObj[filed];
        }
    }
}