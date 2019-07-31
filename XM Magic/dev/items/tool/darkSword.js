IDRegistry.genItemID("swordDark");
Item.createItem("swordDark", "Dark Sword", {name: "swordsDark", meta: 0}, {stack:1});
Recipes.addShaped({id: ItemID.swordDark, count: 1, data: 0}, [
     "x",
     "x",
     "z"
], ['x',ItemID.darkIngot,0,"z",280,0]);
Item.setToolRender(ItemID.swordDark, true);
Item.setMaxDamage(ItemID.swordDark, 30);
Item.registerNoTargetUseFunction("swordDark", function (coords, item, block) {
    item = Player.getCarriedItem();
    if(item.data<20){
        var Pcoords = Player.getPosition();
        var view = Entity.getLookVector(Player.get());
        var trebla = new TreblaAnimation(Pcoords.x+view.x, Pcoords.y+view.y, Pcoords.z+view.z);
        Updatable.addUpdatable(trebla);
        ToolAPI.breakCarriedTool(20);
    }
});