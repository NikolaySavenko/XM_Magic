//IMPORT("Plant_Model");
//IMPORT("Harvest_Core");

/*
CropRegistry.registerClass("thaumcraft_forest_crop");
CropRegistry.registerClassConfig("thaumcraft_forest_crop",{
    farmland:[{id:60,data:0},{id:2,data:0},{id:3,data:0},{id:60,data:7}],
    seedsPlaceFunc:true
});
CropRegistry.registerClassDeriveFunction("thaumcraft_forest_crop",function(classs,id){
    Block.setDestroyLevelForID (id, 0);
    Block.setDestroyTime (id,0); 
    ToolAPI.registerBlockMaterial(id, "plant");
    Harvest.registerDroppingBlock(id);
    Callback.addCallback("ItemUse", function(coords, item, block){
        if(block.id==id){
            Harvest.drop(CropRegistry.getSeedFromCrop(id),1,coords);
            World.setBlock(coords.x,coords.y,coords.z,0,0);
        }
    });
    Block.registerDropFunction(id, function(coords, blockID, blockData, level){
        return[[ CropRegistry.getSeedFromCrop(id), 1,0 ]];
    });
});


CropRegistry.registerClass("thaumcraft_tropical_crop");
CropRegistry.registerClassConfig("thaumcraft_tropical_crop",{
    farmland:[{id:60,data:0},{id:2,data:0},{id:3,data:0},{id:60,data:7},{id:12,data:0}],
    seedsPlaceFunc:true
});
CropRegistry.registerClassDeriveFunction("thaumcraft_tropical_crop",function(classs,id){
    Block.setDestroyLevelForID (id, 0);
    Block.setDestroyTime (id,0); 
    ToolAPI.registerBlockMaterial(id, "plant");
    Harvest.registerDroppingBlock(id);
    Callback.addCallback("ItemUse", function(coords, item, block){
        if(block.id==id){
            Harvest.drop(CropRegistry.getSeedFromCrop(id),1,coords);
            World.setBlock(coords.x,coords.y,coords.z,0,0);
        }
    }); 
    Block.registerDropFunction(id, function(coords, blockID, blockData, level){
        return[[ CropRegistry.getSeedFromCrop(id), 1,0 ]];
    }); 
});



CropRegistry.registerClass("thaumcraft_treeSapling");
CropRegistry.registerClassConfig("thaumcraft_treeSapling",{
    ageSpeed:0,
    manure:{id:351,data:15},
    farmland:[{id:60,data:0},{id:2,data:0},{id:3,data:0},{id:60,data:7}],
    seedsPlaceFunc:true
});
CropRegistry.registerClassDeriveFunction("thaumcraft_treeSapling",function(classs,idd){
    Recipes.addFurnaceFuel(CropRegistry.getSeedFromCrop(idd), 0, 140);
    var cfg = CropRegistry.getConfigFromCrop(idd);
    PlantModel.tree(idd,0);
    Block.setDestroyLevelForID (idd, 0);
    Block.setDestroyTime (idd,0); 
    ToolAPI.registerBlockMaterial(idd, "plant");
    Harvest.registerDroppingBlock(idd);
    Block.setRandomTickCallback(idd,function(x,y,z,id,data){
        var chance = cfg.ageSpeed;
        if(Math.random()<chance){
            TreeRegistry.deployTree(x,y,z,TreeRegistry.getTreeFromSaplingBlock(idd));
        }
    });
    Callback.addCallback("ItemUse",function(coords,item,block){
        var manure = cfg.manure;
        var chance = 0;
        if(item.id==manure.id&&item.data==manure.data&&block.id==idd){
            if(Math.random()<chance){
                TreeRegistry.deployTree(coords.x,coords.y,coords.z,TreeRegistry.getTreeFromSaplingBlock(idd));
            }
            if(particles){
                for(var i = 0;i<particles;i++){
                    Particles.addParticle(Native.ParticleType.happyVillager, coords.x+Math.random()*.8,coords.y+Math.random()*.8,coords.z+Math.random()*.8,0,0,0,0)
                }
            }
            Player.decreaseCarriedItem(1);
        }
    });
    Block.registerDropFunction(idd, function(coords, blockID, blockData, level){
        return[[ CropRegistry.getSeedFromCrop(idd), 1,0 ]];
    });
    
});

IDRegistry.genItemID("cinderpearl");
Item.createItem("cinderpearl","Cindlepearl", {name: "cinderpearl", meta: 0}, {});

IDRegistry.genBlockID("cinderpearl"); 
Block.createBlock("cinderpearl", [
    {name: "Cindlepearl", texture: [["empty", 0],["empty", 0],["cinderpearl", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.cinderpearl,0);
CropRegistry.deriveCropAsClass("thaumcraft_tropical_crop",{
    id:BlockID.cinderpearl,
    drop:0,
    seed:ItemID.cinderpearl
});

IDRegistry.genItemID("manashroom");
Item.createItem("manashroom","Manashroom", {name: "manashroom", meta: 0}, {});

IDRegistry.genBlockID("manashroom"); 
Block.createBlock("manashroom", [
    {name: "manashroom", texture: [["empty", 0],["empty", 0],["manashroom", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.manashroom,0);
CropRegistry.deriveCropAsClass("thaumcraft_forest_crop",{
    id:BlockID.manashroom,
    drop:0,
    seed:ItemID.manashroom
});

IDRegistry.genItemID("manashroom");
Item.createItem("manashroom","Manashroom", {name: "manashroom", meta: 0}, {});

IDRegistry.genBlockID("manashroom"); 
Block.createBlock("manashroom", [
    {name: "manashroom", texture: [["empty", 0],["empty", 0],["manashroom", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.manashroom,0);
CropRegistry.deriveCropAsClass("thaumcraft_forest_crop",{
    id:BlockID.manashroom,
    drop:0,
    seed:ItemID.manashroom
});


IDRegistry.genItemID("greatwoodsapling");
Item.createItem("greatwoodsapling","Greatwood Sapling", {name: "greatwoodsapling", meta: 0}, {});

IDRegistry.genBlockID("greatwoodsapling"); 
Block.createBlock("greatwoodsapling", [
    {name: "greatwoodsapling", texture: [["empty", 0],["empty", 0],["greatwoodsapling", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.greatwoodsapling,0);
CropRegistry.deriveCropAsClass("thaumcraft_treeSapling",{
    id:BlockID.greatwoodsapling,
    drop:0,
    seed:ItemID.greatwoodsapling
});


IDRegistry.genItemID("silverwoodsapling");
Item.createItem("silverwoodsapling","Silverwood Sapling", {name: "silverwoodsapling", meta: 0}, {});

IDRegistry.genBlockID("silverwoodsapling"); 
Block.createBlock("silverwoodsapling", [
    {name: "silverwoodsapling", texture: [["empty", 0],["empty", 0],["silverwoodsapling", 0]], inCreative: false}
],BLOCK_TYPE_PLANT);
PlantModel.tree(BlockID.silverwoodsapling,0);
CropRegistry.deriveCropAsClass("thaumcraft_treeSapling",{
    id:BlockID.silverwoodsapling,
    drop:0,
    seed:ItemID.silverwoodsapling
});
*/