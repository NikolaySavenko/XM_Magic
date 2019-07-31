IDRegistry.genItemID("starIngot");
Item.createItem("starIngot","Star Ingot", {name: "star_ingot", meta: 0}, {});


IDRegistry.genBlockID("starIngotBlock");
Block.createBlock("starIngotBlock", [
{name: "Star Ingot Block", texture: [["starIngotBlock", 1]],inCreative:true}
], "opaque");


IDRegistry.genItemID("starIngotTier2");
Item.createItem("starIngotTier2","Star Ingot Tier 2", {name: "star_ingot", meta: 1}, {});

IDRegistry.genBlockID("starIngotBlockTier2");
Block.createBlock("starIngotBlockTier2", [
{name: "Star Ingot Block Tier 2", texture: [["starIngotBlock", 2]],inCreative:true}
], "opaque");


IDRegistry.genItemID("grassIngot"); //Create a new item
Item.createItem("grassIngot", "Grass Ingor", {name: "grassIngot", meta: 0}, {});

IDRegistry.genItemID("darkIngot"); //Create a new item
Item.createItem("darkIngot", "Dark Ingor", {name: "darkIngot", meta: 0}, {});
