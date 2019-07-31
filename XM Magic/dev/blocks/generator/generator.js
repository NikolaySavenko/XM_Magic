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