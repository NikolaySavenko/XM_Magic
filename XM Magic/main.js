/*
NIDE BUILD INFO:
  dir: dev
  target: main.js
  files: 37
*/



// file: header.js

//MOD by Nikolay Savenko
var ChatColor = ModAPI.requireGlobal("ChatColor");
var Particles = ModAPI.requireGlobal("Particles");
var nativeDropItem = ModAPI.requireGlobal("Level.dropItem");
var MobEffect = Native.PotionEffect;
var Enchantment = Native.Enchantment;
var BlockSide = Native.BlockSide;
var EntityType = Native.EntityType;
var playerEmitter;
function random(min, max){
    return (Math.random()*max)+min;
};          

function randomInt(min, max){
    return Math.round(Math.random() * (max - min) + min);
};
function deg2rad(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
};
/*function particleLine(type,coords0,coords1,gap){
    var distance = Entity.getDistanceBetweenCoords(coords0, coords1);
    var vector = {
        x:coords1.x-coords0.x,
        y:coords1.y-coords0.y,
        z:coords1.z-coords0.z
    };
    for(var count =0;i<distance/gap;i++){
        Particles.line
    }
}*/

importLib("ToolType", "*");
IMPORT ("BackpackAPI", "BackpackRegistry");
IMPORT ("BaublesAPI", "Baubles");
IMPORT("Plant_Model");
IMPORT("Harvest_Core");
IMPORT("energylib");
IMPORT("flags");

var XM = EnergyTypeRegistry.assureEnergyType("XM", 1000000);
if(modsAPI.ICore){var EU = EnergyTypeRegistry.assureEnergyType("Eu", 1)}

Callback.addCallback("LevelLoaded", function(){
    playerEmitter = Particles.ParticleEmitter(Player.getPosition().x, Player.getPosition().y, Player.getPosition().z);
    playerEmitter.attachTo(Player.get());
});



// file: core/WorldStorage.js

var WorldXM = {
    defaultChunkXM:100,
    XMChunks:{},
    requireXMFromChunk:function(x,z, amount){
        var chunkName = this.getChunkNameFromCoords(x,z);
        if(typeof(this.XMChunks[chunkName])=="number"){
            if(this.XMChunks[chunkName]>amount){
                this.XMChunks[chunkName]-=amount;
                return amount;
            }else{
                this.XMChunks[chunkName] = 0;
                return this.XMChunks[chunkName];
            }
        }else if(amount<this.defaultChunkXM){
            this.XMChunks[chunkName]= this.defaultChunkXM-amount;
            return amount;
        }
        return 0;
    },
    addXMToChunk:function(x,z, amount){
        var chunkName = this.getChunkNameFromCoords(x,z);
        if(typeof(this.XMChunks[chunkName])=="number"){
            if(this.getXMStatusFromChunk(x,z)+amount<=this.defaultChunkXM){
                this.XMChunks[chunkName]+=amount;
                return amount;
            }else{
                this.XMChunks[chunkName]=this.defaultChunkXM;
                return amount;
            }
        }
        return 0;
    },
    getXMStatusFromChunk:function(x,z){
        var chunkName = this.getChunkNameFromCoords(x,z);
        if(typeof(this.XMChunks[chunkName])=="number"){
            return this.XMChunks[chunkName]
        }else{
            return this.defaultChunkXM;
        }
    },
    getChunkNameFromCoords:function(x,z){
        var ChunkX = parseInt(x/16);
        var ChunkZ = parseInt(z/16);
        return ChunkX+':'+ChunkZ
    }
};

Saver.addSavesScope("XMScope",
    function read(scope) {
        //Debug.m("reading");
        for(var chunk in scope){
            //Debug.m("chunk "+chunk+" , XM: "+scope[chunk]);
            WorldXM.XMChunks[chunk] = scope[chunk];
        }
    },

    function save() {
        var obj = {};
        //Debug.m("saving");
        for(var chunk in WorldXM.XMChunks){
            //Debug.m("chunk "+chunk+" , XM: "+WorldXM.XMChunks[chunk]);
            obj[chunk] = WorldXM.XMChunks[chunk];
        };
        return obj;
    }
);



// file: core/PlayerXM.js

var PlayerXM = {
    simpleTickCost:0.001,
    XMPoisonEffect:0,
    XMDiscount:1,
    XMEfficiency:1,
    shieldLevel:1,
    fucusItems:{},
    capacityItems:{},
    playerXM:{current:0,max:1},
    focusXM:function(amount){
        var pos = Player.getPosition();
        if(WorldXM.requireXMFromChunk(pos.x,pos.z,amount)){
            this.playerXM.current += amount;
        } 
        this.reCalculateXM();  
    },
    reCalculateXM:function(){
        if(this.playerXM.current>this.playerXM.max){
            var delta = this.playerXM.current-this.playerXM.max;
            this.playerXM.current -= delta;
            Entity.damageEntity(Player.get(), delta, Player.get());
        }
    },
    simpleXMTick:function(){
        var tickCost = this.simpleTickCost;
        if(this.playerXM.current){
            this.getXMFromPlayer(tickCost);
        }
    },
    simpleHurt:function(attacker, victim, damage){
        if(PlayerXM.shieldLevel!=1){  
            var damg = this.getDamage(damage);
            var dmg = Math.round(damg* PlayerXM.shieldLevel);
            if(dmg>Entity.getHealth(Player.get())){
                Entity.setHealth(Player.get(),0);
            }else{
                Game.prevent();
                Entity.setHealth(Player.get(), Entity.getHealth(Player.get())-dmg);
            }
        }
    },
    getDamage:function(dmg){
        return Math.floor(dmg+1*this.XMPoisonEffect);
    },
    getXMFromPlayer:function(amount){
        var newAmount = amount * this.XMDiscount;
        if(this.playerXM.current-newAmount>0){
            this.playerXM.current -= newAmount;
            return newAmount;
        }else{
            this.setDefault();
            return 0;
        }
    },
    setDefault:function(){
        this.playerXM.current = 0;
    },
    increaseMaxXM:function(amount){
        this.playerXM.max+=amount;
        this.reCalculateXM();
    },
    decreaseMaxXM:function(amount){
        this.playerXM.max-=amount;
        this.reCalculateXM();
    },
    registerFocusItem:function(id,amount){
        this.fucusItems[id] = amount;
    },
    registerCapacityItem:function(id,amount){
        this.capacityItems[id] = amount;
    },
    getXMFromItem:function(id){
        if(fucusItems[id]){
            return fucusItems[id]
        }
        return 0;
    },
    getPlayerCapacity:function(){
        return this.playerXM.current;
    },
    addPoison:function(amount){
        this.XMPoisonEffect+=amount;
    },
    deletePoison:function(amount){
        if(this.XMPoisonEffect-amount>=0){
            this.XMPoisonEffect-=amount;
            return amount;
        }else{
            var outOfLimit = this.XMPoisonEffect-amount;
            var newAmount = amount-outOfLimit;
            this.XMPoisonEffect-=newAmount;
            return newAmount;
        }
    },
    debugAllValues:function(){
        Debug.m("poison "+this.XMPoisonEffect+" discount "+this.XMDiscount+" effeciency "+this.XMEfficiency+" shield "+this.shieldLevel+" current "+this.playerXM.current+" max "+this.playerXM.max);
    },
    debugValue:function(name){
        Debug.m(this[name]);
    }
};
//////////////////////////////////////
Saver.addSavesScope("PlayerXM",
    function read(scope) {
        if(typeof(scope)=="number"){
            PlayerXM.playerXM.current = scope;   
        }alert(PlayerXM.playerXM.current);
        PlayerXM.reCalculateXM();
        //Debug.m("reading player xm     current: "+PlayerXM.playerXM.current+" ,  max: "+PlayerXM.playerXM.max);
    },

    function save() {
        //Debug.m("saving player xm  current: "+PlayerXM.playerXM.current);
        PlayerXM.reCalculateXM();
        return PlayerXM.playerXM.current;
    }
);

Callback.addCallback("EntityHurt", function(attacker, victim, damage){
    if(victim==Player.get()){
        PlayerXM.simpleHurt(attacker, victim, damage);    
    }
});
Callback.addCallback("EntityDeath", function(entity){
    if(entity==Player.get()){
        PlayerXM.setDefault();
    }
});

Callback.addCallback("tick", function(){
    PlayerXM.simpleXMTick();
    if(World.getThreadTime()%100==0){
        PlayerXM.debugAllValues();
    }
});




// file: core/BodyMode.js

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





// file: core/particles.js

var particleTexture = "XM_particle";
if(__config__.getBool("highQualityParticles")){
    particleTexture = "vortex";
}

var XMparticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .5],
    size:[1, 10],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

var XMBlueParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,.2,1, .5],
    size:[1, 5],
    lifetime:[20, 40],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

var BlackParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[0,0,0, .5],
    size:[4, 4],
    lifetime:[20, 100],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

var XMSmallMachineParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .5],
    size:[1, 10],
    lifetime:[1, 10],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});
var XMmachineParticle = Particles.registerParticleType({ 
    texture: particleTexture, 
    render: 2, 
    color:[.2,1,.2, .8], 
    size:[2, 4], 
    lifetime:[20, 20], 
    collision:false, 
    animators: { 
    alpha:{fadeIn: 0.1, fadeOut: .8, start: 0, end: 1}, 
    size:{fadeIn:0.2, fadeOut: 1, start:0, end:1} 
} 
});

var XMRedParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[1,.2,.2, .7],
    size:[3, 3],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

XMBlueParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,.2,1, .7],
    size:[3, 3],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});
XMSmallGreenParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .7],
    size:[3, 3],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});
/*
var XMmachineParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .8],
    size:[2, 4],
    lifetime:[20, 20],
    collision:false,
    animators: {
        //alpha:{fadeIn: .4, fadeOut: .4},
        //size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});     my*/



// file: core/MachineRecipes.js

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



// file: core/XMItems.js

var XMItems = {
    items:{},
    registerXMItem:function(itemID){
        this.items[itemID] = true;
    }
};



// file: core/weapon.js

var weaponFunctions = {};
//example  weaponFunctions[23123] = function(attacker, victim, damage,item){}

Callback.addCallback("EntityHurt", function(attacker, victim, damage){
    if(attacker==Player.get()){
        alert("player attack ");
        var item = Player.getCarriedItem();
        if(weaponFunctions[item.id]){
            Game.prevent();
            alert("weapon");
            weaponFunctions[item.id](attacker, victim, damage,item);
        }
    }
});



// file: abilities/deathRay.js

function dangerRay(vector, emitter,damage){
     this.step = {
        x:vector.x/10,
        y:vector.y/10,
        z:vector.z/10
    };
    this.emitter = emitter;
    this.distanse = 32;
    this.count = this.distanse*4;
    this.particle = BlackParticle;

    for(var currentStep = 0;currentStep<this.distanse;currentStep+=this.distanse/this.count){
        var coord = {
            x:this.emitter.getPosition().x+currentStep*vector.x,
            y:this.emitter.getPosition().y,
            z:this.emitter.getPosition().z+currentStep*vector.z
        };
       var entities = Entity.getAllInRange(coord, 2);
        for(var i in entities){
            Entity.damageEntity(entities[i],damage*PlayerXM.XMEfficiency);
            alert("damage "+damage*PlayerXM.XMEfficiency);
        }
        //alert(World.getBlockID(coord.x,coord.y,coord.z));
        if(World.getBlockID(coord.x,coord.y,coord.z)!=0){
            break;
        }
       this.emitter.emit(this.particle, 0, coord.x, coord.y, coord.z);
    }
}



