var OreGenerator = {
    star: {
        enabled: __config__.getBool("star_ore.enabled"),
        count: __config__.getNumber("star_ore.count"),
        size: __config__.getNumber("star_ore.size"),
        minHeight: __config__.getNumber("star_ore.minHeight"),
        maxHeight: __config__.getNumber("star_ore.maxHeight")
    },
    addFlag: function(name, flag){
        if(OreGenerator[name].enabled){
            OreGenerator[name].enabled = !Flags.addFlag(flag);
        }
    }
};
OreGenerator.addFlag("star", "oreGenStar");

IDRegistry.genBlockID("starOre");
Block.createBlock("starOre", [
{name: "Star Ore", texture: [["starOre", 0]],inCreative:true}
], "opaque");
ToolAPI.registerBlockMaterial(BlockID.starOre, "stone", 3, true);
Block.setDestroyTime(BlockID.starOre, 3);
Block.setDestroyLevel("starOre", 2);

Block.registerDropFunction("starOre", function(coords, id, data, diggingLevel, toolLevel){
    alert("dropped");
    return [[ItemID.starPiece, Math.round(Math.random()*2), data]];
});

Callback.addCallback("PostLoaded", function(){
    if(OreGenerator.star.enabled){
        Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ){
            for(var i = 0; i < OreGenerator.star.count; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, OreGenerator.star.minHeight, OreGenerator.star.maxHeight);
                GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.starOre, 0, OreGenerator.star.size);
            }
        });
        Callback.addCallback("GenerateChunk", function(chunkX, chunkZ){
            for(var i = 0; i < OreGenerator.star.count; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, OreGenerator.star.minHeight, OreGenerator.star.maxHeight);
                GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.starOre, 0, OreGenerator.star.size);
            }
        });
    }
});