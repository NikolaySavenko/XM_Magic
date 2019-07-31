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