// file: abilities/trebla.js

function TreblaAnimation(x,y,z){
    this.absAlpha=0;
    this.count =3;
    this.radius= 3;
    this.fullRadius=3;
    this.partCount=50;
    this.c=0;
    this.playerAngle = Entity.getLookAngle(Player.get()).yaw;
    
    this.emitter = Particles.ParticleEmitter(x, y, z);
    this.lookAngle = Entity.getLookAngle(Player.get());
    
    this.update = function(){
        if(this.c < this.partCount){
            for(var i = 0; i < this.count; i++){
                var a = (i / this.count) * Math.PI *2; // текущий угол
                var sx = Math.sin(a + this.absAlpha) * this.radius;
                var sy = Math.cos(a + this.absAlpha) * this.radius;
                
                var oldx = this.emitter.getPosition().x+sx;
                var oldz = this.emitter.getPosition().z;
                
                var rotAngle = this.getRotAngle(this.playerAngle);
                var rx = oldx - x;
                var rz = oldz - z;
                var c = Math.cos(rotAngle);
                var s = Math.sin(rotAngle);
                var newX = x + rx * c - rz * s;
                var newZ = z + rx * s + rz * c;

                // ебош партиклу
                this.emitter.emit(XMRedParticle, 0, newX, this.emitter.getPosition().y+sy, newZ,0,0,0);       
            }
             this.absAlpha-=.08;
             this.radius =  this.fullRadius -  this.c /  this.partCount *  this.fullRadius;
             this.c++;
        }else{
            var ray = new dangerRay(Entity.getLookVectorByAngle(this.lookAngle),this.emitter,20);
            this.remove = true;
        }
    };
    this.getRotAngle = function(vectorAngle){return vectorAngle - Math.PI;}
};



// file: items/book.js

IDRegistry.genItemID("forgottenKnowledge");
Item.createItem("forgottenKnowledge","Forgotten Knowledge", {name: "book", meta: 0}, {stack:1});
Recipes.addShapeless({id:ItemID.forgottenKnowledge, count: 1, data: 0}, [{id: ItemID.starPiece, data: 0}, {id: 340, data: 0}]);

ModAPI.addAPICallback("GuideAPI", function(api){
    const GuideAPI = api.GuideAPI;
    const GuideHelper = api.GuideHelper;
    const PageControllers = api.PageControllers;

    GuideAPI.registerGuide("forgottenKnowledge", {
        item: ItemID.forgottenKnowledge, 
        debug: false, 
            textures: { 
            background: "book", 
            nextLink: "next_page", 
            preLink: "pre_page", 
            close: "cancel", 
        }, 
        pages: {
            "default": {
                nextLink: "quickStart",
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "XM Magic", size: 30},
                        {text:"XM(Exotic Matter) некоторые называют ее вис, некоторые аурой, мы же привыкли называть ее XM - это энергия окружающая и пронизывающая все в мире. Обуздав ее можно сотворить немыслимые вещи... ", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Начало", size: 25, link: "quickStart"},
                        {text: "Добыча", size: 25, link: "digging"},
                        //{text: "Способы контроля", size: 25, link: "control"},
                        {text: "Новый металл", size: 25, link: "starBlock"},
                        {text: "Фокусировка!", size: 25, link: "simpleFocusing"},
                        {text: "Носимые предметы", size: 25, link: "baubles"},
                        {text: "Скрытая информация", size: 25, link: "IV"},
                        {text: "Куда его девать?", size: 25, link: "Charger"},
                        {text: "Время для upgrade!", size: 25, link: "tier2"},
                        {text: "Преобразование", size: 25, link: "transformer"},
                        {text: "Восстановление", size: 25, link: "restore"},
                        {text: "Печь?", size: 25, link: "furnace"},
                        {text: "Беспроводная передача", size: 25, link: "wireless"},
                        {text: "Инструменты из ночных слитков", size: 25, link: "dark"},
                        {text: "Режимы потребления XM", size: 25, link: "modes"}
                        
                    ]
                }
            },
            "quickStart": {
                nextLink: "digging",
                preLink: "default",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Основы", size: 30},
                        {text:"Так как XM содержится во всем - ее добыча не представляет трудностей, но с хранением в больших колличествах есть большие проблемы. Её  можно лишь временно сконцентрировать внутри чего либо.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.starOre, data:0},{id:ItemID.starPiece, data:0},{id:BlockID.starBlock, data:0}],
                    elements: [
                        {text: "Ресурсы", size: 25, link: "quickStart"},
                        {text: "Часто XM произвольно концентрируется внутри блоков и, когда ее колличество превышает допустимое - блок становится физическим проявлением этой энергии, при попытке его сломать- выпадает кусок, слабо концентрирующий XM", size: 18}
                        
                    ]
                }
            },
            "digging": {
                nextLink: "starBlock",
                preLink: "quickStart",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Добыча", size: 30},
                        {text:"XM, которая находится в мире можно высосать и использовать. Будьте аккуратны! Эту энергию легко достать, но чрезвычайно сложно поместить обратно. Старайтесь не допускать иссякания энергии, но если все же случилось, то готовьтесь к плохим последствиям и постарайтесь как можно быстрее уйти подальше.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items: [{id:BlockID.XMCollector, data:0},{id:BlockID.starIngotBlock, data:0}],
                    elements: [
                        {text: "Концентратор", size: 25, link: "quickStart"},
                        {text: "Безжалостно высасывает XM из чанка, не контролирует скорость и объем высасывания. Если энергия не потребляется другими механизмами, то блок безвозвартно сублимирует её в себе. Если это не контролировать, то блок превратся в нечто другое, но, во что?", size: 18}
                        
                    ]
                }
            },
            "baubles": {
                nextLink: "IV",
                preLink: "simpleFocusing",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Обереги, кольца и прочее барахло", size: 30},
                        {text:"Без их использования игра превратся в мучения и постояннную миграцию.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:ItemID.mindBelt, data:0},{id:ItemID.starRing, data:0},{id:ItemID.chargingMedal, data:0}],
                    elements: [
                        {text: "Пояс разума", size: 25, link: "quickStart"},
                        {text: "Позволяет разумнее расходавать сконцентрированную в теле XM. А если покороче, то пояс дает скидку 50% на любое использование XM ИГРОКОМ.", size: 18},
                        {text: "Медальен зарядки", size: 25, link: "quickStart"},
                        {text: "Позволяет чинить предметы, извлекая XM из носителя. Для починки в игроке должна быть сконцентрирована XM и предмет, созданный из XM проводимого материала должен быть у ИГРОКА в руке.", size: 18},
                        {text: "Звездное кольцо", size: 25, link: "quickStart"},
                        {text: "Самый полезный предмет начинающего игрока. Немного повышает максимальное колличество XM, которое может концентрировать ИГРОК.", size: 18}                      
                    ]
                }
            },
            "simpleFocusing": {
                nextLink: "baubles",
                preLink: "starBlock",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Фокусировка!", size: 30},
                        {text:"XM можно сконцентрировать внутри живого существа, для безопастности окружающих лучше концентрировать ее внутри себя. ОСТОРОЖНО, неподготовленное тело может не выдержать эту силу!(но вы можете попробовать...) Перед концентрацией рекомендуется подготовить свое тело или просто обзавестись каким нибудь предметом,который поможет вам перенести такое. Но если вам все же удасться, то постарайтесь не медлить, ведь она удержать ее надолго почти невозможно.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:ItemID.simplStarFocus, data:0}],
                    elements: [
                        {text: "Сделаем это!", size: 30},
                        {text: "Раз уж вы все же решились, то попробуйте применить механизм, обычно используемый в блоках. Остается надеяться на то,что вас не разорвет на части...", size: 18},
                    ]
                }
            },
            "starBlock": {
                nextLink: "simpleFocusing",
                preLink: "digging",
                
                left: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items:[{id: BlockID.starBlock, data:0},{id: ItemID.starIngot, data:0}],
                    elements: [
                        {text: "Странный материал", size: 30},
                        {text:"Перенасыщение XM блоком превело к образованию странного метала, он подобен тем кускам, которые  вы уже привыкли использовать, но исеет большую концентрацию XM. Возможно удасться придать предметам, сделанным из него новые свойства.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 5,
                    item_size: 100,
                    items: [{id:ItemID.starSword, data:0},{id:ItemID.starShovel, data:0},{id:ItemID.starPickaxe, data:0},{id:ItemID.starAxe, data:0},{id:ItemID.starHoe, data:0}],
                    elements: [
                        {text: "Они уже здесь!", size: 30},
                        {text: "После нескольких эксперементов вам удалось создать эту сверкающую пятерку, несмотря на их хрупкость, они способны воссоздавать себя. Они окзались наровне с железными инструментами, а порой даже лучше.", size: 18},
                    ]
                }
            },
            "IV": {
                nextLink: "Charger",
                preLink: "baubles",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Скрытые данные", size: 30},
                        {text:"Взаимодействуя с XM не забывайте о том, что каждое ваше действие отражается как на вас, так и на мире. И не всегда это вляение приносит пользу...", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:ItemID.collectingRobe, data:0}],
                    elements: [
                        {text: "Много непонятных слов", size: 30},
                        {text: "Каждый носимый предмет или действие по-разному влияет на вас и мир. Предметы и действия способны влиять на: вместимость вашего тела, вместимость чанка, силу использования предметов, скидку на их использование, защиту и отравление XM. Вам стоит запомнить, что нахождение XM в организме не остается незамеченным. После каждого втягивания в себя XM ваш организм будет накапливать смертоносный яд, способы извлечения которого еще неизвестны...", size: 18},
                    ]
                }
            },
            "Charger": {
                nextLink: "tier2",
                preLink: "IV",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Преобразование", size: 30},
                        {text:"Перенасыщая определенные предметы вы можете полностью изменить их природу", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.charger, data:0},{id:ItemID.assemblerTool,data:0},{id:BlockID.assembler,data:0}],
                    elements: [
                        {text: "Зарядник и преобразователь", size: 30},
                        {text: "Подведите к заряднику XM и он начнет концентрировать XM в виде сгустка сверху, затем присоедините его к преобразователю с помощью инструмента и положите в преобразователь необходимый предмет, после достижения в заряднике необходимого уровня заряда он передаст его в предмет и тотизменит свои свойства.", size: 18},
                    ]
                }
            },
            "tier2": {
                nextLink: "transformer",
                preLink: "Charger",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Быстрее, выше, сильнее!", size: 30},
                        {text:"Пропитав обычные XM слитки вы сделали их на уровень выше!", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.starIngotBlockTier2, data:0},{id:ItemID.starIngotTier2,data:0},{id:ItemID.swordTier2,data:0}],
                    elements: [
                        {text: "Лучше!", size: 30},
                        {text: "Пусть вам и пришлось потратить немного XM, но это того стоило! Предметы, созданные из второго уровня имеют новые, ранее недоступные способности! Особенно изменился меч, он стал не только сильнее и прочнее, но и замещает тело убитого врага на тело носителя меча(телепортирует)", size: 18},
                    ]
                }
            },
            "transformer": {
                nextLink: "restore",
                preLink: "tier2",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Одно в другое", size: 30},
                        {text:"С помощью этого устройства, дополненного специальными линзами вы можете изменять слитки не меняя их уровень", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.transformer, data:0},{id:ItemID.lensDark,data:0},{id:ItemID.darkIngot,data:0}],
                    elements: [
                        {text: "XM Transformer", size: 30},
                        {text: "Это устройство более стабильная верия преобразователя и теперь он не требует зарядников, но требует больше XM и спецаильные линзы. Так же на получаемый материал вляет время суток, погода, линза и удача...", size: 18},
                    ]
                }
            },
            "restore": {
                nextLink: "furnace",
                preLink: "transformer",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Восстановление", size: 30},
                        {text:"С помощью этого устройствавы можете восполнить XM в атмосфере", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:BlockID.generator, data:0}],
                    elements: [
                        {text: "Восстановитель", size: 30},
                        {text: "Устройство поедает саженцы вокруг себя и преобразует их в XM", size: 18},
                    ]
                }
            },
            
            "furnace": {
                nextLink: "wireless",
                preLink: "restore",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Вот так печь..", size: 30},
                        {text:"Плавит быстро, жрет много", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:BlockID.starFurnace, data:0}],
                    elements: [
                        {text: "Звездная печь", size: 30},
                        {text: "Используйте на свой страх и риск! Не забывайте о последствиях...", size: 18},
                    ]
                }
            },
            "wireless": {
                nextLink: "dark",
                preLink: "furnace",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Без проводов!", size: 30},
                        {text:"Данное устройство позволит удобно переносить XM по воздуху на большие расстояния. Помета автора: кликайте в присяде оправляющим по принимающему", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items: [{id:BlockID.transmitter, data:0},{id:BlockID.transmitter, data:1}],
                    elements: [
                        {text: "Беспроводной передатчик", size: 30},
                        {text: "Кликните первым по второму что бы привязать. Нажмите по нему в присяде, что бы поменять режим на отдачу(на красный)", size: 18},
                    ]
                }
            },
            "dark": {
                nextLink: "modes",
                preLink: "wireless",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Странный течный слиток", size: 30},
                        {text:"Этот слиток, полученный при совмещении новых ресурсов, линзы и ночи способен на странные вещи.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items: [{id:ItemID.darkIngot, data:0},{id:ItemID.swordDark, data:0}],
                    elements: [
                        {text: "Инструменты самой ночи", size: 30},
                        {text: "При совмещении с обычными материалами удалось создать только меч, но этот меч способен создавать странный черный луч, забирая и окрашивая XM из атмосферы.", size: 18},
                    ]
                }
            },
             "modes": {
                nextLink: "quickStart",
                preLink: "dark",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Режимы потребления XM", size: 30},
                        {text:"Исследуя взаимодействие XM и организма вам удалось открыть способы кратковременного увеличения эффективности тела.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:ItemID.XMunlocker, data:0}],
                    elements: [
                        {text: "XMunlocker", size: 30},
                        {text: "Этот режим способен кратковременно, но очень сильно увеличить эффективность использования XM, но вместе с этим усилится его расход и урон телоу. Имеет несколько стадий. После достижения последней-вы умрете", size: 18},
                    ]
                }
            }
            
            ////
        }
    });
});




