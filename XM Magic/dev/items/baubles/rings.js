IDRegistry.genItemID("starRing");
Item.createItem("starRing","Simple Star Ring", {name: "starRing", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.starRing, count:1, data:0}, [
         "xzx",
         "zxz",
         "xzx"
    ], ['z',ItemID.starIngot,0,'x',ItemID.starPiece,0]);
});

Baubles.registerBauble({
    id: ItemID.starRing,
    type: "ring",
    onEquip: function () {
        //Debug.m("increasing");
        Game.tipMessage(ChatColor.GREEN+"You feel you become a bit more powerful!");
        PlayerXM.increaseMaxXM(2);
    },

    onTakeOff: function () {
        //Debug.m("Decreasing");
        Game.tipMessage(ChatColor.DARK_RED+"Power leaves you...");
        PlayerXM.decreaseMaxXM(2);
    }
});

IDRegistry.genItemID("adwancedStarRing");
Item.createItem("adwancedStarRing","Adwanced Simple Star Ring", {name: "adwancedRing", meta: 0}, {stack:1});
AssmblerRecipe.registerRecipe(ItemID.starRing, ItemID.adwancedStarRing, 100);
Baubles.registerBauble({
    id: ItemID.adwancedStarRing,
    type: "ring",
    onEquip: function () {
        //Debug.m("increasing");
        Game.tipMessage(ChatColor.GREEN+"You feel you become a much more powerful!");
        PlayerXM.increaseMaxXM(10);
    },

    onTakeOff: function () {
        //Debug.m("Decreasing");
        Game.tipMessage(ChatColor.DARK_RED+"Power leaves you...");
        PlayerXM.decreaseMaxXM(10);
    }
});