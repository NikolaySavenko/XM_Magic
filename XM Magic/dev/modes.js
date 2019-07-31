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