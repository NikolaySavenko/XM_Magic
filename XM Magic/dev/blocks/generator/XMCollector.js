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