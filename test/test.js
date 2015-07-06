tm.main(function() {
    
    var app = tm.hybrid.Application("#canvas2d", "#canvas3d");
    app.resize(640, 960).fitWindow();
    app.run();
    
    var scene = app.currentScene;
    scene.camera.setPosition(0, 20, 50);
    
    tm.asset.ThreeJSON("./assets/kirara.json").onload = function() {
        var kirara = tm.hybrid.Mesh(this.mesh).addChildTo(scene);

        var pos = kirara.position.clone();
        pos.y = 10;
        scene.camera.lookAt(pos);

        kirara.update = function(app) {
            var p = app.pointing;
            if (p.getPointing()) {
                this.rotationY += 10;
            }
        };
    };
});
