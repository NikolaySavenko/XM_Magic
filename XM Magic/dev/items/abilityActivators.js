IDRegistry.genItemID("XMunlocker");
Item.createItem("XMunlocker","XM Unlocker Activator", {name: "XMunlocker", meta: 0}, {stack:1});
Item.setMaxDamage(ItemID.XMunlocker, 21);
XMItems.registerXMItem(ItemID.XMunlocker);
Item.registerNoTargetUseFunction("XMunlocker",function(coords,item,block){
    item = Player.getCarriedItem();
    if(item.data<=0){
        BodyModeManager.activateMode(XMunlocker);
        Player.setCarriedItem(item.id,1,20);
    }
});

IDRegistry.genItemID("trebla");
Item.createItem("trebla","Trebla ", {name: "trebla", meta: 0}, {stack:1});
Item.setMaxDamage(ItemID.trebla, 21);
XMItems.registerXMItem(ItemID.trebla);
Item.registerNoTargetUseFunction("trebla", function (coords, item, block) {
    item = Player.getCarriedItem();
    if(item.data<=0){
        var Pcoords = Player.getPosition();
        var view = Entity.getLookVector(Player.get());
        var trebla = new TreblaAnimation(Pcoords.x+view.x, Pcoords.y+view.y, Pcoords.z+view.z);
        Updatable.addUpdatable(trebla);
        Player.setCarriedItem(item.id,1,20);
    }
});
