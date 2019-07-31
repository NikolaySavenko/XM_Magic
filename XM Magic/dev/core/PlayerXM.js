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
