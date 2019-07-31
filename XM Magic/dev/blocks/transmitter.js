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