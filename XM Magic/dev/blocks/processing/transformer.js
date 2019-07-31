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