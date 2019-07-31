IDRegistry.genItemID("swordTier2");
Item.createItem("swordTier2", "Star Sword Tier 2", {name: "swordT2", meta: 2}, {stack:1});
Recipes.addShaped({id: ItemID.swordTier2, count: 1, data: 0}, [
     "x",
     "x",
     "z"
], ['x',ItemID.starIngotTier2,0,"z",280,0]);
ToolAPI.addToolMaterial("star2", {durability: 30, level: 3, efficiency: 10, damage: 5, enchantability: 14});
ToolAPI.setTool(ItemID.swordTier2, "star2", ToolType.sword);

weaponFunctions[ItemID.swordTier2] = function(attacker, victim, damage,item){

     var coords = Entity.getPosition(attacker);
     var vicPos = Entity.getPosition(victim);
     //Debug.m(coords);
     //Debug.m(vicPos);  
     //alert(Entity.getHealth(victim)+" "+damage);
     if(Entity.getHealth(victim)<=damage){
         alert("aaaaaaaaaa");
         Entity.setPosition(victim,coords.x,coords.y,coords.z);
         Entity.setPosition(attacker,vicPos.x,vicPos.y+2,vicPos.z);
     }
     Entity.damageEntity(victim, damage);
     ToolAPI.breakCarriedTool(5);  
};