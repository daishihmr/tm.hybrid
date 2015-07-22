/*
 * scene.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./threeelement");
    // require("./camera");
    // require("./ambientlight");
    // require("./directionallight");

    tm.define("tm.hybrid.Scene", {
        superClass: "tm.app.Scene",

        two: null,
        three: null,

        effectComposer: null,

        /**
         * @constructor tm.hybrid.Scene
         * @extends {tm.app.Scene}
         * @mixes THREE.Scene
         *
         * @property {THREE.PerspectiveCamera} camera
         * @property {THREE.DirectionalLight} directionalLight
         * @property {THREE.AmbientLight} ambientLight
         * @property {THREE.EffectComposer} effectComposer
         * @property {THREE.Color} fogColor
         * @property {number} fogNear
         * @property {number} fogFar
         * @property {Object} two
         * @property {Object} three
         */
        init: function() {
            this.superInit();
            this.two = this;
            this.three = tm.hybrid.Scene.Three();

            // TODO どう扱うか
            this.effectComposer = null;

            this.on("enter", function(e) {
                this.camera.aspect = e.app.width / e.app.height;
            });
        },

        render: function(renderer) {
            if (this.effectComposer && this.effectComposer.passes.length > 1) {
                this.effectComposer.render();
            } else {
                renderer.render(this.three.scene, this.three.camera.threeObject);
            }
        },

        addChild: function(child) {
            if (child instanceof tm.hybrid.ThreeElement) {
                this.three.addChild(child);
            } else {
                tm.app.Scene.prototype.addChild.call(this, child);
            }
        },

        removeChild: function(child) {
            if (child instanceof tm.hybrid.ThreeElement) {
                this.three.removeChild(child);
            } else {
                tm.app.Scene.prototype.removeChild.call(this, child);
            }
        },
        
        enableEffectComposer: function() {
            if (THREE.EffectComposer && THREE.RenderPass) {

                var renderTarget = new THREE.WebGLRenderTarget(this.app.width, this.app.height, {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBFormat,
                    stencilBuffer: false,
                });
                var renderPass = new THREE.RenderPass(this.three.scene, this.three.camera.threeObject);

                this.effectComposer = new THREE.EffectComposer(this.app.threeRenderer, renderTarget);
                this.effectComposer.addPass(renderPass);

                return true;
            } else {
                return false;
            }
        },
    });
    tm.hybrid.Scene.prototype.accessor("camera", {
        get: function() {
            return this.three.camera;
        },
        set: function(v) {
            this.three.camera = v;
        },
    });
    tm.hybrid.Scene.prototype.getCamera = function() { return this.camera };
    tm.hybrid.Scene.prototype.setCamera = function(v) { this.camera = v; return this };

    tm.hybrid.Scene.prototype.accessor("ambientLight", {
        get: function() {
            return this.three.ambientLight;
        },
        set: function(v) {
            this.three.ambientLight = v;
        },
    });
    tm.hybrid.Scene.prototype.getAmbientLight = function() { return this.ambientLight };
    tm.hybrid.Scene.prototype.setAmbientLight = function(v) { this.ambientLight = v; return this };

    tm.hybrid.Scene.prototype.accessor("directionalLight", {
        get: function() {
            return this.three.directionalLight;
        },
        set: function(v) {
            this.three.directionalLight = v;
        },
    });
    tm.hybrid.Scene.prototype.getDirectionalLight = function() { return this.directionalLight };
    tm.hybrid.Scene.prototype.setDirectionalLight = function(v) { this.directionalLight = v; return this };

    tm.hybrid.Scene.prototype.accessor("fog", {
        get: function() {
            return this.three.scene.fog;
        },
        set: function(v) {
            this.three.scene.fog = v;
        },
    });
    tm.hybrid.Scene.prototype.isFog = function() { return this.fog };
    tm.hybrid.Scene.prototype.setFog = function(v) { this.fog = v; return this };

    tm.hybrid.Scene.prototype.accessor("fogColor", {
        get: function() {
            return this.three.scene.fog.color;
        },
        set: function(v) {
            this.three.scene.fog.color = v;
        },
    });
    tm.hybrid.Scene.prototype.getFogColor = function() { return this.fogColor };
    tm.hybrid.Scene.prototype.setFogColor = function(v) { this.fogColor = v; return this };

    tm.hybrid.Scene.prototype.accessor("fogNear", {
        get: function() {
            return this.three.scene.fog.near;
        },
        set: function(v) {
            this.three.scene.fog.near = v;
        },
    });
    tm.hybrid.Scene.prototype.getFogNear = function() { return this.fogNear };
    tm.hybrid.Scene.prototype.setFogNear = function(v) { this.fogNear = v; return this };

    tm.hybrid.Scene.prototype.accessor("fogFar", {
        get: function() {
            return this.three.scene.fog.far;
        },
        set: function(v) {
            this.three.scene.fog.far = v;
        },
    });
    tm.hybrid.Scene.prototype.getFogFar = function() { return this.fogFar };
    tm.hybrid.Scene.prototype.setFogFar = function(v) { this.fogFar = v; return this };

    tm.hybrid.Scene.prototype.accessor("overrideMaterial", {
        get: function() {
            return this.three.scene.overrideMaterial;
        },
        set: function(v) {
            this.three.scene.overrideMaterial = v;
        },
    });
    tm.hybrid.Scene.prototype.getOverrideMaterial = function() { return this.overrideMaterial };
    tm.hybrid.Scene.prototype.setOverrideMaterial = function(v) { this.overrideMaterial = v; return this };

    tm.hybrid.Scene.prototype.accessor("autoUpdate", {
        get: function() {
            return this.three.scene.autoUpdate;
        },
        set: function(v) {
            this.three.scene.autoUpdate = v;
        },
    });
    tm.hybrid.Scene.prototype.isAutoUpdate = function() { return this.autoUpdate };
    tm.hybrid.Scene.prototype.setAutoUpdate = function(v) { this.autoUpdate = v; return this };

    tm.define("tm.hybrid.Scene.Three", {
        superClass: "tm.hybrid.ThreeElement",

        init: function() {
            this.superInit(new THREE.Scene());

            this.scene = this.threeObject;
            this.scene.fog = new THREE.Fog(0xffffff, 1000, 5000);

            this.camera = tm.hybrid.Camera();
            this.camera.z = 7;

            this.ambientLight = tm.hybrid.AmbientLight(0x888888)
                .addChildTo(this);

            this.directionalLight = tm.hybrid.DirectionalLight(0xffffff, 1)
                .setPosition(1, 1, 1)
                .addChildTo(this);
        },
    });
})();
