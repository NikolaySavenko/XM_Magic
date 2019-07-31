IDRegistry.genItemID("starPiece");
Item.createItem("starPiece","Star Piece", {name: "star_piece", meta: 0}, {stack:16});
Callback.addCallback("ItemUse", function(coords, item, block){
    var x = coords.x;
    var y = coords.y;
    var z = coords.z;
    if(item.id==ItemID.starPiece){
        if(Entity.getSneaking(Player.get())){
            var TE = World.getTileEntity(x,y,z);
            if(TE){
                if(typeof(TE.data.XM)=="number"){                  
                    alert(TE.data.XM);           
                } 
            }        
        }else{
            alert(WorldXM.getChunkNameFromCoords(coords.x, coords.z));
            alert(WorldXM.getXMStatusFromChunk(coords.x, coords.z));
            
        } 
    }
    
});

IDRegistry.genBlockID("starBlock");
Block.createBlock("starBlock", [
{name: "Star Block", texture: [["star_block", 0]],inCreative:true}
], "opaque");
Callback.addCallback("PostLoaded", function(){
    Recipes.addShapeless({id:BlockID.starBlock, count: 1, data: 0}, [{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0},{id: ItemID.starPiece, data: 0}]);
});