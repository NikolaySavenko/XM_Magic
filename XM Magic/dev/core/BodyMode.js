var BodyModeManager = {
    currentModes:[],
    registredModes:{},
    registerMode:function(mode){
        this.registredModes[mode.name] = mode;
        alert("registred mode: "+mode.name);
    },
    getCurrentModes:function(){
        return this.currentModes;
    },
    activateMode:function(mode){
        alert("TRYING ACTIVATE MODE "+mode.name);
        var current = this.getCurrentModes();
        var activated = true;
        for(var i in current){
            if(current[i]==mode){
                activated = false;
                mode.onSecondActivate();
            }
        }
        if(activated){
            if(mode.onActivate){mode.onActivate();}
            this.currentModes.push(mode);
            alert("ACTIVATED MODE "+mode.name);
        }
        return activated;
    },
    deactivateMode:function(mode){
        var modes = this.getCurrentModes();
        for(var i in modes){
            if(modes[i].name==mode.name){ 
                if(modes[i].onDeactivate){modes[i].onDeactivate()}
                delete modes[i];
            }
        }
    },
    isNOConflict:function(mode0,mode1){
        if(!mode0.conflicts&&!mode1.conflicts){
            return true;
        }else if(!mode0.conflicts[mode1]&&!mode1.conflicts[mode0]){
            return true
        }
        return false;
    },
    getModesFunctions:function(funcName){
        var functions = [];
        var modes = this.getCurrentModes();
        for(var i in modes){
            
            if(typeof(modes[i][funcName])=="function"){
                functions.push(modes[i][funcName]);
            }
        }
        return functions;
    }
};


function BodyMode(name){
    this.name = name;
    BodyModeManager.registerMode(this);
};

Callback.addCallback("tick", function(){
    var functions = BodyModeManager.getModesFunctions("tick");
    for(var i in functions){
        functions[i]();
    }
});

Saver.addSavesScope("ActivatedModes",
    function read(scope) {
        for(var i in scope){
            BodyModeManager.currentModes[i] = scope;
        }
    },

    function save() {
        return BodyModeManager.getCurrentModes();
    }
);

