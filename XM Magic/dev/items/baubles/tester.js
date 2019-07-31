IDRegistry.genItemID("tester");
Item.createItem("tester","XMTester", {name: "tester", meta: 0}, {stack:1});
Item.setMaxDamage(ItemID.tester, 10);
XMItems.registerXMItem(ItemID.tester);
Callback.addCallback("PostLoaded", function(){
    Recipes.addShaped({id:ItemID.tester, count: 1, data:0}, [
     "zzz",
     "zxz",
     "zzz"
], ['z',339,0,'x', ItemID.simplStarFocus,0]);;
});

Item.registerUseFunction("tester", function (coords, item, block) {
    ToolAPI.breakCarriedTool(1);
    var xmChunk = WorldXM.getXMStatusFromChunk(coords.x,coords.z);
    var color;
    if(WorldXM.defaultChunkXM<=xmChunk){
        color = ChatColor.WHITE;
    }else if(WorldXM.defaultChunkXM*.99<=xmChunk){
        color = ChatColor.GREEN;
    }else if(WorldXM.defaultChunkXM*.75<=xmChunk){
        color = ChatColor.DARK_GREEN;
    }else if(WorldXM.defaultChunkXM*.60<=xmChunk){
        color = ChatColor.YELLOW;
    }else if(WorldXM.defaultChunkXM*.45<=xmChunk){
        color = ChatColor.GOLD;
    }else if(WorldXM.defaultChunkXM*.20<=xmChunk){
        color = ChatColor.GOLD;
    }else if(WorldXM.defaultChunkXM*.10<=xmChunk){
        color = ChatColor.DARK_GRAY;
    }else{
        color = ChatColor.BLACK;
    }
    Game.tipMessage(color+"XM Level");
});