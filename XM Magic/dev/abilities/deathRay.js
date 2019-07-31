function dangerRay(vector, emitter,damage){
     this.step = {
        x:vector.x/10,
        y:vector.y/10,
        z:vector.z/10
    };
    this.emitter = emitter;
    this.distanse = 32;
    this.count = this.distanse*4;
    this.particle = BlackParticle;

    for(var currentStep = 0;currentStep<this.distanse;currentStep+=this.distanse/this.count){
        var coord = {
            x:this.emitter.getPosition().x+currentStep*vector.x,
            y:this.emitter.getPosition().y,
            z:this.emitter.getPosition().z+currentStep*vector.z
        };
       var entities = Entity.getAllInRange(coord, 2);
        for(var i in entities){
            Entity.damageEntity(entities[i],damage*PlayerXM.XMEfficiency);
            alert("damage "+damage*PlayerXM.XMEfficiency);
        }
        //alert(World.getBlockID(coord.x,coord.y,coord.z));
        if(World.getBlockID(coord.x,coord.y,coord.z)!=0){
            break;
        }
       this.emitter.emit(this.particle, 0, coord.x, coord.y, coord.z);
    }
}