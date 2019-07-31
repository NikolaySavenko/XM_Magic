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