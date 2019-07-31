function TreblaAnimation(x,y,z){
    this.absAlpha=0;
    this.count =3;
    this.radius= 3;
    this.fullRadius=3;
    this.partCount=50;
    this.c=0;
    this.playerAngle = Entity.getLookAngle(Player.get()).yaw;
    
    this.emitter = Particles.ParticleEmitter(x, y, z);
    this.lookAngle = Entity.getLookAngle(Player.get());
    
    this.update = function(){
        if(this.c < this.partCount){
            for(var i = 0; i < this.count; i++){
                var a = (i / this.count) * Math.PI *2; // текущий угол
                var sx = Math.sin(a + this.absAlpha) * this.radius;
                var sy = Math.cos(a + this.absAlpha) * this.radius;
                
                var oldx = this.emitter.getPosition().x+sx;
                var oldz = this.emitter.getPosition().z;
                
                var rotAngle = this.getRotAngle(this.playerAngle);
                var rx = oldx - x;
                var rz = oldz - z;
                var c = Math.cos(rotAngle);
                var s = Math.sin(rotAngle);
                var newX = x + rx * c - rz * s;
                var newZ = z + rx * s + rz * c;

                // ебош партиклу
                this.emitter.emit(XMRedParticle, 0, newX, this.emitter.getPosition().y+sy, newZ,0,0,0);       
            }
             this.absAlpha-=.08;
             this.radius =  this.fullRadius -  this.c /  this.partCount *  this.fullRadius;
             this.c++;
        }else{
            var ray = new dangerRay(Entity.getLookVectorByAngle(this.lookAngle),this.emitter,20);
            this.remove = true;
        }
    };
    this.getRotAngle = function(vectorAngle){return vectorAngle - Math.PI;}
};