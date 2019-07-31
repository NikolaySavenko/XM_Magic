IDRegistry.genItemID("mindBelt");
Item.createItem("mindBelt","Belt Of Mind", {name: "Mind_belt", meta: 0}, {stack:1});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.mindBelt, count:1, data:0}, [
         " x ",
         "x x",
         " z "
    ], ['z',ItemID.starPiece,0,'x',334,0]);
});

Baubles.registerBauble({
    id: ItemID.mindBelt,
    type: "belt",
    onEquip: function () {
        Debug.m("pre discount "+PlayerXM.XMDiscount);
        Game.tipMessage(ChatColor.GREEN+"It is holding back energy");
        PlayerXM.XMDiscount = PlayerXM.XMDiscount * .5;
        PlayerXM.XNEfficiency = PlayerXM.XMEfficiency* 1.5;
        Debug.m("post discount "+PlayerXM.XMDiscount);
    },

    onTakeOff: function () {
        //Debug.m("Decreasing");
        Game.tipMessage(ChatColor.DARK_RED+"Power leaves you...");
        PlayerXM.XMDiscount = PlayerXM.XMDiscount/ .5;
        PlayerXM.XNEfficiency = PlayerXM.XMEfficiency/ 1.5;
    }
});