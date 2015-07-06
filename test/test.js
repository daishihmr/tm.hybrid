tm.main(function() {
    var app = tm.hybrid.Application("#canvas2d", "#canvas3d");
    app.threeRenderer.setClearColor("0x000000");
    app.resize(640, 960).fitWindow().run();
    
    app.replaceScene(tm.game.LoadingScene({
        width: 640, height: 960,
        assets: {
            kirara: {
                type: "three",
                url: "./assets/kirara.json",
            },
            hiyoko: "./assets/hiyoco_nomal_full.png",
        },
        nextScene: MainScene,
    }));
});

tm.define("MainScene", {
    superClass: "tm.hybrid.Scene",
    init: function() {
        this.superInit();
        this.camera.setPosition(0, 20, 50);
        
        var rolling = false;
        
        var kirara = tm.hybrid.Mesh("kirara")
            .addChildTo(this)
            .on("enterframe", function() {
                if (rolling) this.rotationY += 10;
            });
        
        var target = kirara.position.clone();
        target.y += 10;
        this.camera.lookAt(target);

        tm.ui.FlatButton({ text: "かいてん" })
            .setPosition(320, 100)
            .addChildTo(this)
            .on("push", function() {
                rolling = !rolling;
                this.label.text = rolling ? "とまる" : "かいてん";
            });

        var hiyoko = tm.display.Sprite("hiyoko", 32, 32)
            .setScale(4)
            .setFrameIndex(0)
            .addChildTo(this)
            .on("enterframe", function() {
                this.x += this.vx * 10;
                this.y += this.vy * 10;
                if (this.x < 0 || 640 < this.x) this.vx *= -1;
                if (this.y < 0 || 960 < this.y) this.vy *= -1;
                
                this.frameIndex = (this.frameIndex + 1) % 4;
                this.rotation += 2;
            });
        hiyoko.vx = 1;
        hiyoko.vy = 1;
        
    }
});
