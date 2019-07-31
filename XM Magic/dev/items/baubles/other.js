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