// file: items/res/otherRes.js

IDRegistry.genItemID("simplStarFocus");
Item.createItem("simplStarFocus","Simple Star Focus", {name: "simpleStarFocus", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.simplStarFocus, count: 1, data:0}, [
         "xyx",
         "yxy",
         "xyx"
    ], ['x',ItemID.starPiece,0, 'y', 265,0]);
    Recipes.addShapeless({id:ItemID.starIngot, count: 9, data: 0}, [{id: BlockID.starIngotBlock, data: 0}]);
});

Item.registerUseFunction("simplStarFocus", function (coords, item, block) {
    PlayerXM.focusXM(10);
    Player.decreaseCarriedItem(1);
});




// file: items/res/ingots.js

IDRegistry.genItemID("starIngot");
Item.createItem("starIngot","Star Ingot", {name: "star_ingot", meta: 0}, {});


IDRegistry.genBlockID("starIngotBlock");
Block.createBlock("starIngotBlock", [
{name: "Star Ingot Block", texture: [["starIngotBlock", 1]],inCreative:true}
], "opaque");


IDRegistry.genItemID("starIngotTier2");
Item.createItem("starIngotTier2","Star Ingot Tier 2", {name: "star_ingot", meta: 1}, {});

IDRegistry.genBlockID("starIngotBlockTier2");
Block.createBlock("starIngotBlockTier2", [
{name: "Star Ingot Block Tier 2", texture: [["starIngotBlock", 2]],inCreative:true}
], "opaque");


IDRegistry.genItemID("grassIngot"); //Create a new item
Item.createItem("grassIngot", "Grass Ingor", {name: "grassIngot", meta: 0}, {});

IDRegistry.genItemID("darkIngot"); //Create a new item
Item.createItem("darkIngot", "Dark Ingor", {name: "darkIngot", meta: 0}, {});




// file: items/res/starPiece.js

IDRegistry.genItemID("starPiece");
Item.createItem("starPiece","Star Piece", {name: "star_piece", meta: 0}, {stack:16});
Callback.addCallback("ItemUse", function(coords, item, block){
    var x = coords.x;
    var y = coords.y;
    var z = coords.z;
    if(item.id==ItemID.starPiece){
        if(Entity.getSneaking(Player.get())){
            var TE = World.getTileEntity(x,y,z);
            if(TE){
                if(typeof(TE.data.XM)=="number"){                  
                    alert(TE.data.XM);           
                } 
            }        
        }else{
            alert(WorldXM.getChunkNameFromCoords(coords.x, coords.z));
            alert(WorldXM.getXMStatusFromChunk(coords.x, coords.z));
            
        } 
    }
    
});

IDRegistry.genBlockID("starBlock");
Block.createBlock("starBlock", [
{name: "Star Block", texture: [["star_block", 0]],inCreative:true}
], "opaque");
Callback.addCallback("PostLoaded", function(){
    Recipes.addShapeless({id:BlockID.starBlock, count: 1, data: 0}, [{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0}]);
});



// file: items/tool/focusItems.js

IDRegistry.genItemID("simplStarFocus");
Item.createItem("simplStarFocus","Simple Star Focus", {name: "simpleStarFocus", meta: 0}, {stack:8});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.simplStarFocus, count: 1, data:0}, [
         "xyx",
         "yxy",
         "xyx"
    ], ['x',ItemID.starPiece,0, 'y', 265,0]);
    Recipes.addShapeless({id:ItemID.starIngot, count: 9, data: 0}, [{id: BlockID.starIngotBlock, data: 0}]);
});

Item.registerUseFunction("simplStarFocus", function (coords, item, block) {
    Player.decreaseCarriedItem(1);
    PlayerXM.focusXM(2*PlayerXM.XMEfficiency);
    for(var i = 0; i<=10;i++){
        var radius = 10;
        var vx = (Math.random()-0.5)*radius;
        var vy = (Math.random()-0.5)*radius;
        var vz = (Math.random()-0.5)*radius;
        var pC = Player.getPosition();
        if(pC.y+.5+vy>pC.y){
            playerEmitter.emit(XMparticle,0, pC.x-.5+vx, pC.y-.5+vy, pC.z-.5+vz, -vx/20, -vy/20, -vz/20);        
        }
    }
});



// file: items/tool/starTools.js

IDRegistry.genItemID("starSword");
IDRegistry.genItemID("starShovel");
IDRegistry.genItemID("starPickaxe");
IDRegistry.genItemID("starAxe");
Item.createItem("starSword", "Star Sword", {name: "starSword", meta: 0}, {stack: 1});
Item.createItem("starShovel", "Star Shovel", {name: "star_shovel", meta: 0}, {stack: 1});
Item.createItem("starPickaxe", "Star Pickaxe", {name: "star_pick", meta: 0}, {stack: 1});
Item.createItem("starAxe", "Star Axe", {name: "star_axe", meta: 0}, {stack: 1});

Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id: ItemID.starSword, count: 1, data: 0}, [
         "x",
         "x",
         "z"
    ], ['x',ItemID.starIngot,0,"z",280,0]);
    Recipes.addShaped({id: ItemID.starShovel, count: 1, data: 0}, [
         "x",
         "z",
         "z"
    ], ['x',ItemID.starIngot,0,"z",280,0]);
    Recipes.addShaped({id: ItemID.starPickaxe, count: 1, data: 0}, [
         "xxx",
         " z ",
         " z "
    ], ['x',ItemID.starIngot,0,"z",280,0]);
    Recipes.addShaped({id: ItemID.starAxe, count: 1, data: 0}, [
         "xx ",
         "xz ",
         " z "
    ], ['x',ItemID.starIngot,0,"z",280,0]);
});



ToolAPI.addToolMaterial("star", {durability: 10, level: 3, efficiency: 10, damage: 2, enchantability: 14});
ToolAPI.setTool(ItemID.starSword, "star", ToolType.sword);
ToolAPI.setTool(ItemID.starShovel, "star", ToolType.shovel);
ToolAPI.setTool(ItemID.starPickaxe, "star", ToolType.pickaxe);
ToolAPI.setTool(ItemID.starAxe, "star", ToolType.axe);

XMItems.registerXMItem(ItemID.starSword);
XMItems.registerXMItem(ItemID.starShovel);
XMItems.registerXMItem(ItemID.starPickaxe);
XMItems.registerXMItem(ItemID.starAxe);

weaponFunctions[ItemID.starSword] = function(attacker, victim, damage,item){
    var maxDamage = Item.getMaxDamage(item.id);
    if(item.data+1<=maxDamage){
        
        var coords = Entity.getPosition(Player.get());
        var ent = Entity.findNearest({x:coords.x,y:coords.y,z:coords.z}, null, 8);
        var entPosition = Entity.getPosition(ent);
        var type = Entity.getType(ent);
        ToolAPI.breakCarriedTool(1);
        if(ent!=attacker||type!=64){      
            Entity.damageEntity(ent, parseInt(damage/2));
            var emittr = new Particles.ParticleEmitter(entPosition.x, entPosition.y, entPosition.z);
            for(var step = 0; step<=Math.PI*2; step+=Math.PI/12){              
                emittr.emit(XMRedParticle, 0 ,emittr.getPosition().x+Math.cos(step), emittr.getPosition().y+1, emittr.getPosition().z+Math.sin(step), 0, Math.random()*.2,0);        
            }
        }
    }
};



// file: items/tool/assemblerTool.js

IDRegistry.genItemID("assemblerTool");
Item.createItem("assemblerTool","Assembler Connector", {name: "assemblerTool", meta: 0}, {stack:1});
Item.registerNameOverrideFunction(ItemID.assemblerTool, function(item, name){
    var carried = Player.getCarriedItem();
    if(carried.id == item.id){
        var extra = carried.extra;
        if(extra){
            var x = extra.getInt("x");
            var y = extra.getInt("y");
            var z = extra.getInt("z");
            name += "\n§7x: " + x + ", y: " + y + ", z: " + z;
        }
    }
    return name;
});

