var lenses = {};
IDRegistry.genItemID("simpleLens");
Item.createItem("simpleLens","Simple Lins", {name: "lins", meta: 0}, {stack:1});
lenses[ItemID.simpleLens] = true;
Baubles.registerBauble({
    id: ItemID.simpleLens,
    type: "charm"
});

IDRegistry.genItemID("lensGrass");
Item.createItem("lensGrass","Grass Lins", {name: "lins", meta: 1}, {stack:1});
lenses[ItemID.lensGrass] = true;
Baubles.registerBauble({
    id: ItemID.lensGrass,
    type: "charm"
});

IDRegistry.genItemID("lensDark");
Item.createItem("lensDark","Grass Dark", {name: "lins", meta: 2  }, {stack:1});
lenses[ItemID.lensDark] = true;
Baubles.registerBauble({
    id: ItemID.lensDark,
    type: "charm"
});
