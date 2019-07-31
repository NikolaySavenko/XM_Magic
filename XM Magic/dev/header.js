//MOD by Nikolay Savenko
var ChatColor = ModAPI.requireGlobal("ChatColor");
var Particles = ModAPI.requireGlobal("Particles");
var nativeDropItem = ModAPI.requireGlobal("Level.dropItem");
var MobEffect = Native.PotionEffect;
var Enchantment = Native.Enchantment;
var BlockSide = Native.BlockSide;
var EntityType = Native.EntityType;
var playerEmitter;
function random(min, max){
    return (Math.random()*max)+min;
};          

function randomInt(min, max){
    return Math.round(Math.random() * (max - min) + min);
};
function deg2rad(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
};
/*function particleLine(type,coords0,coords1,gap){
    var distance = Entity.getDistanceBetweenCoords(coords0, coords1);
    var vector = {
        x:coords1.x-coords0.x,
        y:coords1.y-coords0.y,
        z:coords1.z-coords0.z
    };
    for(var count =0;i<distance/gap;i++){
        Particles.line
    }
}*/

importLib("ToolType", "*");
IMPORT ("BackpackAPI", "BackpackRegistry");
IMPORT ("BaublesAPI", "Baubles");
IMPORT("Plant_Model");
IMPORT("Harvest_Core");
IMPORT("energylib");
IMPORT("flags");

var XM = EnergyTypeRegistry.assureEnergyType("XM", 1000000);
if(modsAPI.ICore){var EU = EnergyTypeRegistry.assureEnergyType("Eu", 1)}

Callback.addCallback("LevelLoaded", function(){
    playerEmitter = Particles.ParticleEmitter(Player.getPosition().x, Player.getPosition().y, Player.getPosition().z);
    playerEmitter.attachTo(Player.get());
});