Item.registerUseFunction("assemblerTool", function(coords, item, block){
    var linkedCoords;
    var extra = item.extra;
    if(!extra){
        extra = new ItemExtraData();
        item.extra = extra;
    }else{
        var x = extra.getInt("x");
        var y = extra.getInt("y");
        var z = extra.getInt("z");
        linkedCoords = {x: x, z: z, y: y};
        
    }
    if(block.id==BlockID.assembler){
        if(linkedCoords){
            var assembler = World.getTileEntity(coords.x, coords.y, coords.z);
            var charger = World.getTileEntity(linkedCoords.x, linkedCoords.y, linkedCoords.z);
            if(assembler && charger){
                //assembler.data.connectedChargers.push({x:linkedCoords.x, y:linkedCoords.y, z:linkedCoords.z});
                charger.data.connecterAssembler = {x:coords.x, y:coords.y, z:coords.z};
            }
            
            Game.tipMessage("Linked!");
        }else{
            Game.tipMessage("No linked coords");
        }
    }else if(block.id==BlockID.charger){
        extra.putInt("x", coords.x);
        extra.putInt("y", coords.y);
        extra.putInt("z", coords.z);
        Player.setCarriedItem(item.id, 1, item.data, extra);
        Game.tipMessage("New coords getted");
    }
});



// file: items/tool/swordTier2.js

IDRegistry.genItemID("swordTier2");
Item.createItem("swordTier2", "Star Sword Tier 2", {name: "swordT2", meta: 2}, {stack:1});
Recipes.addShaped({id: ItemID.swordTier2, count: 1, data: 0}, [
     "x",
     "x",
     "z"
], ['x',ItemID.starIngotTier2,0,"z",280,0]);
ToolAPI.addToolMaterial("star2", {durability: 30, level: 3, efficiency: 10, damage: 5, enchantability: 14});
ToolAPI.setTool(ItemID.swordTier2, "star2", ToolType.sword);

weaponFunctions[ItemID.swordTier2] = function(attacker, victim, damage,item){

     var coords = Entity.getPosition(attacker);
     var vicPos = Entity.getPosition(victim);
     //Debug.m(coords);
     //Debug.m(vicPos);  
     //alert(Entity.getHealth(victim)+" "+damage);
     if(Entity.getHealth(victim)<=damage){
         alert("aaaaaaaaaa");
         Entity.setPosition(victim,coords.x,coords.y,coords.z);
         Entity.setPosition(attacker,vicPos.x,vicPos.y+2,vicPos.z);
     }
     Entity.damageEntity(victim, damage);
     ToolAPI.breakCarriedTool(5);  
};



// file: items/baubles/lens.js

var lenses = {};
IDRegistry.genItemID("simpleLens");
Item.createItem("simpleLens","Simple Lins", {name: "lins", meta: 0}, {stack:1});
lenses[ItemID.simpleLens] = true;
Baubles.registerBauble({
    id: ItemID.simpleLens,
    type: "charm"
});

IDRegistry.genItemID("lensGrass");
Item.createItem("lensGrass","Grass Lins", {name: "lins", meta: 1}, {stack:1});
lenses[ItemID.lensGrass] = true;
Baubles.registerBauble({
    id: ItemID.lensGrass,
    type: "charm"
});

IDRegistry.genItemID("lensDark");
Item.createItem("lensDark","Grass Dark", {name: "lins", meta: 2  }, {stack:1});
lenses[ItemID.lensDark] = true;
Baubles.registerBauble({
    id: ItemID.lensDark,
    type: "charm"
});




// file: items/baubles/tester.js

IDRegistry.genItemID("tester");
Item.createItem("tester","XMTester", {name: "tester", meta: 0}, {stack:1});
Item.setMaxDamage(ItemID.tester, 10);
XMItems.registerXMItem(ItemID.tester);
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.tester, count: 1, data:0}, [
     "zzz",
     "zxz",
     "zzz"
], ['z',339,0,'x', ItemID.simplStarFocus,0]);;
});

Item.registerUseFunction("tester", function (coords, item, block) {
    ToolAPI.breakCarriedTool(1);
    var xmChunk = WorldXM.getXMStatusFromChunk(coords.x,coords.z);
    var color;
    if(WorldXM.defaultChunkXM<=xmChunk){
        color = ChatColor.WHITE;
    }else if(WorldXM.defaultChunkXM*.99<=xmChunk){
        color = ChatColor.GREEN;
    }else if(WorldXM.defaultChunkXM*.75<=xmChunk){
        color = ChatColor.DARK_GREEN;
    }else if(WorldXM.defaultChunkXM*.60<=xmChunk){
        color = ChatColor.YELLOW;
    }else if(WorldXM.defaultChunkXM*.45<=xmChunk){
        color = ChatColor.GOLD;
    }else if(WorldXM.defaultChunkXM*.20<=xmChunk){
        color = ChatColor.GOLD;
    }else if(WorldXM.defaultChunkXM*.10<=xmChunk){
        color = ChatColor.DARK_GRAY;
    }else{
        color = ChatColor.BLACK;
    }
    Game.tipMessage(color+"XM Level");
});



// file: items/baubles/rings.js

IDRegistry.genItemID("starRing");
Item.createItem("starRing","Simple Star Ring", {name: "starRing", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.starRing, count:1, data:0}, [
         "xzx",
         "zxz",
         "xzx"
    ], ['z',ItemID.starIngot,0,'x',ItemID.starPiece,0]);
});

Baubles.registerBauble({
    id: ItemID.starRing,
    type: "ring",
    onEquip: function () {
        //Debug.m("increasing");
        Game.tipMessage(ChatColor.GREEN+"You feel you become a bit more powerful!");
        PlayerXM.increaseMaxXM(2);
    },

    onTakeOff: function () {
        //Debug.m("Decreasing");
        Game.tipMessage(ChatColor.DARK_RED+"Power leaves you...");
        PlayerXM.decreaseMaxXM(2);
    }
});

IDRegistry.genItemID("adwancedStarRing");
Item.createItem("adwancedStarRing","Adwanced Simple Star Ring", {name: "adwancedRing", meta: 0}, {stack:1});
AssmblerRecipe.registerRecipe(ItemID.starRing, ItemID.adwancedStarRing, 100);
Baubles.registerBauble({
    id: ItemID.adwancedStarRing,
    type: "ring",
    onEquip: function () {
        //Debug.m("increasing");
        Game.tipMessage(ChatColor.GREEN+"You feel you become a much more powerful!");
        PlayerXM.increaseMaxXM(10);
    },

    onTakeOff: function () {
        //Debug.m("Decreasing");
        Game.tipMessage(ChatColor.DARK_RED+"Power leaves you...");
        PlayerXM.decreaseMaxXM(10);
    }
});



// file: items/baubles/belt.js

IDRegistry.genItemID("mindBelt");
Item.createItem("mindBelt","Belt Of Mind", {name: "Mind_belt", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.mindBelt, count:1, data:0}, [
         " x ",
         "x x",
         " z "
    ], ['z',ItemID.starPiece,0,'x',334,0]);
});

Baubles.registerBauble({
    id: ItemID.mindBelt,
    type: "belt",
    onEquip: function () {
        Debug.m("pre discount "+PlayerXM.XMDiscount);
        Game.tipMessage(ChatColor.GREEN+"It is holding back energy");
        PlayerXM.XMDiscount = PlayerXM.XMDiscount * .5;
        PlayerXM.XNEfficiency = PlayerXM.XMEfficiency* 1.5;
        Debug.m("post discount "+PlayerXM.XMDiscount);
    },

    onTakeOff: function () {
        //Debug.m("Decreasing");
        Game.tipMessage(ChatColor.DARK_RED+"Power leaves you...");
        PlayerXM.XMDiscount = PlayerXM.XMDiscount/ .5;
        PlayerXM.XNEfficiency = PlayerXM.XMEfficiency/ 1.5;
    }
});



// file: items/baubles/other.js

IDRegistry.genItemID("chargingMedal");
Item.createItem("chargingMedal","Charging Medal", {name: "charging_medal", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.chargingMedal, count:1, data:0}, [
         " x ",
         "x x",
         "xzx"
    ], ['z',ItemID.starPiece,0,'x',287,0]);
});


Baubles.registerBauble({
    id: ItemID.chargingMedal,
    type: "amulet",

    tick: function () {
        if(World.getThreadTime()%10==0){
            var item = Player.getCarriedItem(true);
            if((item.data<Item.getMaxDamage(item.id)) && XMItems.items[item.id] && item.data){
                var recoverCost = 0.01;
                if(PlayerXM.getXMFromPlayer(recoverCost)){
                    item.data-=1*PlayerXM.XMEfficiency;
                    Player.setCarriedItem(item.id, item.count, item.data, item.enchant);
                }
            }
        }
    }
});

IDRegistry.genItemID("collectingRobe");
Item.createItem("collectingRobe","Collecting Robe", {name: "collectingRode", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.collectingRobe, count:1, data:0}, [
         "xxx",
         "xzx",
         "xxx"
    ], ['z',299,0,'x',ItemID.starIngotTier2,0]);
});
Baubles.registerBauble({
    id: ItemID.collectingRobe,
    type: "body",   
    onEquip: function () {PlayerXM.shieldLevel = PlayerXM.shieldLevel*.8},
    onTakeOff: function () {PlayerXM.shieldLevel = PlayerXM.shieldLevel/.8},

    tick: function () {
        if(this.checkCoords()){
            var current = PlayerXM.playerXM.current;
            var max =  PlayerXM.playerXM.max;
            if(current<(max*.9)){
                PlayerXM.focusXM(.0025*PlayerXM.XMEfficiency);
                this.createParticle();
                //alert(current);
            }
        }
        if(World.getThreadTime()%100==0){
            Debug.m(PlayerXM.playerXM.current + " " +PlayerXM.playerXM.max);
        }
    },
    lastCoords:{},
    checkCoords:function(){ 
        var correct = false;
        if(Entity.getSneaking(Player.get())){
            var coords = Player.getPosition();
            var lastCoords = this.lastCoords;
            if(lastCoords.x==coords.x&&lastCoords.y==coords.y&&lastCoords.z==coords.z){correct = true;}
            lastCoords.x = coords.x;
            lastCoords.y = coords.y;
            lastCoords.z = coords.z;
        }
        return correct;
    },
    createParticle:function(){    
        var radius = 10;
        var vx = (Math.random()-0.5)*radius;
        var vy = (Math.random()-0.5)*radius;
        var vz = (Math.random()-0.5)*radius;
        var coords = Player.getPosition();
        coords.y--;
        coords.x-=.5;
        coords.z-=.5;
        if(coords.y+.5+vy>coords.y){
            playerEmitter.emit(XMparticle, 0 ,coords.x+vx, coords.y+vy, coords.z+vz, -vx/20, -vy/20, -vz/20);        
        }
    }
});



// file: items/abilityActivators.js

