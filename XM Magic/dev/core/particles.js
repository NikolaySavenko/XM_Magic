var particleTexture = "XM_particle";
if(__config__.getBool("highQualityParticles")){
    particleTexture = "vortex";
}

var XMparticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .5],
    size:[1, 10],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

var XMBlueParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,.2,1, .5],
    size:[1, 5],
    lifetime:[20, 40],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

var BlackParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[0,0,0, .5],
    size:[4, 4],
    lifetime:[20, 100],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

var XMSmallMachineParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .5],
    size:[1, 10],
    lifetime:[1, 10],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});
var XMmachineParticle = Particles.registerParticleType({ 
    texture: particleTexture, 
    render: 2, 
    color:[.2,1,.2, .8], 
    size:[2, 4], 
    lifetime:[20, 20], 
    collision:false, 
    animators: { 
    alpha:{fadeIn: 0.1, fadeOut: .8, start: 0, end: 1}, 
    size:{fadeIn:0.2, fadeOut: 1, start:0, end:1} 
} 
});

var XMRedParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[1,.2,.2, .7],
    size:[3, 3],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});

XMBlueParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,.2,1, .7],
    size:[3, 3],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});
XMSmallGreenParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .7],
    size:[3, 3],
    lifetime:[20, 20],
    collision:false,
    animators: {
        alpha:{fadeIn: .4, fadeOut: .4},
        size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});
/*
var XMmachineParticle = Particles.registerParticleType({
    texture: particleTexture,
    render: 2,
    color:[.2,1,.2, .8],
    size:[2, 4],
    lifetime:[20, 20],
    collision:false,
    animators: {
        //alpha:{fadeIn: .4, fadeOut: .4},
        //size:{fadeOut: .5, fadeIn:0.2, start:0, end:0}
    }
});     my*/