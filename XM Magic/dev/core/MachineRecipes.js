var AssmblerRecipe = {
    recipes:{},
    registerRecipe:function(input,output,cost){
        this.recipes[input] = [output,cost];
    },
    getOutputFrom:function(input){
        if(this.recipes[input]){
            return this.recipes[input][0];
        }
        return null;
    },
    getCostFromRecipe:function(input){
        if(this.recipes[input]){
            return this.recipes[input][1];
        }
        return 0;
    }
};

var TransformerRecipe = {
    recipes:{/*
        ItemID.steel:[
        {
            time:{
                night:ItemID.nightIngot,
                day:ItemID.dayIngot
            },
            catalys:{
                BlockID.sss:ItemID.sdssds
            }
        },50,ItemID.lens]
    */},
    registerRecpe:function(input, output, cost, lens){
        this.recipes[input] = [output,cost,lens]
    },
    getCost:function(input){
        if(this.recipes[input]){
            return this.recipes[input][1]
        }
        return 0;
    },
    getLens:function(input){
        if(this.recipes[input]){
            return this.recipes[input][2]
        }
        return null;
    },
    getOutputFromEnvironment:function(input,time,catalys,lens){
        var output = [];
        if(this.recipes[input]){
            //Debug.m(this.recipes[input]!=null +"is exist recipe");
            if(lens==this.recipes[input][2]){
               // Debug.m("lens true");
                var recEnvir = this.recipes[input][0];
                if(recEnvir.time){
                    //Debug.m("time exist in recipe source time is "+time+"  "+recEnvir.time[time]);
                    if(recEnvir.time[time]){
                        var timeRec = recEnvir.time[time]
                        //Debug.m("time is correct");
                        if(typeof (timeRec)=="number"){
                            output.push(timeRec) ;
                        }else if(typeof (timeRec)=="object"){
                            for(var i in timeRec){
                                output.push(timeRec[i]);
                            }
                        }  
                    }   
                }
                if(recEnvir.catalys){
                     //Debug.m("catalys exist in recipe");
                    if(recEnvir.catalys[catalys]){
                        var resCatatys = recEnvir.catalys[catalys];
                        if(typeof (resCatatys)=="number"){
                            output.push(resCatatys) ;
                        }else if(typeof (resCatatys)=="object"){
                            for(var i in resCatatys){
                                output.push(resCatatys[i]);
                            }
                        } 
                    }
                }
            }
        }
        
        return output;
    }
};