IDRegistry.genItemID("XMunlocker");
Item.createItem("XMunlocker","XM Unlocker Activator", {name: "XMunlocker", meta: 0}, {stack:1});
Item.setMaxDamage(ItemID.XMunlocker, 21);
XMItems.registerXMItem(ItemID.XMunlocker);
Item.registerNoTargetUseFunction("XMunlocker",function(coords,item,block){
    item = Player.getCarriedItem();
    if(item.data<=0){
        BodyModeManager.activateMode(XMunlocker);
        Player.setCarriedItem(item.id,1,20);
    }
});

IDRegistry.genItemID("trebla");
Item.createItem("trebla","Trebla ", {name: "trebla", meta: 0}, {stack:1});
Item.setMaxDamage(ItemID.trebla, 21);
XMItems.registerXMItem(ItemID.trebla);
Item.registerNoTargetUseFunction("trebla", function (coords, item, block) {
    item = Player.getCarriedItem();
    if(item.data<=0){
        var Pcoords = Player.getPosition();
        var view = Entity.getLookVector(Player.get());
        var trebla = new TreblaAnimation(Pcoords.x+view.x, Pcoords.y+view.y, Pcoords.z+view.z);
        Updatable.addUpdatable(trebla);
        Player.setCarriedItem(item.id,1,20);
    }
});




// file: items/tool/darkSword.js

IDRegistry.genItemID("swordDark");
Item.createItem("swordDark", "Dark Sword", {name: "swordsDark", meta: 0}, {stack:1});
Recipes.addShaped({id: ItemID.swordDark, count: 1, data: 0}, [
     "x",
     "x",
     "z"
], ['x',ItemID.darkIngot,0,"z",280,0]);
Item.setToolRender(ItemID.swordDark, true);
Item.setMaxDamage(ItemID.swordDark, 30);
Item.registerNoTargetUseFunction("swordDark", function (coords, item, block) {
    item = Player.getCarriedItem();
    if(item.data<20){
        var Pcoords = Player.getPosition();
        var view = Entity.getLookVector(Player.get());
        var trebla = new TreblaAnimation(Pcoords.x+view.x, Pcoords.y+view.y, Pcoords.z+view.z);
        Updatable.addUpdatable(trebla);
        ToolAPI.breakCarriedTool(20);
    }
});



// file: blocks/res/ore.js

var OreGenerator = {
    star: {
        enabled: __config__.getBool("star_ore.enabled"),
        count: __config__.getNumber("star_ore.count"),
        size: __config__.getNumber("star_ore.size"),
        minHeight: __config__.getNumber("star_ore.minHeight"),
        maxHeight: __config__.getNumber("star_ore.maxHeight")
    },
    addFlag: function(name, flag){
        if(OreGenerator[name].enabled){
            OreGenerator[name].enabled = !Flags.addFlag(flag);
        }
    }
};
OreGenerator.addFlag("star", "oreGenStar");

IDRegistry.genBlockID("starOre");
Block.createBlock("starOre", [
{name: "Star Ore", texture: [["starOre", 0]],inCreative:true}
], "opaque");
ToolAPI.registerBlockMaterial(BlockID.starOre, "stone", 3, true);
Block.setDestroyTime(BlockID.starOre, 3);
Block.setDestroyLevel("starOre", 2);

Block.registerDropFunction("starOre", function(coords, id, data, diggingLevel, toolLevel){
    alert("dropped");
    return [[ItemID.starPiece, Math.round(Math.random()*2), data]];
});

Callback.addCallback("PostLoaded", function(){
    if(OreGenerator.star.enabled){
        Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ){
            for(var i = 0; i < OreGenerator.star.count; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, OreGenerator.star.minHeight, OreGenerator.star.maxHeight);
                GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.starOre, 0, OreGenerator.star.size);
            }
        });
        Callback.addCallback("GenerateChunk", function(chunkX, chunkZ){
            for(var i = 0; i < OreGenerator.star.count; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, OreGenerator.star.minHeight, OreGenerator.star.maxHeight);
                GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.starOre, 0, OreGenerator.star.size);
            }
        });
    }
});



// file: blocks/res/crops.js

//IMPORT("Plant_Model");
//IMPORT("Harvest_Core");

/*
CropRegistry.registerClass("thaumcraft_forest_crop");
CropRegistry.registerClassConfig("thaumcraft_forest_crop",{
    farmland:[{id:60,data:0},{id:2,data:0},{id:3,data:0},{id:60,data:7}],
    seedsPlaceFunc:true
});
CropRegistry.registerClassDeriveFunction("thaumcraft_forest_crop",function(classs,id){
    Block.setDestroyLevelForID (id, 0);
    Block.setDestroyTime (id,0); 
    ToolAPI.registerBlockMaterial(id, "plant");
    Harvest.registerDroppingBlock(id);
    Callback.addCallback("ItemUse", function(coords, item, block){
        if(block.id==id){
            Harvest.drop(CropRegistry.getSeedFromCrop(id),1,coords);
            World.setBlock(coords.x,coords.y,coords.z,0,0);
        }
    });
    Block.registerDropFunction(id, function(coords, blockID, blockData, level){
        return[[ CropRegistry.getSeedFromCrop(id), 1,0 ]];
    });
});


CropRegistry.registerClass("thaumcraft_tropical_crop");
CropRegistry.registerClassConfig("thaumcraft_tropical_crop",{
    farmland:[{id:60,data:0},{id:2,data:0},{id:3,data:0},{id:60,data:7},{id:12,data:0}],
    seedsPlaceFunc:true
});
CropRegistry.registerClassDeriveFunction("thaumcraft_tropical_crop",function(classs,id){
    Block.setDestroyLevelForID (id, 0);
    Block.setDestroyTime (id,0); 
    ToolAPI.registerBlockMaterial(id, "plant");
    Harvest.registerDroppingBlock(id);
    Callback.addCallback("ItemUse", function(coords, item, block){
        if(block.id==id){
            Harvest.drop(CropRegistry.getSeedFromCrop(id),1,coords);
            World.setBlock(coords.x,coords.y,coords.z,0,0);
        }
    }); 
    Block.registerDropFunction(id, function(coords, blockID, blockData, level){
        return[[ CropRegistry.getSeedFromCrop(id), 1,0 ]];
    }); 
});



CropRegistry.registerClass("thaumcraft_treeSapling");
CropRegistry.registerClassConfig("thaumcraft_treeSapling",{
    ageSpeed:0,
    manure:{id:351,data:15},
    farmland:[{id:60,data:0},{id:2,data:0},{id:3,data:0},{id:60,data:7}],
    seedsPlaceFunc:true
});
CropRegistry.registerClassDeriveFunction("thaumcraft_treeSapling",function(classs,idd){
    Recipes.addFurnaceFuel(CropRegistry.getSeedFromCrop(idd), 0, 140);
    var cfg = CropRegistry.getConfigFromCrop(idd);
    PlantModel.tree(idd,0);
    Block.setDestroyLevelForID (idd, 0);
    Block.setDestroyTime (idd,0); 
    ToolAPI.registerBlockMaterial(idd, "plant");
    Harvest.registerDroppingBlock(idd);
    Block.setRandomTickCallback(idd,function(x,y,z,id,data){
        var chance = cfg.ageSpeed;
        if(Math.random()<chance){
            TreeRegistry.deployTree(x,y,z,TreeRegistry.getTreeFromSaplingBlock(idd));
        }
    });
    Callback.addCallback("ItemUse",function(coords,item,block){
        var manure = cfg.manure;
        var chance = 0;
        if(item.id==manure.id&&item.data==manure.data&&block.id==idd){
            if(Math.random()<chance){
                TreeRegistry.deployTree(coords.x,coords.y,coords.z,TreeRegistry.getTreeFromSaplingBlock(idd));
            }
            if(particles){
                for(var i = 0;i<particles;i++){
                    Particles.addParticle(Native.ParticleType.happyVillager, coords.x+Math.random()*.8,coords.y+Math.random()*.8,coords.z+Math.random()*.8,0,0,0,0)
                }
            }
            Player.decreaseCarriedItem(1);
        }
    });
    Block.registerDropFunction(idd, function(coords, blockID, blockData, level){
        return[[ CropRegistry.getSeedFromCrop(idd), 1,0 ]];
    });
    
});

IDRegistry.genItemID("cinderpearl");
Item.createItem("cinderpearl","Cindlepearl", {name: "cinderpearl", meta: 0}, {});

IDRegistry.genBlockID("cinderpearl"); 
Block.createBlock("cinderpearl", [
    {name: "Cindlepearl", texture: [["empty", 0],["empty", 0],["cinderpearl", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.cinderpearl,0);
CropRegistry.deriveCropAsClass("thaumcraft_tropical_crop",{
    id:BlockID.cinderpearl,
    drop:0,
    seed:ItemID.cinderpearl
});

IDRegistry.genItemID("manashroom");
Item.createItem("manashroom","Manashroom", {name: "manashroom", meta: 0}, {});

IDRegistry.genBlockID("manashroom"); 
Block.createBlock("manashroom", [
    {name: "manashroom", texture: [["empty", 0],["empty", 0],["manashroom", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.manashroom,0);
CropRegistry.deriveCropAsClass("thaumcraft_forest_crop",{
    id:BlockID.manashroom,
    drop:0,
    seed:ItemID.manashroom
});

IDRegistry.genItemID("manashroom");
Item.createItem("manashroom","Manashroom", {name: "manashroom", meta: 0}, {});

IDRegistry.genBlockID("manashroom"); 
Block.createBlock("manashroom", [
    {name: "manashroom", texture: [["empty", 0],["empty", 0],["manashroom", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.manashroom,0);
CropRegistry.deriveCropAsClass("thaumcraft_forest_crop",{
    id:BlockID.manashroom,
    drop:0,
    seed:ItemID.manashroom
});


IDRegistry.genItemID("greatwoodsapling");
Item.createItem("greatwoodsapling","Greatwood Sapling", {name: "greatwoodsapling", meta: 0}, {});

IDRegistry.genBlockID("greatwoodsapling"); 
Block.createBlock("greatwoodsapling", [
    {name: "greatwoodsapling", texture: [["empty", 0],["empty", 0],["greatwoodsapling", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.greatwoodsapling,0);
CropRegistry.deriveCropAsClass("thaumcraft_treeSapling",{
    id:BlockID.greatwoodsapling,
    drop:0,
    seed:ItemID.greatwoodsapling
});


IDRegistry.genItemID("silverwoodsapling");
Item.createItem("silverwoodsapling","Silverwood Sapling", {name: "silverwoodsapling", meta: 0}, {});

IDRegistry.genBlockID("silverwoodsapling"); 
Block.createBlock("silverwoodsapling", [
    {name: "silverwoodsapling", texture: [["empty", 0],["empty", 0],["silverwoodsapling", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.silverwoodsapling,0);
CropRegistry.deriveCropAsClass("thaumcraft_treeSapling",{
    id:BlockID.silverwoodsapling,
    drop:0,
    seed:ItemID.silverwoodsapling
});
*/



// file: blocks/generator/XMCollector.js

