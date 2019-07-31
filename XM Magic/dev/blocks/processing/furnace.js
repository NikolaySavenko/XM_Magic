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