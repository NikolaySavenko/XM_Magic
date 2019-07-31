if(modsAPI.ICore){
    IDRegistry.genBlockID("EUtoXMconverter");
    Block.createBlock("EUtoXMconverter", [
    {name: "EU To XM Converter", texture: [["EUtoXMconverter",0 ]], inCreative: true}
    ], "opaque");

    TileEntity.registerPrototype(BlockID.EUtoXMconverter, {
        defaultValues: {
            XM:0,
            EU:0,
            storageXM:100,
            StorageEU:1000000
        },
        energyTick: function(type, src) {
            if(type=="Eu"){
                var output = Math.min(32, this.data.EU);
                this.data.EU += src.add(output) - output;
            }
            if(type=="XM"){
                if(Math.round(this.data.XM)<this.data.storageXM){
                    this.data.XM += src.getAll(1);
                }
                var produce = 100000;
                if(this.data.EU+produce<this.data.StorageEU&&this.data.XM>1){
                    this.data.EU+=produce;
                    this.data.XM--;
                }
            }        
        },
    });
    ICRender.getGroup("XM-wire").add(BlockID.EUtoXMconverter, -1);
    ICRender.getGroup("ic-wire").add(BlockID.EUtoXMconverter, -1);
    EnergyTileRegistry.addEnergyTypeForId(BlockID.EUtoXMconverter, XM);
    EnergyTileRegistry.addEnergyTypeForId(BlockID.EUtoXMconverter, EU);
}