IDRegistry.genBlockID("XMCollector");
Block.createBlock("XMCollector", [
{name: "XM Collector", texture: [["XMCollector", 0]],inCreative:true}
], "opaque");
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:BlockID.XMCollector, count: 1, data:0}, [
         "qeq",
         "awa",
         "qeq"
    ], ['q',17,-1,'w', ItemID.simplStarFocus,0,'a',BlockID.starBlock,0,'e',ItemID.starPiece,0]);
});
Block.registerPlaceFunction("XMCollector",function(coords,item,block){ 
    World.setBlock(coords.relative.x,coords.relative.y,coords.relative.z,BlockID.XMCollector,0);
    World.addTileEntity(coords.relative.x,coords.relative.y,coords.relative.z);
    var extra = item.extra;
    if(extra){
        var TE = World.getTileEntity(coords.relative.x,coords.relative.y,coords.relative.z);
        TE.data.XM = extra.getInt("XM");
    }
});
Block.registerDropFunction("XMCollector",function(){return [[0,0,0]]});

TileEntity.registerPrototype(BlockID.XMCollector, {
    defaultValues:{
        XM:0,
        limitXM:100
    },
    destroyBlock: function(coords, player){
        var drop = World.getBlockID(coords.x,coords.y,coords.z);
        var extra;
        if(this.data.XM > 0){
            extra = new ItemExtraData();
            extra.putInt("XM", this.data.XM);
        }
        nativeDropItem(coords.x, coords.y, coords.z, 0, drop, 1, 0, extra);
    },
    energyTick: function(type, src) {
        if(WorldXM.getXMStatusFromChunk(this.x, this.z)){
            this.createParticle();
        }
        if(World.getThreadTime()%20==0){
            if(WorldXM.requireXMFromChunk(this.x,this.z,1)){
                src.add(1);
                this.data.XM += src.get(1);
                 if(this.data.XM>=this.data.limitXM){
                    this.bang();
                }               
            }           
        }       
    },
    bang:function(){
        World.setBlock(this.x, this.y, this.z, BlockID.starIngotBlock,0);
        World.removeTileEntity(this.x, this.y, this.z);
    },
    createParticle:function(){    
        var radius = 20;
        var vx = (Math.random()-0.5)*radius;
        var vy = (Math.random()-0.5)*radius;
        var vz = (Math.random()-0.5)*radius;
        
        if(this.y+.5+vy>this.y){
            Particles.addFarParticle(XMparticle, this.x+.5+vx, this.y+.5+vy, this.z+.5+vz, -vx/20, -vy/20, -vz/20,0);        
        }
    } 
});
ICRender.getGroup("XM-wire").add(BlockID.XMCollector, -1);
EnergyTileRegistry.addEnergyTypeForId(BlockID.XMCollector, XM);



// file: blocks/generator/generator.js

IDRegistry.genBlockID("generator");
Block.createBlock("generator", [
    {name: "Nature Generator", texture: [["generator", 3], ["generator", 3], ["generator", 2]], inCreative: true}
], "opaque");
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:BlockID.generator, count:1, data: 0}, [
     "qwq",
     "wew",
     "qwq"
], ['q',265,0,'w',BlockID.starBlock,0,'e',BlockID.starIngotBlock,0]);;
});

TileEntity.registerPrototype(BlockID.generator, {
    defaultValues:{
        remainingTime:0
    },
    addParticle:function(){
        var range = 1;
        var vx = (Math.random()-0.5)*range;
        var vy = Math.random();
        var vz = (Math.random()-0.5)*range;
        
        Particles.addFarParticle(XMBlueParticle, this.x+.5, this.y+.5, this.z+.5, vx ,vy, vz,0);        
    
    },
    tick:function(){
        if(this.data.remainingTime){
            this.data.remainingTime--;
            this.addParticle();
        }
        
    }
});

Block.setRandomTickCallback(BlockID.generator, function(x, y, z, id, data) {
    var block1 = World.getBlockID(x-1,y,z);
    var block2 = World.getBlockID(x+1,y,z);
    var block3 = World.getBlockID(x,y,z+1);
    var block4 = World.getBlockID(x,y,z-1);
    if(block1==6){
        var TE = World.getTileEntity(x,y,z);
        TE.data.remainingTime+=200;
        World.setBlock(x-1,y,z,32,0);
        WorldXM.addXMToChunk(x,z,1);
    }
    if(block2==6){
        var TE = World.getTileEntity(x,y,z);
        TE.data.remainingTime+=200;
        World.setBlock(x+1,y,z,32,0);
        WorldXM.addXMToChunk(x,z,1);
    }
    if(block3==6){
        var TE = World.getTileEntity(x,y,z);
        TE.data.remainingTime+=200;
        World.setBlock(x,y,z+1,32,0);
        WorldXM.addXMToChunk(x,z,1);
    }
    if(block4==6){
        var TE = World.getTileEntity(x,y,z);
        TE.data.remainingTime+=200;
        World.setBlock(x,y,z-1,32,0);
        WorldXM.addXMToChunk(x,z,1);
    }
});


ICRender.getGroup("XM-wire").add(BlockID.generator, -1);
EnergyTileRegistry.addEnergyTypeForId(BlockID.generator, XM);



// file: blocks/generator/EUtoXMconverter.js

if(modsAPI.ICore){
    IDRegistry.genBlockID("EUtoXMconverter");
    Block.createBlock("EUtoXMconverter", [
    {name: "EU To XM Converter", texture: [["EUtoXMconverter",0 ]], inCreative: true}
    ], "opaque");

    TileEntity.registerPrototype(BlockID.EUtoXMconverter, {
        defaultValues: {
            XM:0,
            EU:0,
            storageXM:100,
            StorageEU:1000000
        },
        energyTick: function(type, src) {
            if(type=="Eu"){
                var output = Math.min(32, this.data.EU);
                this.data.EU += src.add(output) - output;
            }
            if(type=="XM"){
                if(Math.round(this.data.XM)<this.data.storageXM){
                    this.data.XM += src.getAll(1);
                }
                var produce = 100000;
                if(this.data.EU+produce<this.data.StorageEU&&this.data.XM>1){
                    this.data.EU+=produce;
                    this.data.XM--;
                }
            }        
        },
    });
    ICRender.getGroup("XM-wire").add(BlockID.EUtoXMconverter, -1);
    ICRender.getGroup("ic-wire").add(BlockID.EUtoXMconverter, -1);
    EnergyTileRegistry.addEnergyTypeForId(BlockID.EUtoXMconverter, XM);
    EnergyTileRegistry.addEnergyTypeForId(BlockID.EUtoXMconverter, EU);
}




// file: blocks/processing/charger.js

IDRegistry.genBlockID("charger");
Block.createBlock("charger", [
{name: "XM Charger", texture: [["charger", 1], ["charger",1],["charger", 0]], inCreative: true}
], "opaque");

TileEntity.registerPrototype(BlockID.charger, {
    defaultValues: {
        step: Math.PI/24,
        defRadius:2,
        minRad:.1,
        radius:2,
        maxY:1.5,
        minYcos:.1,
        currentParticlePIPos:0,
        emitter:null,
        speed:0.01,
        progress:0,
        XM:0,
        particle: XMSmallMachineParticle,
        connecterAssembler:null
    },
    
    setDefault:function(){
        this.data = {
            step: Math.PI/24,
            defRadius:2,
            minRad:.1,
            radius:2,
            maxY:1.5,
            minYcos:.1,
            currentParticlePIPos:0,
            emitter:null,
            speed:0.01,
            progress:0,
            particle: XMSmallMachineParticle,
            XM:0
        };
        this.data.emitter = Particles.ParticleEmitter(this.x, this.y, this.z); 
    },
    
    init:function(){
        this.data.emitter = Particles.ParticleEmitter(this.x, this.y, this.z); 
    },
    getAssembler:function(){
        if(this.data.connecterAssembler){
            var TE = World.getTileEntity(this.data.connecterAssembler.x, this.data.connecterAssembler.y, this.data.connecterAssembler.z);
            if(TE){
                return TE
            }
        }
        return null;
    },
    tick: function () {
        var parVel = {x:0, y:0, z:0};
        var particle = XMSmallMachineParticle;
        
       this.data.particle = XMSmallMachineParticle;
        
        
        if(this.data.progress<=this.data.XM/10){
            this.data.progress+=this.data.speed;
            this.data.radius = (this.data.defRadius*Math.abs(1-this.data.progress))+this.data.minRad;
            
        }else{
            this.data.progress-=this.data.speed;
            this.data.radius = (this.data.defRadius*Math.abs(1-this.data.progress))+this.data.minRad;
        }
         if(this.data.XM){
             var TE = this.getAssembler();
             if(TE){
                if(TE.data.recipeCost&&this.data.progress>=.9){
                    this.data.particle = XMmachineParticle;
                    if(World.getThreadTime()%20==0){
                        
                        TE.addXM(1);
                        this.data.XM--;
                    }
                    var vel = TE.getParticleVelocity(this.data.emitter);
                    parVel = {
                        x:vel.x/20,
                        y:vel.y/20,
                        z:vel.z/20
                    };
                }
             }
            var emitter = this.data.emitter;
            
            var pCoords = this.getParticleCoords(0);
            var p2Coords = this.getParticleCoords(Math.PI);
            
            this.data.currentParticlePIPos+=this.data.step;
            emitter.emit(this.data.particle, 0, emitter.getPosition().x+.5+pCoords.x,  emitter.getPosition().y+this.data.progress*this.data.maxY+pCoords.y,  emitter.getPosition().z+.5+pCoords.z,parVel.x,parVel.y,parVel.z);
            emitter.emit(this.data.particle, 0, emitter.getPosition().x+.5+p2Coords.x, emitter.getPosition().y+this.data.progress*this.data.maxY+p2Coords.y, emitter.getPosition().z+.5+p2Coords.z,parVel.x,parVel.y,parVel.z);       

         }
        //this.data.XM = Math.round(this.data.XM);
    },
    energyTick: function(type, src) {
        if(this.data.XM<10){
             this.data.XM+=src.getAll(1);
        }
    },
    
    getParticleCoords:function(addStep){
        var pos = this.data.currentParticlePIPos+addStep;// example  PI/3, PI/2, 2PI ...
        var x = Math.cos(pos)*this.data.radius;
        var y = Math.cos(pos)*(1-this.data.progress+this.data.minYcos);
        var z = Math.sin(pos)*this.data.radius;
        return {x:x,y:y, z:z} 
    },
    alertPos:function(pos){
        Debug.m("cos(x) "+pos.x+" sin(z) "+pos.z);
    }
});

ICRender.getGroup("XM-wire").add(BlockID.charger, -1);
EnergyTileRegistry.addEnergyTypeForId(BlockID.charger, XM);



// file: blocks/processing/assembler.js

IDRegistry.genBlockID("assembler");
Block.createBlock("assembler", [
{name: "SM Item Assembler", texture: [["assembler",1 ], ["assembler", 1],["assembler", 0]], inCreative: true}
], "opaque");

