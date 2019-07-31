var WorldXM = {
    defaultChunkXM:100,
    XMChunks:{},
    requireXMFromChunk:function(x,z, amount){
        var chunkName = this.getChunkNameFromCoords(x,z);
        if(typeof(this.XMChunks[chunkName])=="number"){
            if(this.XMChunks[chunkName]>amount){
                this.XMChunks[chunkName]-=amount;
                return amount;
            }else{
                this.XMChunks[chunkName] = 0;
                return this.XMChunks[chunkName];
            }
        }else if(amount<this.defaultChunkXM){
            this.XMChunks[chunkName]= this.defaultChunkXM-amount;
            return amount;
        }
        return 0;
    },
    addXMToChunk:function(x,z, amount){
        var chunkName = this.getChunkNameFromCoords(x,z);
        if(typeof(this.XMChunks[chunkName])=="number"){
            if(this.getXMStatusFromChunk(x,z)+amount<=this.defaultChunkXM){
                this.XMChunks[chunkName]+=amount;
                return amount;
            }else{
                this.XMChunks[chunkName]=this.defaultChunkXM;
                return amount;
            }
        }
        return 0;
    },
    getXMStatusFromChunk:function(x,z){
        var chunkName = this.getChunkNameFromCoords(x,z);
        if(typeof(this.XMChunks[chunkName])=="number"){
            return this.XMChunks[chunkName]
        }else{
            return this.defaultChunkXM;
        }
    },
    getChunkNameFromCoords:function(x,z){
        var ChunkX = parseInt(x/16);
        var ChunkZ = parseInt(z/16);
        return ChunkX+':'+ChunkZ
    }
};

Saver.addSavesScope("XMScope",
    function read(scope) {
        //Debug.m("reading");
        for(var chunk in scope){
            //Debug.m("chunk "+chunk+" , XM: "+scope[chunk]);
            WorldXM.XMChunks[chunk] = scope[chunk];
        }
    },

    function save() {
        var obj = {};
        //Debug.m("saving");
        for(var chunk in WorldXM.XMChunks){
            //Debug.m("chunk "+chunk+" , XM: "+WorldXM.XMChunks[chunk]);
            obj[chunk] = WorldXM.XMChunks[chunk];
        };
        return obj;
    }
);