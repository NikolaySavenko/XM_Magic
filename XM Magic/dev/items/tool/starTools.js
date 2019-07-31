IDRegistry.genItemID("starSword");
IDRegistry.genItemID("starShovel");
IDRegistry.genItemID("starPickaxe");
IDRegistry.genItemID("starAxe");
Item.createItem("starSword", "Star Sword", {name: "starSword", meta: 0}, {stack: 1});
Item.createItem("starShovel", "Star Shovel", {name: "star_shovel", meta: 0}, {stack: 1});
Item.createItem("starPickaxe", "Star Pickaxe", {name: "star_pick", meta: 0}, {stack: 1});
Item.createItem("starAxe", "Star Axe", {name: "star_axe", meta: 0}, {stack: 1});

Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id: ItemID.starSword, count: 1, data: 0}, [
         "x",
         "x",
         "z"
    ], ['x',ItemID.starIngot,0,"z",280,0]);
    Recipes.addShaped({id: ItemID.starShovel, count: 1, data: 0}, [
         "x",
         "z",
         "z"
    ], ['x',ItemID.starIngot,0,"z",280,0]);
    Recipes.addShaped({id: ItemID.starPickaxe, count: 1, data: 0}, [
         "xxx",
         " z ",
         " z "
    ], ['x',ItemID.starIngot,0,"z",280,0]);
    Recipes.addShaped({id: ItemID.starAxe, count: 1, data: 0}, [
         "xx ",
         "xz ",
         " z "
    ], ['x',ItemID.starIngot,0,"z",280,0]);
});



ToolAPI.addToolMaterial("star", {durability: 10, level: 3, efficiency: 10, damage: 2, enchantability: 14});
ToolAPI.setTool(ItemID.starSword, "star", ToolType.sword);
ToolAPI.setTool(ItemID.starShovel, "star", ToolType.shovel);
ToolAPI.setTool(ItemID.starPickaxe, "star", ToolType.pickaxe);
ToolAPI.setTool(ItemID.starAxe, "star", ToolType.axe);

XMItems.registerXMItem(ItemID.starSword);
XMItems.registerXMItem(ItemID.starShovel);
XMItems.registerXMItem(ItemID.starPickaxe);
XMItems.registerXMItem(ItemID.starAxe);

weaponFunctions[ItemID.starSword] = function(attacker, victim, damage,item){
    var maxDamage = Item.getMaxDamage(item.id);
    if(item.data+1<=maxDamage){
        
        var coords = Entity.getPosition(Player.get());
        var ent = Entity.findNearest({x:coords.x,y:coords.y,z:coords.z}, null, 8);
        var entPosition = Entity.getPosition(ent);
        var type = Entity.getType(ent);
        ToolAPI.breakCarriedTool(1);
        if(ent!=attacker||type!=64){      
            Entity.damageEntity(ent, parseInt(damage/2));
            var emittr = new Particles.ParticleEmitter(entPosition.x, entPosition.y, entPosition.z);
            for(var step = 0; step<=Math.PI*2; step+=Math.PI/12){              
                emittr.emit(XMRedParticle, 0 ,emittr.getPosition().x+Math.cos(step), emittr.getPosition().y+1, emittr.getPosition().z+Math.sin(step), 0, Math.random()*.2,0);        
            }
        }
    }
};