AssmblerRecipe.registerRecipe(ItemID.starIngot,ItemID.starIngotTier2, 10);
AssmblerRecipe.registerRecipe(ItemID.starIngotBlock,ItemID.starIngotBlockTier2, 80);
TileEntity.registerPrototype(BlockID.assembler, {
    defaultValues: {
        item:null,
        connectedChargers:[],
        progress:0,
        recipeCost:0,
        XM:0
    },
    init:function(){
        this.updateItemAnimation();
    },
    destroy:function(){
        if(this.animation1){
            this.animation1.destroy();
        }
        if(this.data.item){
            World.drop(this.x+.5,this.y+1,this.z+.5,this.data.item.id,1,this.data.item.data);
        }
    },
    updateItemAnimation:function(){
        if(this.data.item){
           var item = this.data.item;
           if(this.animation1){
                this.animation1.destroy();
           }
           this.animation1 = new Animation.Item(this.x+.5 , this.y+1, this.z+.5);
           var rot = [0,deg2rad(90),deg2rad(90)];
            this.animation1.describeItem({
                id: item.id,
                count: 1,
                data: item.data,
                rotation: rot,
                size: .5
            });
           this.animation1.load();
        }else if(this.animation1){
            this.animation1.destroy();
        }
    },
    addXM:function(amount){
        this.data.XM+=amount;
    },
    updateRecipe:function(){
        if(this.data.item){
            var output =  AssmblerRecipe.getOutputFrom(this.data.item.id);
            this.data.recipeCost = AssmblerRecipe.getCostFromRecipe(this.data.item.id);
            if(output&&this.data.XM>=this.data.recipeCost){
                this.data.item.id = output;
                this.data.item.data = 0;
                this.data.XM = 0;
                this.updateItemAnimation();
            }
           
        }else{
            this.data.recipeCost = 0;
            this.data.XM = 0;
        }
        //Debug.m("updating recipe   cost "+this.data.recipeCost+" output "+output+" XM "+this.data.XM);
    },
    click:function(id, count, data, coords){
        if(!this.data.item && id && id>256 && id<8192 && !Entity.getSneaking(Player.get())){
            Player.decreaseCarriedItem(1);
            this.data.item = {id:id,data:data};
            Game.prevent();
            this.updateRecipe();
        }else if(!id && this.data.item){
            World.drop(this.x+.5,this.y+1,this.z+.5,this.data.item.id,1,this.data.item.data);
            this.data.item = null;
            this.updateRecipe();
        }
        this.updateItemAnimation();
    },
    getParticleVelocity:function(Particlesystem){
        var mv = this.getMoveVector(Particlesystem); 
        var dis = Math.sqrt(mv.x*mv.x+mv.y*mv.y+mv.z*mv.z); 
        var vel = {};
        if(dis > 1){ 
            vel.x = mv.x;//\/dis;
            vel.y = mv.y;//\/dis;
            vel.z = mv.z;//\/dis;
        } 
        else {
            vel.x = mv.x;//\*dis;
            vel.y = mv.y;//\*dis;
            vel.z = mv.z;//\*dis;
        }
        return vel;
    },
    getMoveVector:function(Particlesystem){
        var parPos = Particlesystem.getPosition();
        var vecX = this.x - parPos.x;
        var vecY = this.y-.5 - parPos.y;
        var vecZ = this.z - parPos.z;
        return {x:vecX, y:vecY, z:vecZ}
    },
    tick: function () {
        if(World.getThreadTime()%20==0){
            this.updateRecipe();
            this.updateItemAnimation();
            
        }
    }
});



// file: blocks/processing/transformer.js

IDRegistry.genBlockID("transformer");
Block.createBlock("transformer", [
{name: "Transfromer", texture: [["transformer",0 ]], inCreative: true}
], "opaque");

TransformerRecipe.registerRecpe(ItemID.starIngotTier2, {
    time:{
        night:ItemID.darkIngot,
        day:ItemID.grassIngot
    }
},50,ItemID.simpleLens);
var bbb = BlockID.starBlock
TransformerRecipe.registerRecpe(265, {
    catalys:{
        bbb:ItemID.starIngot
    }
},10,ItemID.simpleLens);

TileEntity.registerPrototype(BlockID.transformer, {
    defaultValues: {
        XM:0,
        progress:0,
        storage:100,
        lens:null,
        item:null,
        
        emitter:null,
        radius:3,
        fullRadius:3,
        count:6,
        absAlpha:0,
        partCount:100,
        c:0,
        activeAnimation:false
    },
    
    tick: function () {
        var item = this.data.item;
        var lens = this.data.lens;
        if(item&&lens){
            var env = this.getEnv();
            var output = TransformerRecipe.getOutputFromEnvironment(item.id,env.time, env.catatlys,lens.id);
            var curXM = Math.round(this.data.XM);
            if(output.length){
                var recipeCost = TransformerRecipe.getCost(item.id);

                if(recipeCost>this.data.progress && curXM){
                    this.data.progress++
                    this.data.XM--;
                }else if(recipeCost<=this.data.progress){
                    this.data.item.id = output[randomInt(0,output.length-1)];
                    this.data.progress = 0;
                }
                this.data.activeAnimation = true;
                this.data.partCount = recipeCost;
            }else{this.data.activeAnimation = false;this.data.progress=0}
        }
        this.updateItemAnimation();
        this.particlesAnimation();
        //this.debugValues();
    },
    
    destroy:function(){
        if(this.animation1){
            this.animation1.destroy();
        }

        if(this.data.lens){
            World.drop(this.x+.5,this.y+1,this.z+.5,this.data.lens.id,1,this.data.lens.data);
            this.data.lens = null;
        }
        if(this.data.item) this.dropItem();
    },
    init:function(){
        this.updateLensAnimation();
        this.data.emitter = Particles.ParticleEmitter(this.x+.5, this.y+.5, this.z+.5);
    },
    click:function(id, count, data, coords){
        if(id){
            
            if(lenses[id]){
                if(!this.data.lens){
                    this.data.lens = {id:id, data:data}
                }else{
                    World.drop(this.x+.5,this.y+1,this.z+.5,this.data.lens.id,1,this.data.lens.data);
                    this.data.lens = {id:id, data:data};
                }
                Player.decreaseCarriedItem(1);
                this.updateLensAnimation();
            }else if(!this.data.item){
                var angle = Entity.getLookAngle(Player.get());
                this.data.item = {id:id, data:data,rx: 0, ry: angle.yaw+Math.PI, rz: 0, y: 0};
            }else this.dropItem();
        }else this.dropItem();
    },
    dropItem: function(){
        if(this.data.animation2) this.data.animation2.destroy();
        
        if(this.data.item) World.drop(this.x+0.5, this.y+1.25, this.z, this.data.item.id, 1, this.data.item.data);
       
        this.data.item = null;
        this.data.animation2 = null;
    },
    updateItemAnimation:function(){
        if(this.data.item){
            if(this.data.animation2){
                this.data.animation2.destroy();
            }
            this.data.animation2 = new Animation.Item(this.x+0.5, this.y+1.25, this.z+0.5);
            this.data.item.y = this.data.item.y > 1 ? 0 : this.data.item.y+0.005;
            var sy = (Math.sin(this.data.item.y*Math.PI*2)+1)/16;
            var angle = Entity.getLookAngle(Player.get());
            var item = this.data.item;
            this.data.animation2.describeItem({
                id: item.id,
                count: 1,
                data: item.data,
                
                size: 0.5,
                rotation: [0,angle.yaw+Math.PI,0],
                notRandomize: true
            });
            this.data.animation2.load();
        }else if(this.animation2){
            this.animation2.destroy();
            this.animation2 = null;
        }
    },
    
    updateLensAnimation:function(){
        if(this.data.lens){
           var lens = this.data.lens;
           if(this.animation1){
                this.animation1.destroy();
           }
           this.animation1 = new Animation.Item(this.x+.5 , this.y+1, this.z+.5);
           var rot = [0,deg2rad(90),deg2rad(90)];
            this.animation1.describeItem({
                id: lens.id,
                count: 1,
                data: lens.data,
                rotation: rot,
                size: 1
            });
           this.animation1.load();
        }else if(this.animation1){
            this.animation1.destroy();
        }
    },
    
    particlesAnimation:function(){
        if(this.data.progress < this.data.partCount&&this.data.activeAnimation){
            for(var i = 0; i < this.data.count; i++){
                var a = (i / this.data.count) * Math.PI *2; // текущий угол
                var sx = Math.sin(a + this.data.absAlpha) * this.data.radius;
                var sy = Math.cos(a + this.data.absAlpha) * this.data.radius;
                // ебош партиклу
                var emitter = this.data.emitter;
                emitter.emit(XMparticle, 0, emitter.getPosition().x+sx, emitter.getPosition().y+1, emitter.getPosition().z+sy,0,0,0);       
            }
             this.data.absAlpha-=.02;
             this.data.radius =  this.data.fullRadius -  this.data.progress /  this.data.partCount *  this.data.fullRadius;
        }
    },
     
     debugValues:function(){
         if(World.getThreadTime()%100==0){
            alert("XM  "+this.data.XM+"  progress "+this.data.progress+" activeAnimation "+this.data.activeAnimation);
            //Debug.m(Entity.getLookVector(Player.get()));
         }
     },
    
    getEnv:function(){
        var env = {
            time:"night",
            catalys:0
        };
        env.catalys = World.getBlockID(this.x, this.y - 1, this.z);
        if(World.getLightLevel(this.x, this.y + 1, this.z) == 15) env.time = "day";

        return env;
    },

    
    energyTick: function(type, src){
        if(this.data.XM<this.data.storage){
            this.data.XM = src.getAll(1);
        }
        if(World.getThreadTime()%100==0&&Math.round(this.data.XM)){
            this.data.XM--;
        }
    }
});
ICRender.getGroup("XM-wire").add(BlockID.transformer, -1);
EnergyTileRegistry.addEnergyTypeForId(BlockID.transformer, XM);



// file: blocks/processing/furnace.js

IDRegistry.genBlockID("starFurnace");
Block.createBlockWithRotation("starFurnace", [
    {name: "Star Furnace", texture: [["starFurnace", 0], ["starFurnace", 0], ["starFurnace", 0], ["starFurnace", 1], ["starFurnace", 0], ["starFurnace", 0]], inCreative: true}
], "opaque");
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:BlockID.starFurnace, count:1, data: 0}, [
     "qwq",
     "wew",
     "qwq"
], ['q',265,0,'w',BlockID.starBlock,0,'e',BlockID.starIngotBlock,0]);;
});

var guiElectricFurnace = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Star Furnace"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
        {type: "bitmap", x: 500, y: 100, bitmap: "starScaleOver", scale: 10}
    ],
    
    elements: {
        "progressScale": {type: "scale", x: 500, y: 100, direction: 0, value: 0.5, bitmap: "starScale", scale: 10},
        "slotSource": {type: "slot", x: 400, y: 250,size:100},
        "slotResult": {type: "slot", x: 800, y: 250,size:100}
    }
});

