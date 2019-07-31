IDRegistry.genItemID("simplStarFocus");
Item.createItem("simplStarFocus","Simple Star Focus", {name: "simpleStarFocus", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.simplStarFocus, count: 1, data:0}, [
         "xyx",
         "yxy",
         "xyx"
    ], ['x',ItemID.starPiece,0, 'y', 265,0]);
    Recipes.addShapeless({id:ItemID.starIngot, count: 9, data: 0}, [{id: BlockID.starIngotBlock, data: 0}]);
});

Item.registerUseFunction("simplStarFocus", function (coords, item, block) {
    PlayerXM.focusXM(10);
    Player.decreaseCarriedItem(1);
});
