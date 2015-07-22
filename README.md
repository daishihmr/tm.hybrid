# tm.hybrid
Three.jsをtmlib.jsから利用する

[![Join the chat at https://gitter.im/daishihmr/tm.hybrid](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/daishihmr/tm.hybrid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Three.jsをtmlib.jsから利用する

```js
tm.main(function() {
    var app = tm.hybrid.Application("#canvas2d", "#canvas3d");
    app.resize(640, 960).fitWindow().run();
    
    app.replaceScene(tm.game.LoadingScene({
        width: 640, height: 960,
        assets: {
            // 拡張子による判別がきかないため、typeパラメータをつける
            kirara: {
                type: "three",
                url: "./assets/kirara.json",
            },

            hiyoko: "./assets/hiyoco_nomal_full.png",
        },
        nextScene: KiraraOnStage,
    }));
});

tm.define("KiraraOnStage", {
    superClass: "tm.hybrid.Scene", // tm.app.Sceneの3D向け拡張
    init: function() {
        this.superInit();

        // カメラ調整
        this.camera.setPosition(0, 20, 50);
        this.camera.lookAt(new THREE.Vector3(0, 10, 0));
        
        // ライトを動かす
        this.directionalLight
            .on("enterframe", function(e) {
                var f = e.app.frame;
                this.x = Math.cos(f * 0.1) * 10;
                this.z = Math.sin(f * 0.1) * 10;
            });

        // メッシュを表示する
        var kirara = tm.hybrid.Mesh("kirara") // Spriteっぽく使える
            .addChildTo(this)
            .on("enterframe", function(e) {
                
                // スワイプでくるくるまわす
                var p = e.app.pointing;
                if (p.getPointing()) {
                    this.vy = p.deltaPosition.x * 0.03;
                    this.rotation.y += this.vy;
                } else {
                    if (this.vy) {
                        this.rotation.y += this.vy;
                        this.vy *= 0.95;
                        if (Math.abs(this.vy) < 0.1) {
                            this.vy = 0;
                        }
                    }
                }
            });
        console.log(kirara.threeObject);

        // tweenerも使える
        kirara.tweener.clear()
            .to({ scaleY: 0.9 }, 300, "easeInBack")
            .to({ scaleY: 1.0 }, 300, "easeOutBack")
            .setLoop(true);

        // 2Dスプライトとの併用も可能
        for (var i = 0; i < 10; i++) {
            var hiyoko = tm.display.Sprite("hiyoko", 32, 32)
                .setScale(4)
                .setPosition(Math.rand(0, 640), Math.rand(0, 940))
                .setRotation(Math.rand(0, 360))
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
    }
});
```