TileEntity.registerPrototype(BlockID.starFurnace, {
    defaultValues: {
        progress:0,
        work_time:20,
        XM:0
    },
    
    getGuiScreen: function () {
        return guiElectricFurnace;
    },
    energyTick: function(type, src){
        var sourceSlot = this.container.getSlot("slotSource");
        var resultSlot = this.container.getSlot("slotResult");
        var result = Recipes.getFurnaceRecipeResult(sourceSlot.id, "iron");
        
        if(result && (resultSlot.id == result.id && resultSlot.data == result.data && resultSlot.count < 64 || resultSlot.id == 0)){
            
            if(this.data.XM >= 1){
                this.data.progress += 1/this.data.work_time;
                //work
            }else{
                
                this.data.XM = src.getAll(1);
            }
            if(this.data.progress >= 1){
                sourceSlot.count--;
                resultSlot.id = result.id;
                resultSlot.data = result.data;
                resultSlot.count++;
                this.container.validateAll();
                this.data.progress = 0;
                this.data.XM=0;
            }
        }
        else {
            this.data.progress = 0;
        }
        this.container.setScale("progressScale", this.data.progress);
    },
});
ICRender.getGroup("XM-wire").add(BlockID.starFurnace, -1);
EnergyTileRegistry.addEnergyTypeForId(BlockID.starFurnace, XM);



// file: blocks/wire.js

function setupWireRender(id, width, groupName, preventSelfAdd) {
    var render = new ICRender.Model();
    BlockRenderer.setStaticICRender(id, 0, render);
   
    var boxes = [
        {side: [1, 0, 0], box: [0.5 + width / 2, 0.5 - width / 2, 0.5 - width / 2, 1, 0.5 + width / 2, 0.5 + width / 2]},
        {side: [-1, 0, 0], box: [0, 0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2]},
        {side: [0, 1, 0], box: [0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2, 1, 0.5 + width / 2]},
        {side: [0, -1, 0], box: [0.5 - width / 2, 0, 0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2]},
        {side: [0, 0, 1], box: [0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, 1]},
        {side: [0, 0, -1], box: [0.5 - width / 2, 0.5 - width / 2, 0, 0.5 + width / 2, 0.5 + width / 2, 0.5 - width / 2]},
    ]
   
    var group = ICRender.getGroup(groupName);
    if (!preventSelfAdd) {
        group.add(id, -1);
    }
   
    for (var i in boxes) {
        var box = boxes[i];
       
        var model = BlockRenderer.createModel();
        model.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5], id, 0);
       
        render.addEntry(model).asCondition(box.side[0], box.side[1], box.side[2], group, 0);
    }
   
    var model = BlockRenderer.createModel();
    model.addBox(0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, id, 0);
    render.addEntry(model);
    
    width = Math.max(width, 0.5);
    Block.setBlockShape(id, {x: 0.5 - width/2, y: 0.5 - width/2, z: 0.5 - width/2}, {x: 0.5 + width/2, y: 0.5 + width/2, z: 0.5 + width/2});
}

IDRegistry.genBlockID("starWire");
Block.createBlock("starWire", [
{name: "Star Wire", texture: [["starWire", 0]], inCreative: true} 
], XM.getWireSpecialType());
Callback.addCallback("PostLoaded", function(){
  Recipes.addShaped({id:BlockID.starWire, count:1, data: 0}, [
     "zez"
    ], ['z',ItemID.starPiece,0,'e',ItemID.starIngot,0]);
});

setupWireRender(BlockID.starWire, 1/4, "XM-wire");
ICRender.getGroup("XM-wire").add(BlockID.starWire, -1);
XM.registerWire(BlockID.starWire);



// file: blocks/transmitter.js

IDRegistry.genBlockID("transmitter");
Block.createBlock("transmitter", [
    {name: "Transmitter", texture: [["transmitter",0 ]], inCreative: true},
    {name: "Transmitter", texture: [["transmitter",1 ]], inCreative: false}
], "opaque");
Block.registerPlaceFunction("transmitter",function(coords, item, block){
    Game.prevent();
    if(item.id==BlockID.transmitter&&Entity.getSneaking(Player.get())){ 
        var extra = new ItemExtraData();
        if(block.id==BlockID.transmitter){
            extra.putInt("x", coords.x);
            extra.putInt("y", coords.y);
            extra.putInt("z", coords.z);
            nativeDropItem(coords.x,coords.y+1,coords.z,0,item.id, 1, 0, extra);
            Game.tipMessage("New coords getted ");
        }else{
            nativeDropItem(coords.x,coords.y+1,coords.z ,0,item.id, 1, 0, null);
            Game.tipMessage("Coords cleared");
        }   
    }else{  
        World.setBlock(coords.relative.x,coords.relative.y,coords.relative.z,item.id,item.data);
        World.addTileEntity(coords.relative.x,coords.relative.y,coords.relative.z);
        var currentTE = World.getTileEntity(coords.relative.x,coords.relative.y,coords.relative.z);
        if(item.extra){
            currentTE.data.connecterTransmitter = {
                x:item.extra.getInt("x"),
                y:item.extra.getInt("y"),
                z:item.extra.getInt("z")
            }
            var transmitterTE = World.getTileEntity(item.extra.getInt("x"),item.extra.getInt("y"),item.extra.getInt("z"));
            if(transmitterTE){
                transmitterTE.data.connecterTransmitter = {
                    x:coords.relative.y,
                    y:coords.relative.y,
                    z:coords.relative.z
                }
            }
        }  
    }  
});
TileEntity.registerPrototype(BlockID.transmitter, {
    defaultValues: {
        mode:"input",
        XM:0,
        connecterTransmitter:null
    },
    
    click:function(id){
        if(Entity.getSneaking(Player.get())&&!id){
            this.switchMode();
        }
    },
    
    energyTick: function(type, src) {
        
        if(this.data.mode=="input"){
             this.data.XM-=src.add(this.data.XM);
        }else if(this.data.connecterTransmitter){
            var transmitter = World.getTileEntity(this.data.connecterTransmitter.x,this.data.connecterTransmitter.y,this.data.connecterTransmitter.z);
            if(transmitter){
                if(!transmitter.data.XM){
                    var en = src.getAll(1);
                    if(Math.round(en)){
                        transmitter.data.XM+=Math.round(en);
                        this.generateParticle();
                    }
                }
            }    
        }
    },
    switchMode:function(){
        if(this.data.mode=="input"){
            this.data.mode = "output"
            World.setBlock(this.x,this.y,this.z,BlockID.transmitter,1);
        }else{
            this.data.mode = "input";
            World.setBlock(this.x,this.y,this.z,BlockID.transmitter,0);
        }
        Game.tipMessage("New mode "+this.data.mode);
    },
   generateParticle:function(){
        if(this.data.connecterTransmitter){
            var vec = this.getParVelVector();
            Particles.addFarParticle(XMBlueParticle, this.x+.5, this.y+1, this.z+.5, vec.x/20, vec.y/20, vec.z/20);        
        }
   },
   getParVelVector:function(){
        var coords = {};
        coords.x = this.data.connecterTransmitter.x-this.x;
        coords.y = this.data.connecterTransmitter.y-this.y;
        coords.z = this.data.connecterTransmitter.z-this.z;
        return coords;
   }
});

ICRender.getGroup("XM-wire").add(BlockID.transmitter, -1);
EnergyTileRegistry.addEnergyTypeForId(BlockID.transmitter, XM);



// file: modes.js

var XMunlocker = new BodyMode("XMunlocker");
XMunlocker.particle = [XMSmallGreenParticle, XMSmallGreenParticle, XMBlueParticle, XMBlueParticle, XMRedParticle];
XMunlocker.onActivate = function(){
    XMunlocker.conflicts = {"XMunlocker":true};
    XMunlocker.currentStep = 0;
    XMunlocker.step = Math.PI/12;
    XMunlocker.radius = 1;
    XMunlocker.level = 1;
    
    XMunlocker.emitter = Particles.ParticleEmitter(Player.getPosition().x, Player.getPosition().y, Player.getPosition().z);
    XMunlocker.emitter.attachTo(Player.get(),0,-2,0);
    
    Debug.m("activated "+" level"+XMunlocker.level);
    XMunlocker.activated = true;
    PlayerXM.XMDiscount = PlayerXM.XMDiscount*(5*XMunlocker.level);
    PlayerXM.XMEfficiency = PlayerXM.XMEfficiency*(5*XMunlocker.level);
    
    
};

XMunlocker.onDeactivate = function(){
    Debug.m("try deactivate "+XMunlocker.activated);
    if(XMunlocker.activated){//костыль
        Debug.m("deactivated");
        XMunlocker.activated = false;
        
        //hurts
        switch(XMunlocker.level){ 
            case 5:
                Debug.m("kill");
                Entity.setHealth(Player.get(),0);
            break;
            default:
                var dm = PlayerXM.getDamage(3*XMunlocker.level);
                Debug.m("damage "+dm);
                Entity.addEffect(Player.get(), MobEffect.wither, 0, 100*XMunlocker.level+Math.round(PlayerXM.XMPoisonEffect));            
                Entity.damageEntity(Player.get(), dm, Player.get());
            break;
        }
        
        PlayerXM.XMDiscount = PlayerXM.XMDiscount/(5*XMunlocker.level);
        PlayerXM.XMEfficiency = PlayerXM.XMEfficiency/(5*XMunlocker.level);
        PlayerXM.addPoison(.1*XMunlocker.level);
    }
};
XMunlocker.tick = function(){
    if(XMunlocker.activated){
       if(World.getThreadTime()%5==0){
           Entity.addEffect(Player.get(), MobEffect.movementSpeed, 10*Math.pow(XMunlocker.level,2), 6 );
           Entity.addEffect(Player.get(), MobEffect.jump, 1*XMunlocker.level, 6);
           Entity.addEffect(Player.get(), MobEffect.damageBoost, 10*Math.pow(XMunlocker.level,2), 6);
       }
       if(World.getThreadTime()%40==0){
            alert(XMunlocker.level)
       }
       var current = PlayerXM.playerXM.current;
       var max =  PlayerXM.playerXM.max;
       if(current>(max*.1)){
            XMunlocker.spawnParticle();
            for(var i = 0;i<XMunlocker.level;i++){PlayerXM.simpleXMTick()}
       }else{BodyModeManager.deactivateMode(XMunlocker)}
    }    
};
XMunlocker.onSecondActivate = function(){
       var item = Player.getCarriedItem();
       if(XMunlocker.level<5){
           if(item.id == ItemID["XMunlocker"]){
                XMunlocker.level++;
                XMunlocker.radius = XMunlocker.radius * 1.5;
                PlayerXM.XMDiscount = PlayerXM.XMDiscount * (5*XMunlocker.level);
                PlayerXM.XMEfficiency = PlayerXM.XMEfficiency * (5*XMunlocker.level);
                Debug.m("level++ ");
            }
       }
        Debug.m("second activate "+XMunlocker.level);
};
XMunlocker.spawnParticle = function(){
    if(XMunlocker.activated){
        //var particle = XMRedParticle;
        var emitter = XMunlocker.emitter;
        var sx = Math.sin(XMunlocker.currentStep)*XMunlocker.radius;
        var sy = Math.cos(XMunlocker.currentStep)*XMunlocker.radius;
        
        var x = emitter.getPosition().x+sx;
        var y = emitter.getPosition().y;
        var z = emitter.getPosition().z+sy;
        
        var ax = 0;
        var ay = -.01;
        var az = 0;
        
        emitter.emit(XMunlocker.particle[XMunlocker.level-1], 0,x, y,z, sx/(XMunlocker.radius*10), .2, sy/(XMunlocker.radius*10),ax,ay,az);
        XMunlocker.currentStep += XMunlocker.step;
    }    
};