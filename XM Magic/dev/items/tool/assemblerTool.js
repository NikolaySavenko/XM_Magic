IDRegistry.genItemID("assemblerTool");
Item.createItem("assemblerTool","Assembler Connector", {name: "assemblerTool", meta: 0}, {stack:1});
Item.registerNameOverrideFunction(ItemID.assemblerTool, function(item, name){
    var carried = Player.getCarriedItem();
    if(carried.id == item.id){
        var extra = carried.extra;
        if(extra){
            var x = extra.getInt("x");
            var y = extra.getInt("y");
            var z = extra.getInt("z");
            name += "\n§7x: " + x + ", y: " + y + ", z: " + z;
        }
    }
    return name;
});

Item.registerUseFunction("assemblerTool", function(coords, item, block){
    var linkedCoords;
    var extra = item.extra;
    if(!extra){
        extra = new ItemExtraData();
        item.extra = extra;
    }else{
        var x = extra.getInt("x");
        var y = extra.getInt("y");
        var z = extra.getInt("z");
        linkedCoords = {x: x, z: z, y: y};
        
    }
    if(block.id==BlockID.assembler){
        if(linkedCoords){
            var assembler = World.getTileEntity(coords.x, coords.y, coords.z);
            var charger = World.getTileEntity(linkedCoords.x, linkedCoords.y, linkedCoords.z);
            if(assembler && charger){
                //assembler.data.connectedChargers.push({x:linkedCoords.x, y:linkedCoords.y, z:linkedCoords.z});
                charger.data.connecterAssembler = {x:coords.x, y:coords.y, z:coords.z};
            }
            
            Game.tipMessage("Linked!");
        }else{
            Game.tipMessage("No linked coords");
        }
    }else if(block.id==BlockID.charger){
        extra.putInt("x", coords.x);
        extra.putInt("y", coords.y);
        extra.putInt("z", coords.z);
        Player.setCarriedItem(item.id, 1, item.data, extra);
        Game.tipMessage("New coords getted");
    }
});