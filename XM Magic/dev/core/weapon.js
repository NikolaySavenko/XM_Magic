var weaponFunctions = {};
//example  weaponFunctions[23123] = function(attacker, victim, damage,item){}

Callback.addCallback("EntityHurt", function(attacker, victim, damage){
    if(attacker==Player.get()){
        alert("player attack ");
        var item = Player.getCarriedItem();
        if(weaponFunctions[item.id]){
            Game.prevent();
            alert("weapon");
            weaponFunctions[item.id](attacker, victim, damage,item);
        }
    }
});