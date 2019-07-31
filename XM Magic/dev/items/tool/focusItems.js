IDRegistry.genItemID("simplStarFocus");
Item.createItem("simplStarFocus","Simple Star Focus", {name: "simpleStarFocus", meta: 0}, {stack:8});
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.simplStarFocus, count: 1, data:0}, [
         "xyx",
         "yxy",
         "xyx"
    ], ['x',ItemID.starPiece,0, 'y', 265,0]);
    Recipes.addShapeless({id:ItemID.starIngot, count: 9, data: 0}, [{id: BlockID.starIngotBlock, data: 0}]);
});

Item.registerUseFunction("simplStarFocus", function (coords, item, block) {
    Player.decreaseCarriedItem(1);
    PlayerXM.focusXM(2*PlayerXM.XMEfficiency);
    for(var i = 0; i<=10;i++){
        var radius = 10;
        var vx = (Math.random()-0.5)*radius;
        var vy = (Math.random()-0.5)*radius;
        var vz = (Math.random()-0.5)*radius;
        var pC = Player.getPosition();
        if(pC.y+.5+vy>pC.y){
            playerEmitter.emit(XMparticle,0, pC.x-.5+vx, pC.y-.5+vy, pC.z-.5+vz, -vx/20, -vy/20, -vz/20);        
        }
    }
});