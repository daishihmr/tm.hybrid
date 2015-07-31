/*
The MIT License (MIT)

Copyright (c) 2015 daishi_hmr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/*
 * delegateuril.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");

    tm.define("tm.hybrid.DelegateUtil", {
        init: function(type) {
            this.type = type;
        },
        property: function(name, threeProperty) {
            if (threeProperty) {
                this.type.prototype.accessor(name, {
                    get: function() {
                        return this.threeObject[threeProperty][name];
                    },
                    set: function(v) {
                        this.threeObject[threeProperty][name] = v;
                    }
                });
            } else {
                this.type.prototype.accessor(name, {
                    get: function() {
                        return this.threeObject[name];
                    },
                    set: function(v) {
                        this.threeObject[name] = v;
                    }
                });
            }

            this.type.defineInstanceMethod(createSetterName(name), function(v) {
                this[name] = v;
                return this;
            });
        },
        method: function(name, returnThis, threeProperty) {
            if (threeProperty) {
                this.type.defineInstanceMethod(name, function() {
                    var r = this.threeObject[threeProperty][name].apply(this.threeObject[threeProperty], arguments);
                    if (returnThis) {
                        return this;
                    } else {
                        return r;
                    }
                });
            } else {
                this.type.defineInstanceMethod(name, function() {
                    var r = this.threeObject[name].apply(this.threeObject, arguments);
                    if (returnThis) {
                        return this;
                    } else {
                        return r;
                    }
                });
            }
        },
    });

    function createSetterName(propertyName) {
        return "set" + propertyName[0].toUpperCase() + propertyName.substring(1);
    }
})();

/*
 * threeelement.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");

    tm.define("tm.hybrid.ThreeElement", {
        superClass: "tm.app.Element",

        /**
         * @constructor tm.hybrid.ThreeElement
         * @param {THREE.Object3D} threeObject
         * @extends {tm.app.Element}
         * @mixes THREE.Object3D
         *
         * @property {number} x
         * @property {number} y
         * @property {number} z
         * @property {number} scaleX
         * @property {number} scaleY
         * @property {number} scaleZ
         * @property {number} rotationX
         * @property {number} rotationY
         * @property {number} rotationZ
         * @property {THREE.Vector3} forwardVector readonly
         * @property {THREE.Vector3} sidewardVector readonly
         * @property {THREE.Vector3} upwardVector readonly
         */
        init: function(threeObject) {
            this.superInit();

            this.threeObject = threeObject || new THREE.Object3D();
        },

        addChild: function(child) {
            if (child.parent) child.remove();
            child.parent = this;
            this.children.push(child);

            if (child instanceof tm.hybrid.ThreeElement) {
                this.threeObject.add(child.threeObject);
            }

            var e = tm.event.Event("added");
            child.dispatchEvent(e);

            return child;
        },

        removeChild: function(child) {
            var index = this.children.indexOf(child);
            if (index != -1) {
                this.children.splice(index, 1);

                if (child instanceof tm.hybrid.ThreeElement) {
                    this.threeObject.remove(child.threeObject);
                }

                var e = tm.event.Event("removed");
                child.dispatchEvent(e);
            }
        },

        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} x
         * @param {number} y
         * @param {number} z
         */
        setPosition: function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        },

        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} delta
         */
        ahead: function(delta) {
            this.threeObject.position.add(this.forwardVector.multiplyScalar(delta));
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} delta
         */
        sideStep: function(delta) {
            this.threeObject.position.add(this.sidewardVector.multiplyScalar(delta));
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} delta
         */
        elevate: function(delta) {
            this.threeObject.position.add(this.upwardVector.multiplyScalar(delta));
            return this;
        },

        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} x
         * @param {number} y
         * @param {number} z
         */
        setRotation: function(x, y, z) {
            this.rotationX = x;
            this.rotationY = y;
            this.rotationZ = z;
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} x
         */
        setRotationX: function(x) {
            this.rotationX = x;
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} y
         */
        setRotationY: function(y) {
            this.rotationY = y;
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} z
         */
        setRotationZ: function(z) {
            this.rotationZ = z;
            return this;
        },

        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} degree
         */
        rotatePitch: function(degree) {
            var q = tempQuat.setFromAxisAngle(V3_RIGHT, degree * Math.DEG_TO_RAD);
            this.quaternion.multiply(q);
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} degree
         */
        rotateYaw: function(degree) {
            var q = tempQuat.setFromAxisAngle(V3_UP, degree * Math.DEG_TO_RAD);
            this.quaternion.multiply(q);
            return this;
        },
        /**
         * @method
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} degree
         */
        rotateRoll: function(degree) {
            var q = tempQuat.setFromAxisAngle(V3_FORWARD, degree * Math.DEG_TO_RAD);
            this.quaternion.multiply(q);
            return this;
        },

        /**
         * @memberOf tm.hybrid.ThreeElement.prototype
         * @param {number} x
         * @param {number=} y
         * @param {number=} z
         */
        setScale: function(x, y, z) {
            if (arguments.length === 1) {
                y = x;
                z = x;
            }
            this.scaleX = x;
            this.scaleY = y;
            this.scaleZ = z;
            return this;
        },

        show: function() {
            this.visible = true;
            return this;
        },
        hide: function() {
            this.visible = false;
            return this;
        },
    });

    var V3_RIGHT = new THREE.Vector3(1, 0, 0);
    var V3_UP = new THREE.Vector3(0, 1, 0);
    var V3_FORWARD = new THREE.Vector3(0, 0, 1);
    var tempQuat = new THREE.Quaternion();

    var delegater = tm.hybrid.DelegateUtil(tm.hybrid.ThreeElement);

    delegater.property("id");
    delegater.property("uuid");
    delegater.property("name");

    tm.hybrid.ThreeElement.prototype.accessor("position", {
        get: function() {
            return this.threeObject.position;
        },
        set: function(v) {
            this.threeObject.position = v;
        }
    });
    delegater.property("x", "position");
    delegater.property("y", "position");
    delegater.property("z", "position");

    tm.hybrid.ThreeElement.prototype.accessor("scale", {
        get: function() {
            return this.threeObject.scale;
        },
        set: function(v) {
            this.threeObject.scale = v;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("scaleX", {
        get: function() {
            return this.threeObject.scale.x;
        },
        set: function(v) {
            this.threeObject.scale.x = v;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("scaleY", {
        get: function() {
            return this.threeObject.scale.y;
        },
        set: function(v) {
            this.threeObject.scale.y = v;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("scaleZ", {
        get: function() {
            return this.threeObject.scale.z;
        },
        set: function(v) {
            this.threeObject.scale.z = v;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("rotation", {
        get: function() {
            return this.threeObject.rotation;
        },
        set: function(v) {
            this.threeObject.rotation = v;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("rotationX", {
        get: function() {
            return this.threeObject.rotation.x * Math.RAD_TO_DEG;
        },
        set: function(v) {
            this.threeObject.rotation.x = v * Math.DEG_TO_RAD;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("rotationY", {
        get: function() {
            return this.threeObject.rotation.y * Math.RAD_TO_DEG;
        },
        set: function(v) {
            this.threeObject.rotation.y = v * Math.DEG_TO_RAD;
        }
    });
    tm.hybrid.ThreeElement.prototype.accessor("rotationZ", {
        get: function() {
            return this.threeObject.rotation.z * Math.RAD_TO_DEG;
        },
        set: function(v) {
            this.threeObject.rotation.z = v * Math.DEG_TO_RAD;
        }
    });

    tm.hybrid.ThreeElement.prototype.getter("forwardVector", function() {
        if (this._forwardVector == null) this._forwardVector = new THREE.Vector3();
        this._forwardVector.set(0, 0, 1);
        this._forwardVector.applyQuaternion(this.quaternion);
        return this._forwardVector;
    });
    tm.hybrid.ThreeElement.prototype.getter("sidewardVector", function() {
        if (this._sidewardVector == null) this._sidewardVector = new THREE.Vector3();
        this._sidewardVector.set(1, 0, 0);
        this._sidewardVector.applyQuaternion(this.quaternion);
        return this._sidewardVector;
    });
    tm.hybrid.ThreeElement.prototype.getter("upwardVector", function() {
        if (this._upVector == null) this._upVector = new THREE.Vector3();
        this._upVector.set(0, 1, 0);
        this._upVector.applyQuaternion(this.quaternion);
        return this._upVector;
    });
    
    delegater.property("up");
    delegater.property("quaternion");
    delegater.property("visible");
    delegater.property("castShadow");
    delegater.property("receiveShadow");
    delegater.property("frustumCulled");
    delegater.property("matrixAutoUpdate");
    delegater.property("matrixWorldNeedsUpdate");
    delegater.property("rotationAutoUpdate");
    delegater.property("userData");
    delegater.property("matrixWorld");

    delegater.method("applyMatrix", true);
    delegater.method("translateX", true);
    delegater.method("translateY", true);
    delegater.method("translateZ", true);
    delegater.method("localToWorld");
    delegater.method("worldToLocal");
    delegater.method("lookAt", true);
    delegater.method("traverse", true);
    delegater.method("traverseVisible", true);
    delegater.method("traverseAncestors", true);
    delegater.method("updateMatrix", true);
    delegater.method("updateMatrixWorld", true);
    delegater.method("getObjectByName");
    delegater.method("rotateOnAxis", true);

    tm.hybrid.ThreeElement.prototype.localToGlobal = tm.hybrid.ThreeElement.prototype.localToWorld;
    tm.hybrid.ThreeElement.prototype.globalToLocal = tm.hybrid.ThreeElement.prototype.worldToLocal;

})();

/*
 * mesh.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    tm.define("tm.hybrid.Mesh", {
        superClass: "tm.hybrid.ThreeElement",

        /**
         * @constructor tm.hybrid.Mesh
         * @param {THREE.Mesh} mesh
         * @extends {tm.hybrid.ThreeElement}
         * @mixes THREE.Mesh
         */
        init: function(mesh) {
            if (typeof(mesh) === "string") {
                var asset = tm.asset.Manager.get(mesh);
                if (asset) {
                    if (asset instanceof tm.asset.ThreeJSON) {
                        this.superInit(asset.mesh.clone());
                    } else if (asset instanceof tm.asset.Vox) {
                        this.superInit(asset.mesh.clone());
                    } else if (asset instanceof tm.asset.MQO) {
                        this.superInit(asset.model.meshes[0]);
                        for (var i = 1; i < asset.model.meshes.length; i++) {
                            tm.hybrid.Mesh(asset.model.meshes[i]).addChildTo(this);
                        }
                    }
                } else {
                    console.error("アセット'{0}'がないよ".format(mesh));
                }
            } else if (mesh instanceof THREE.Mesh) {
                this.superInit(mesh);
            } else if (mesh instanceof THREE.Geometry) {
                if (arguments.length >= 2) {
                    this.superInit(new THREE.Mesh(mesh, arguments[1]));
                } else {
                    this.superInit(new THREE.Mesh(mesh));
                }
            } else {
                this.superInit(new THREE.Mesh());
            }
        },
    });

    var delegater = tm.hybrid.DelegateUtil(tm.hybrid.Mesh);

    /**
     * @method
     * @memberOf tm.hybrid.Mesh.prototype
     * @param {THREE.Geometry} geometry
     * @returns this
     */
    function setGeometry() {}
    delegater.property("geometry");

    /**
     * @method
     * @memberOf tm.hybrid.Mesh.prototype
     * @param {THREE.Material} material
     * @returns this
     */
    function setMaterial() {}
    delegater.property("material");

    delegater.method("getMorphTargetIndexByName", true);
    delegater.method("updateMorphTargets", true);

})();

/*
 * camera.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    tm.define("tm.hybrid.Camera", {
        superClass: "tm.hybrid.ThreeElement",

        init: function() {
            this.superInit(new THREE.PerspectiveCamera(45, 1, 1, 20000));
        },

        isInSight: function(obj) {
            tempVector.setFromMatrixPosition(obj.matrixWorld).project(this);
            return -1 <= tempVector.x && tempVector.x <= 1 && -1 <= tempVector.y && tempVector.y <= 1;
        },
    });

    var tempVector = new THREE.Vector3();

    var delegater = tm.hybrid.DelegateUtil(tm.hybrid.Camera);

    delegater.property("matrixWorldInverse");
    delegater.property("projectionMatrix");
    tm.hybrid.Camera.prototype.accessor("fov", {
        get: function() {
            return this.threeObject.fov;
        },
        set: function(v) {
            this.threeObject.fov = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.Camera.defineInstanceMethod("setFov", function(v) {
        this.fov = v;
        return this;
    });

    tm.hybrid.Camera.prototype.accessor("aspect", {
        get: function() {
            return this.threeObject.aspect;
        },
        set: function(v) {
            this.threeObject.aspect = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.Camera.defineInstanceMethod("setAspect", function(v) {
        this.aspect = v;
        return this;
    });

    tm.hybrid.Camera.prototype.accessor("near", {
        get: function() {
            return this.threeObject.near;
        },
        set: function(v) {
            this.threeObject.near = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.Camera.defineInstanceMethod("setNear", function(v) {
        this.near = v;
        return this;
    });

    tm.hybrid.Camera.prototype.accessor("far", {
        get: function() {
            return this.threeObject.far;
        },
        set: function(v) {
            this.threeObject.far = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.Camera.defineInstanceMethod("setFar", function(v) {
        this.far = v;
        return this;
    });

})();

/*
 * othrocamera.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./threeelement");

    tm.define("tm.hybrid.OrthoCamera", {
        superClass: "tm.hybrid.ThreeElement",

        init: function() {
            this.superInit(new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10000));
        },
    });

    tm.hybrid.OrthoCamera.prototype.accessor("left", {
        get: function() {
            return this.threeObject.left;
        },
        set: function(v) {
            this.threeObject.left = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.OrthoCamera.prototype.accessor("right", {
        get: function() {
            return this.threeObject.right;
        },
        set: function(v) {
            this.threeObject.right = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.OrthoCamera.prototype.accessor("top", {
        get: function() {
            return this.threeObject.top;
        },
        set: function(v) {
            this.threeObject.top = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.OrthoCamera.prototype.accessor("bottom", {
        get: function() {
            return this.threeObject.bottom;
        },
        set: function(v) {
            this.threeObject.bottom = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.OrthoCamera.prototype.accessor("near", {
        get: function() {
            return this.threeObject.near;
        },
        set: function(v) {
            this.threeObject.near = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    tm.hybrid.OrthoCamera.prototype.accessor("far", {
        get: function() {
            return this.threeObject.far;
        },
        set: function(v) {
            this.threeObject.far = v;
            this.threeObject.updateProjectionMatrix();
        },
    });

})();

/*
 * shape.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./mesh");

    tm.define("tm.hybrid.PlaneMesh", {
        superClass: "tm.hybrid.Mesh",

        init: function(geometryParam, materialParam) {
            geometryParam = {}.$extend(tm.hybrid.PlaneMesh.DEFAULT_GEOMETRY_PARAM, geometryParam);
            materialParam = {}.$extend(tm.hybrid.PlaneMesh.DEFAULT_MATERIAL_PARAM, materialParam);
            var geo = new THREE.PlaneGeometry(geometryParam.width, geometryParam.height, geometryParam.widthSegments, geometryParam.heightSegments);
            var mat = new THREE.MeshPhongMaterial(materialParam);
            this.superInit(new THREE.Mesh(geo, mat));
        },
    });
    tm.hybrid.PlaneMesh.DEFAULT_GEOMETRY_PARAM = {
        width: 1,
        height: 1,
        widthSegments: 1,
        heightSegments: 1,
    };
    tm.hybrid.PlaneMesh.DEFAULT_MATERIAL_PARAM = {
        color: 0xffffff,
    };

    tm.define("tm.hybrid.BoxMesh", {
        superClass: "tm.hybrid.Mesh",

        init: function(geometryParam, materialParam) {
            geometryParam = {}.$extend(tm.hybrid.BoxMesh.DEFAULT_GEOMETRY_PARAM, geometryParam);
            materialParam = {}.$extend(tm.hybrid.BoxMesh.DEFAULT_MATERIAL_PARAM, materialParam);
            var geo = new THREE.BoxGeometry(geometryParam.width, geometryParam.height, geometryParam.depth, geometryParam.widthSegments, geometryParam.heightSegments, geometryParam.depthSegments);
            var mat = new THREE.MeshPhongMaterial(materialParam);
            this.superInit(new THREE.Mesh(geo, mat));
        },
    });
    tm.hybrid.BoxMesh.DEFAULT_GEOMETRY_PARAM = {
        width: 1,
        height: 1,
        depth: 1,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
    };
    tm.hybrid.BoxMesh.DEFAULT_MATERIAL_PARAM = {
        color: 0xffffff,
    };

})();

/*
 * sprite.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./threeelement");

    tm.define("tm.hybrid.Sprite", {
        superClass: "tm.hybrid.ThreeElement",

        init: function(image, xCellSize, yCellSize) {

            var imageName = null;
            var spriteMaterial = null;

            if (typeof(image) === "string") {
                imageName = image;
                spriteMaterial = tm.hybrid.Sprite.materialCache[image];
                if (!spriteMaterial) {
                    image = tm.asset.Manager.get(image);
                    if (!image) {
                        console.error("アセット{0}がないよ".format(image));
                    }
                }
            } else {
                if (!image.id) {
                    image.id = THREE.Math.generateUUID();
                }
                imageName = image.id;
            }

            if (!spriteMaterial) {
                var texture = new THREE.Texture(image.element);
                texture.needsUpdate = true;
                // texture.sourceAssetName = imageName;

                spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    color: 0xffffff,
                    fog: true,
                });

                tm.hybrid.Sprite.materialCache[imageName] = spriteMaterial;
            }

            xCellSize = xCellSize || 1;
            yCellSize = yCellSize || 1;

            this.superInit(new THREE.Sprite(spriteMaterial));
        },
    });

    tm.hybrid.Sprite.materialCache = {};

})();

/*
 * texture.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");

    tm.hybrid = tm.hybrid || {};

    tm.hybrid.Texture = function(image, mapping) {
        if (typeof image === "string") {
            image = tm.asset.Manager.get(image).element;
        } else if (image instanceof tm.graphics.Canvas || image instanceof tm.asset.Texture) {
            image = image.element;
        }

        var texture = new THREE.Texture(image, mapping);
        texture.needsUpdate = true;
        return texture;
    };
})();

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

/** @namespace */
var tm = tm || {};
/** @namespace */
tm.hybrid = tm.hybrid || {};

/*
 * hybridapp.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./scene");
    
    tm.define("tm.hybrid.Application", {
        superClass: "tm.display.CanvasApp",

        threeRenderer: null,
        threeCanvas: null,

        /**
         * @constructor tm.hybrid.Application
         * @param {HTMLCanvasElement|String} canvas2d canvas element or id for draw 2d graphics
         * @param {HTMLCanvasElement|String} canvas3d canvas element or id for draw 3d graphics
         * @extends {tm.display.CanvasApp}
         *
         * @property {THREE.WebGLRenderer} threeRenderer
         * @property {HTMLCanvasElement} threeCanvas
         */
        init: function(canvas2d, canvas3d) {
            this.superInit(canvas2d);
            this.setupThree(canvas3d);
            this.background = "transparent";

            this.replaceScene(tm.hybrid.Scene())
        },

        /**
         * @memberOf tm.hybrid.Application.prototype
         * @private
         */
        setupThree: function(canvas3d) {
            var param = {
                antialias: true,
            };
            if (canvas3d) {
                if (canvas3d instanceof HTMLCanvasElement) {
                    param.canvas = canvas3d;
                } else if (typeof canvas3d === "string") {
                    param.canvas = document.querySelector(canvas3d);
                }
            }
            this.threeRenderer = new THREE.WebGLRenderer(param);
            this.threeRenderer.setClearColor("0x000000");

            // if (this.element.parentNode) {
            //     this.element.parentNode.insertBefore(this.threeRenderer.domElement, this.element);
            // } else {
            //     window.document.body.appendChild(this.threeRenderer.domElement);
            // }

            this.threeCanvas = this.threeRenderer.domElement;
        },

        fitWindow: function(everFlag) {
            var _fitFunc = function() {
                everFlag = everFlag === undefined ? true : everFlag;
                var e = this.threeCanvas;
                var s = e.style;

                s.position = "absolute";
                s.margin = "auto";
                s.left = "0px";
                s.top = "0px";
                s.bottom = "0px";
                s.right = "0px";

                var rateWidth = e.width / window.innerWidth;
                var rateHeight = e.height / window.innerHeight;
                var rate = e.height / e.width;

                if (rateWidth > rateHeight) {
                    s.width = innerWidth + "px";
                    s.height = innerWidth * rate + "px";
                } else {
                    s.width = innerHeight / rate + "px";
                    s.height = innerHeight + "px";
                }
            }.bind(this);

            // 一度実行しておく
            _fitFunc();
            // リサイズ時のリスナとして登録しておく
            if (everFlag) {
                window.addEventListener("resize", _fitFunc, false);
            }

            return tm.display.CanvasApp.prototype.fitWindow.call(this, everFlag);
        },

        _update: function() {
            tm.app.CanvasApp.prototype._update.call(this);
            var scene = this.currentScene;
            if (this.awake && scene instanceof tm.hybrid.Scene) {
                this.updater.update(scene.three.camera);
                this.updater.update(scene.three);
            }
        },

        _draw: function() {
            tm.display.CanvasApp.prototype._draw.call(this);
            var scene = this.currentScene;
            if (scene instanceof tm.hybrid.Scene) {
                scene.render(this.threeRenderer);
            }
        },

        resize: function(w, h) {
            this.threeRenderer.setSize(w, h);
            var scene = this.currentScene;
            if (scene instanceof tm.hybrid.Scene) {
                scene.three.camera.aspect = w / h;
            }
            return tm.display.CanvasApp.prototype.resize.call(this, w, h);
        }
    });
})();

/*
 * colorconv.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");

    tm.hybrid = tm.hybrid || {};

    tm.hybrid.ColorConverter = {
        hsl: function(h, s, l) {
            if (arguments.length === 1 && typeof(arguments[0]) === "string") {
                var m = arguments[0].split(" ").join("").match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
                if (m) {
                    h = m[1];
                    s = m[2];
                    l = m[3];
                } else {
                    throw new Error("invalid argument " + arguments[0]);
                }
            }
            return new THREE.Color().setHSL(h / 360, s / 100, l / 100).getHex();
        },
    };
})();

/*
 * ambientlight.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    tm.define("tm.hybrid.AmbientLight", {
        superClass: "tm.hybrid.ThreeElement",

        init: function(hex) {
            hex = hex || 0xffffff;
            this.superInit(new THREE.AmbientLight(hex));
        },
    });

    var delegater = tm.hybrid.DelegateUtil(tm.hybrid.AmbientLight);

    delegater.property("color");
})();

/*
 * directionallight.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    tm.define("tm.hybrid.DirectionalLight", {
        superClass: "tm.hybrid.ThreeElement",

        init: function(hex, intensity) {
            hex = hex || 0xffffff;
            intensity = intensity || 1.0;
            this.superInit(new THREE.DirectionalLight(hex, intensity));
        },
    });

    var delegater = tm.hybrid.DelegateUtil(tm.hybrid.DirectionalLight);

    delegater.property("target");
    delegater.property("intensity");
    delegater.property("onlyShadow");
    delegater.property("shadowCameraNear");
    delegater.property("shadowCameraFar");
    delegater.property("shadowCameraLeft");
    delegater.property("shadowCameraRight");
    delegater.property("shadowCameraTop");
    delegater.property("shadowCameraBottom");
    delegater.property("shadowCameraVisible");
    delegater.property("shadowBias");
    delegater.property("shadowDarkness");
    delegater.property("shadowMapWidth");
    delegater.property("shadowMapHeight");
    delegater.property("shadowCascade");
    delegater.property("shadowCascadeOffset");
    delegater.property("shadowCascadeCount");
    delegater.property("shadowCascadeBias");
    delegater.property("shadowCascadeWidth");
    delegater.property("shadowCascadeHeight");
    delegater.property("shadowCascadeNearZ");
    delegater.property("shadowCascadeFarZ");
    delegater.property("shadowCascadeArray");
    delegater.property("shadowMap");
    delegater.property("shadowMapSize");
    delegater.property("shadowCamera");
    delegater.property("shadowMatrix");
})();

/*
 * utils.js
 */

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");

    tm.hybrid = tm.hybrid || {};

    tm.hybrid.Utils = {
        
    };
})();

/*
 * effect.js
 */
(function() {
    
    tm.hybrid = tm.hybrid || {};
    
    tm.hybrid.EffectModules = [

        "postprocessing/AdaptiveToneMappingPass",
        "postprocessing/BloomPass",
        "postprocessing/BokehPass",
        "postprocessing/DotScreenPass",
        "postprocessing/EffectComposer",
        "postprocessing/FilmPass",
        "postprocessing/GlitchPass",
        "postprocessing/MaskPass",
        "postprocessing/RenderPass",
        "postprocessing/SavePass",
        "postprocessing/ShaderPass",
        "postprocessing/TexturePass",

        "shaders/BasicShader",
        "shaders/BleachBypassShader",
        "shaders/BlendShader",
        "shaders/BokehShader",
        "shaders/BokehShader2",
        "shaders/BrightnessContrastShader",
        "shaders/ColorCorrectionShader",
        "shaders/ColorifyShader",
        "shaders/ConvolutionShader",
        "shaders/CopyShader",
        "shaders/DOFMipMapShader",
        "shaders/DigitalGlitch",
        "shaders/DotScreenShader",
        "shaders/EdgeShader",
        "shaders/EdgeShader2",
        "shaders/FXAAShader",
        "shaders/FilmShader",
        "shaders/FocusShader",
        "shaders/FresnelShader",
        "shaders/HorizontalBlurShader",
        "shaders/HorizontalTiltShiftShader",
        "shaders/HueSaturationShader",
        "shaders/KaleidoShader",
        "shaders/LuminosityShader",
        "shaders/MirrorShader",
        "shaders/NormalDisplacementShader",
        "shaders/NormalMapShader",
        "shaders/OceanShaders",
        "shaders/ParallaxShader",
        "shaders/RGBShiftShader",
        "shaders/SSAOShader",
        "shaders/SepiaShader",
        "shaders/TechnicolorShader",
        "shaders/ToneMapShader",
        "shaders/TriangleBlurShader",
        "shaders/UnpackDepthRGBAShader",
        "shaders/VerticalBlurShader",
        "shaders/VerticalTiltShiftShader",
        "shaders/VignetteShader",
        
    ].reduce(function(obj, _) {
        var url = "https://cdn.rawgit.com/mrdoob/three.js/r71/examples/js/" + _ + ".js";
        obj[url] = url;
        return obj;
    }, {});

})();

/*
 * geom.js
 */

(function() {
    
    tm.geom.Vector2.prototype.toThree = function() {
        return new THREE.Vector2(this.x, this.y);
    };
    THREE.Vector2.prototype.toTm = function() {
        return tm.geom.Vector2(this.x, this.y);
    };
    
    tm.geom.Vector3.prototype.toThree = function() {
        return new THREE.Vector3(this.x, this.y, this.z);
    };
    THREE.Vector3.prototype.toTm = function() {
        return tm.geom.Vector3(this.x, this.y, this.z);
    };
    
    tm.geom.Matrix33.prototype.toThree = function() {
        return new THREE.Matrix3(
            this.m00, this.m01, this.m02,
            this.m10, this.m11, this.m12,
            this.m20, this.m21, this.m22
        );
    };
    THREE.Matrix3.prototype.toTm = function() {
        var e = this.elements;
        return tm.geom.Matrix33(
            e[0], e[3], e[6],
            e[1], e[4], e[7],
            e[2], e[5], e[8]
        );
    };
    
    tm.geom.Matrix44.prototype.toThree = function() {
        return new THREE.Matrix4(
            this.m00, this.m01, this.m02, this.m03,
            this.m10, this.m11, this.m12, this.m13,
            this.m20, this.m21, this.m22, this.m23,
            this.m30, this.m31, this.m32, this.m33
        );
    };
    THREE.Matrix4.prototype.toTm = function() {
        var e = this.elements;
        return tm.geom.Matrix44(
            e[0], e[4], e[8], e[12],
            e[1], e[5], e[9], e[13],
            e[2], e[6], e[10], e[14],
            e[3], e[7], e[11], e[15]
        );
    };
    
})();

/*
 * particlesystem.js
 */
(function() {

    tm.define("tm.hybrid.ParticleSystem", {
        superClass: "tm.hybrid.ThreeElement",

        init: function(param) {
            this.param = {}.$extend(tm.hybrid.ParticleSystem.DEFAULT_PARAM, param);

            this.geometry = this._createGeometry(this.param);
            this.material = this._createMaterial(this.param);
            this.superInit(new THREE.PointCloud(this.geometry, this.material));

            this.particles = [];
            for (var i = 0; i < this.param.count; i++) {
                this.particles.push({
                    startTime: 0,
                    endTime: -1,
                    positionFrom: [0, 10000, 0],
                    positionTo: [0, 10000, 0],
                    index: i,
                });
            }

            this.now = 0;
            this.needsUpdate = false;
        },

        _createGeometry: function(param) {
            var geometry = new THREE.BufferGeometry();

            var count = param.count;

            var startTime = new Float32Array(count);
            var endTime = new Float32Array(count);
            var positionFrom = new Float32Array(count * 3);
            var positionTo = new Float32Array(count * 3);
            var positionEasing = new Int32Array(count);
            var sizeInfo = new Float32Array(count * 3);
            var texRotInfo = new Float32Array(count * 3);
            var redInfo = new Float32Array(count * 3);
            var greenInfo = new Float32Array(count * 3);
            var blueInfo = new Float32Array(count * 3);
            var alphaInfo = new Float32Array(count * 3);
            var texRot = new Float32Array(count);

            var vec = new THREE.Vector3();
            for (var i = 0; i < count; i++) {

                startTime[i] = 0;
                endTime[i] = -1;

                positionFrom[i * 3 + 0] = 0;
                positionFrom[i * 3 + 1] = 0;
                positionFrom[i * 3 + 2] = 0;

                positionTo[i * 3 + 0] = 0;
                positionTo[i * 3 + 1] = 0;
                positionTo[i * 3 + 2] = 0;

                sizeInfo[i * 3 + 0] = param.sizeFrom;
                sizeInfo[i * 3 + 1] = param.sizeTo;
                sizeInfo[i * 3 + 2] = param.sizeDuration;

                texRotInfo[i * 3 + 0] = param.texRotFrom;
                texRotInfo[i * 3 + 1] = param.texRotTo;
                texRotInfo[i * 3 + 2] = param.texRotDuration;

                redInfo[i * 3 + 0] = param.redFrom;
                redInfo[i * 3 + 1] = param.redTo;
                redInfo[i * 3 + 2] = param.redDuration;

                greenInfo[i * 3 + 0] = param.greenFrom;
                greenInfo[i * 3 + 1] = param.greenTo;
                greenInfo[i * 3 + 2] = param.greenDuration;

                blueInfo[i * 3 + 0] = param.blueFrom;
                blueInfo[i * 3 + 1] = param.blueTo;
                blueInfo[i * 3 + 2] = param.blueDuration;

                alphaInfo[i * 3 + 0] = param.alphaFrom;
                alphaInfo[i * 3 + 1] = param.alphaTo;
                alphaInfo[i * 3 + 2] = param.alphaDuration;
            }

            geometry.addAttribute("startTime", new THREE.BufferAttribute(startTime, 1));
            geometry.addAttribute("endTime", new THREE.BufferAttribute(endTime, 1));
            geometry.addAttribute("position", new THREE.BufferAttribute(positionFrom, 3));
            geometry.addAttribute("positionTo", new THREE.BufferAttribute(positionTo, 3));
            geometry.addAttribute("sizeInfo", new THREE.BufferAttribute(sizeInfo, 3));
            geometry.addAttribute("texRotInfo", new THREE.BufferAttribute(texRotInfo, 3));
            geometry.addAttribute("redInfo", new THREE.BufferAttribute(redInfo, 3));
            geometry.addAttribute("greenInfo", new THREE.BufferAttribute(greenInfo, 3));
            geometry.addAttribute("blueInfo", new THREE.BufferAttribute(blueInfo, 3));
            geometry.addAttribute("alphaInfo", new THREE.BufferAttribute(alphaInfo, 3));

            return geometry;
        },

        _createMaterial: function(param) {
            var material = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                attributes: {
                    startTime: {
                        type: "f",
                        value: null
                    },
                    endTime: {
                        type: "f",
                        value: null
                    },
                    positionTo: {
                        type: "v3",
                        value: null
                    },
                    sizeInfo: {
                        type: "v3",
                        value: null
                    },
                    texRotInfo: {
                        type: "v3",
                        value: null
                    },
                    redInfo: {
                        type: "v3",
                        value: null
                    },
                    greenInfo: {
                        type: "v3",
                        value: null
                    },
                    blueInfo: {
                        type: "v3",
                        value: null
                    },
                    alphaInfo: {
                        type: "v3",
                        value: null
                    },
                },
                uniforms: {
                    texture: {
                        type: "t",
                        value: param.texture
                    },
                    now: {
                        type: "f",
                        value: 0.0
                    },
                    positionEasing: {
                        type: "i",
                        value: param.easing
                    },
                    sizeEasing: {
                        type: "i",
                        value: param.sizeEasing
                    },
                    texRotEasing: {
                        type: "i",
                        value: param.texRotEasing
                    },
                    redEasing: {
                        type: "i",
                        value: param.redEasing
                    },
                    greenEasing: {
                        type: "i",
                        value: param.greenEasing
                    },
                    blueEasing: {
                        type: "i",
                        value: param.blueEasing
                    },
                    alphaEasing: {
                        type: "i",
                        value: param.alphaEasing
                    },
                },
                blending: param.blending,
                depthTest: false,
                depthWrite: false,
                transparent: true,
            });

            return material;
        },

        update: function(app) {
            this.now += 0.001;

            this._checkEnd();
            if (this.needsUpdate) {
                this._setAttributes();
                this.needsUpdate = false;
            }
            this._setUniforms();
        },

        _checkEnd: function() {
            var particles = this.particles;
            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];
                if (0 < p.endTime && p.endTime < this.now) {
                    p.startTime = 0;
                    p.endTime = -1;
                    p.positionFrom = [0, 10000, 0];
                    p.positionTo = [0, 10000, 0];
                    this.needsUpdate = true;
                }
            }
        },

        _setAttributes: function() {
            var particles = this.particles;
            var geometry = this.geometry;

            var startTimeAttrs = geometry.getAttribute("startTime");
            var endTimeAttrs = geometry.getAttribute("endTime");
            var positionFromAttrs = geometry.getAttribute("position");
            var positionToAttrs = geometry.getAttribute("positionTo");

            startTimeAttrs.needsUpdate = true;
            endTimeAttrs.needsUpdate = true;
            positionFromAttrs.needsUpdate = true;
            positionToAttrs.needsUpdate = true;

            var i = 0;
            var len = particles.length;
            for (; i < len; i++) {
                var p = particles[i];
                var index = p.index;
                startTimeAttrs.array[index] = p.startTime;
                endTimeAttrs.array[index] = p.endTime;

                var positionFrom = p.positionFrom;
                var positionTo = p.positionTo;

                positionFromAttrs.array[index * 3 + 0] = positionFrom[0];
                positionFromAttrs.array[index * 3 + 1] = positionFrom[1];
                positionFromAttrs.array[index * 3 + 2] = positionFrom[2];
                positionToAttrs.array[index * 3 + 0] = positionTo[0];
                positionToAttrs.array[index * 3 + 1] = positionTo[1];
                positionToAttrs.array[index * 3 + 2] = positionTo[2];
            }
        },

        _setUniforms: function() {
            var uniforms = this.material.uniforms;
            uniforms.now.value = this.now;
        },

        /**
         * @return {tm.hybrid.ParticleEmitter}
         */
        createEmitter: function() {
            return tm.hybrid.ParticleEmitter(this, this.param.emitterLife, this.param.emitPerFrame, this.param.emitterDamping).addChildTo(this.parent);
        },

        _emit: function(position) {
            var param = this.param;
            var particles = this.particles;

            var i = 0;
            var len = this.particles.length;
            for (; i < len; i++) {
                if (particles[i].endTime < this.now) break;
            }

            if (i === len) {
                // console.warn("パーティクルが足りない");
                return;
            }

            var p = particles[i];

            p.startTime = this.now;
            if (param.lifeRandom !== 0) {
                p.endTime = this.now + param.life * Math.randf(1 - param.lifeRandom, 1 + param.lifeRandom) * 0.001;
            } else {
                p.endTime = this.now + param.life * 0.001;
            }

            if (param.emitRange !== 0) {
                randomizeTempVector();
                tempVector.setLength(Math.randf(0, param.emitRange));
                p.positionFrom = [
                    position.x + tempVector.x,
                    position.y + tempVector.y,
                    position.z + tempVector.z,
                ];
            } else {
                p.positionFrom = [
                    position.x,
                    position.y,
                    position.z,
                ];
            }

            if (param.direction !== null) {
                tempVector.set(param.direction);
            } else {
                randomizeTempVector();
                tempVector.normalize();
            }

            if (param.distanceRandom !== 0) {
                tempVector.setLength(param.distance * Math.randf(1 - param.distanceRandom, 1 + param.distanceRandom));
            } else {
                tempVector.setLength(param.distance);
            }

            p.positionTo = [
                position.x + tempVector.x,
                position.y + tempVector.y,
                position.z + tempVector.z,
            ];

            this.needsUpdate = true;
        },
    });

    var tempVector = new THREE.Vector3();
    var randomizeTempVector = function() {
        tempVector.set(Math.randf(-1, 1), Math.randf(-1, 1), Math.randf(-1, 1));
        while (tempVector.lengthSq() > 1) {
            tempVector.set(Math.randf(-1, 1), Math.randf(-1, 1), Math.randf(-1, 1));
        }
        tempVector.normalize();
        return tempVector;
    };

    var DEFAULT_TEXTURE = (function() {
        var size = 256;

        var canvas = tm.graphics.Canvas()
            .resize(size, size)
            .setFillStyle(
                tm.graphics.RadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5)
                    .addColorStopList([
                        { offset: 0.00, color: "hsla(  0,  80%, 100%, 1.0)" },
                        { offset: 0.20, color: "hsla(  0,  80%, 100%, 1.0)" },
                        { offset: 1.00, color: "hsla(  0,  80%, 100%, 0.0)" },
                    ])
                    .toStyle()
            )
            .fillRect(0, 0, size, size);

        var texture = new THREE.Texture(canvas.element);
        texture.needsUpdate = true;
        return texture;
    })();

    var easing = tm.hybrid.ParticleSystem.easing = {
        LINEAR: 0,
        QUAD_IN: 1,
        QUAD_OUT: 2,
        QUAD_IN_OUT: 3,
        CUBIC_IN: 4,
        CUBIC_OUT: 5,
        CUBIC_IN_OUT: 6,
        QUARTIC_IN: 7,
        QUARTIC_OUT: 8, // iPhoneで動かない！！！
        QUARTIC_IN_OUT: 9,
        QINTIC_IN: 10,
        QINTIC_OUT: 11,
        QINTIC_IN_OUT: 12,
        SINE_IN: 13,
        SINE_OUT: 14,
        SINE_IN_OUT: 15,
        EXPONENTIAL_IN: 16,
        EXPONENTIAL_OUT: 17,
        EXPONENTIAL_IN_OUT: 18,
        CIRCULAR_IN: 19,
        CIRCULAR_OUT: 20,
        CIRCULAR_IN_OUT: 21,
        ELASTIC_IN: 22,
        ELASTIC_OUT: 23,
        ELASTIC_IN_OUT: 24,
        BACK_IN: 25,
        BACK_OUT: 26,
        BACK_IN_OUT: 27,
        BOUNCE_OUT: 28,
        BOUNCE_IN: 29,
        BOUNCE_IN_OUT: 30,
    };

    tm.hybrid.ParticleSystem.DEFAULT_PARAM = {
        /**
         * エミッタの寿命（フレーム）
         * @type {number}
         */
        emitterLife: 1,
        /**
         * 1フレームあたりのパーティクル生成数
         * @type {number}
         */
        emitPerFrame: 1,
        /**
         * 生成量の減衰率
         * @type {number}
         */
        emitterDamping: 1.0,
        
        /**
         * テクスチャ
         * @type {number}
         */
        texture: DEFAULT_TEXTURE,
        /**
         * 頂点数
         * @type {number}
         */
        count: 10000,
        /**
         * パーティクルの寿命(フレーム)
         * @type {number}
         */
        life: 60,
        /**
         * 寿命のランダム幅(life=1.0, lifeRandom=0.1 → life=0.9～1.1)
         * @type {number}
         */
        lifeRandom: 0,
        /**
         * 生成範囲(エミッタからの距離)
         * @type {number}
         */
        emitRange: 0,

        /**
         * 移動方向ベクトル(null時はランダム方向へ)
         * @type {number}
         */
        direction: null,
        /**
         * 移動方向ランダム角
         * @type {number}
         */
        directionRandom: 0,
        /**
         * 移動距離
         * @type {number}
         */
        distance: 1.0,
        /**
         * 移動距離ランダム幅
         * @type {number}
         */
        distanceRandom: 0,
        /**
         * 移動方向ランダム角
         * @type {number}
         */
        directionToRandom: 0,
        /**
         * 移動イージング
         */
        easing: easing.LINEAR,
        
        // TODO ここから
        
        /**
         * 初速ベクトル(null時はランダム方向へ速さ1)
         * @type {THREE.Vector3}
         */
        initialVelocity: null,
        /**
         * 加速度(initialVelocityと同じ向き)
         * @type {number}
         */
        acceleration: 0,
        /**
         * 重力加速度({x:0, y:1, z:0}の向き)
         * @type {number}
         */
        gravity: 0,
        
        // TODO ここまで

        /**
         * ブレンディング
         */
        blending: THREE.AdditiveBlending,

        /**
         * サイズ初期値
         * @type {number}
         */
        sizeFrom: 1.0,
        /**
         * サイズ最終値
         * @type {number}
         */
        sizeTo: 1.0,
        /**
         * サイズ変化時間(lifeを1とした場合)
         * @type {number}
         */
        sizeDuration: 1.0,
        /**
         * サイズイージング
         * @type {number}
         */
        sizeEasing: easing.LINEAR,

        /**
         * 回転初期値
         * @type {number}
         */
        texRotFrom: 0.0,
        /**
         * 回転最終値
         * @type {number}
         */
        texRotTo: 0.0,
        /**
         * 回転変化時間(lifeを1とした場合)
         * @type {number}
         */
        texRotDuration: 0.0,
        /**
         * 回転イージング
         * @type {number}
         */
        texRotEasing: easing.LINEAR,

        /**
         * 赤成分初期値
         * @type {number}
         */
        redFrom: 1.0,
        /**
         * 赤成分最終値
         * @type {number}
         */
        redTo: 1.0,
        /**
         * 赤成分変化時間(lifeを1とした場合)
         * @type {number}
         */
        redDuration: 1.0,
        /**
         * 赤成分イージング
         * @type {number}
         */
        redEasing: easing.LINEAR,

        /**
         * 緑成分初期値
         * @type {number}
         */
        greenFrom: 1.0,
        /**
         * 緑成分最終値
         * @type {number}
         */
        greenTo: 1.0,
        /**
         * 緑成分変化時間(lifeを1とした場合)
         * @type {number}
         */
        greenDuration: 1.0,
        /**
         * 緑成分イージング
         * @type {number}
         */
        greenEasing: easing.LINEAR,

        /**
         * 青成分初期値
         * @type {number}
         */
        blueFrom: 1.0,
        /**
         * 青成分最終値
         * @type {number}
         */
        blueTo: 1.0,
        /**
         * 青成分変化時間(lifeを1とした場合)
         * @type {number}
         */
        blueDuration: 1.0,
        /**
         * 青成分イージング
         * @type {number}
         */
        blueEasing: easing.LINEAR,

        /**
         * アルファ成分初期値
         * @type {number}
         */
        alphaFrom: 1.0,
        /**
         * アルファ成分最終値
         * @type {number}
         */
        alphaTo: 0.0,
        /**
         * アルファ成分変化時間(lifeを1とした場合)
         * @type {number}
         */
        alphaDuration: 1.0,
        /**
         * アルファ成分イージング
         * @type {number}
         */
        alphaEasing: easing.LINEAR,
    };

    tm.define("tm.hybrid.ParticleEmitter", {
        superClass: tm.hybrid.ThreeElement,

        init: function(particleSystem, life, epf, damping) {
            this.superInit();
            this.particleSystem = particleSystem;
            this.life = life;
            this.epf = epf;
            this.damping = damping;
        },

        update: function(app) {
            for (var i = 0; i < this.epf; i++) {
                this.particleSystem._emit(this.position);
            }

            this.life -= 1;
            this.epf *= this.damping;
            if (this.life <= 0) {
                this.remove();
            }
        },
    });

    var EasingFunctions = [
        "#ifndef LINEAR",
        "#define LINEAR " + easing.LINEAR,
        "#endif",
        "#ifndef QUAD_IN",
        "#define QUAD_IN " + easing.QUAD_IN,
        "#endif",
        "#ifndef QUAD_OUT",
        "#define QUAD_OUT " + easing.QUAD_OUT,
        "#endif",
        "#ifndef QUAD_IN_OUT",
        "#define QUAD_IN_OUT " + easing.QUAD_IN_OUT,
        "#endif",
        "#ifndef CUBIC_IN",
        "#define CUBIC_IN " + easing.CUBIC_IN,
        "#endif",
        "#ifndef CUBIC_OUT",
        "#define CUBIC_OUT " + easing.CUBIC_OUT,
        "#endif",
        "#ifndef CUBIC_IN_OUT",
        "#define CUBIC_IN_OUT " + easing.CUBIC_IN_OUT,
        "#endif",
        "#ifndef QUARTIC_IN",
        "#define QUARTIC_IN " + easing.QUARTIC_IN,
        "#endif",
        "#ifndef QUARTIC_OUT",
        "#define QUARTIC_OUT " + easing.QUARTIC_OUT,
        "#endif",
        "#ifndef QUARTIC_IN_OUT",
        "#define QUARTIC_IN_OUT " + easing.QUARTIC_IN_OUT,
        "#endif",
        "#ifndef QINTIC_IN",
        "#define QINTIC_IN " + easing.QINTIC_IN,
        "#endif",
        "#ifndef QINTIC_OUT",
        "#define QINTIC_OUT " + easing.QINTIC_OUT,
        "#endif",
        "#ifndef QINTIC_IN_OUT",
        "#define QINTIC_IN_OUT " + easing.QINTIC_IN_OUT,
        "#endif",
        "#ifndef SINE_IN",
        "#define SINE_IN " + easing.SINE_IN,
        "#endif",
        "#ifndef SINE_OUT",
        "#define SINE_OUT " + easing.SINE_OUT,
        "#endif",
        "#ifndef SINE_IN_OUT",
        "#define SINE_IN_OUT " + easing.SINE_IN_OUT,
        "#endif",
        "#ifndef EXPONENTIAL_IN",
        "#define EXPONENTIAL_IN " + easing.EXPONENTIAL_IN,
        "#endif",
        "#ifndef EXPONENTIAL_OUT",
        "#define EXPONENTIAL_OUT " + easing.EXPONENTIAL_OUT,
        "#endif",
        "#ifndef EXPONENTIAL_IN_OUT",
        "#define EXPONENTIAL_IN_OUT " + easing.EXPONENTIAL_IN_OUT,
        "#endif",
        "#ifndef CIRCULAR_IN",
        "#define CIRCULAR_IN " + easing.CIRCULAR_IN,
        "#endif",
        "#ifndef CIRCULAR_OUT",
        "#define CIRCULAR_OUT " + easing.CIRCULAR_OUT,
        "#endif",
        "#ifndef CIRCULAR_IN_OUT",
        "#define CIRCULAR_IN_OUT " + easing.CIRCULAR_IN_OUT,
        "#endif",
        "#ifndef ELASTIC_IN",
        "#define ELASTIC_IN " + easing.ELASTIC_IN,
        "#endif",
        "#ifndef ELASTIC_OUT",
        "#define ELASTIC_OUT " + easing.ELASTIC_OUT,
        "#endif",
        "#ifndef ELASTIC_IN_OUT",
        "#define ELASTIC_IN_OUT " + easing.ELASTIC_IN_OUT,
        "#endif",
        "#ifndef BACK_IN",
        "#define BACK_IN " + easing.BACK_IN,
        "#endif",
        "#ifndef BACK_OUT",
        "#define BACK_OUT " + easing.BACK_OUT,
        "#endif",
        "#ifndef BACK_IN_OUT",
        "#define BACK_IN_OUT " + easing.BACK_IN_OUT,
        "#endif",
        "#ifndef BOUNCE_OUT",
        "#define BOUNCE_OUT " + easing.BOUNCE_OUT,
        "#endif",
        "#ifndef BOUNCE_IN",
        "#define BOUNCE_IN " + easing.BOUNCE_IN,
        "#endif",
        "#ifndef BOUNCE_IN_OUT",
        "#define BOUNCE_IN_OUT " + easing.BOUNCE_IN_OUT,
        "#endif",

        "#ifndef PI",
        "#define PI 3.141592653589793",
        "#endif",
        "#ifndef HALF_PI",
        "#define HALF_PI 1.5707963267948966",
        "#endif",

        "float easeInQuad(float t) {",
        "  return t * t;",
        "}",

        "float easeOutQuad(float t) {",
        "  return -t * (t - 2.0);",
        "}",

        "float easeInOutQuad(float t) {",
        "  float p = 2.0 * t * t;",
        "  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;",
        "}",

        "float cubicIn(float t) {",
        "  return t * t * t;",
        "}",

        "float cubicOut(float t) {",
        "  float f = t - 1.0;",
        "  return f * f * f + 1.0;",
        "}",

        "float cubicInOut(float t) {",
        "  return t < 0.5",
        "    ? 4.0 * t * t * t",
        "    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;",
        "}",


        "float quarticIn(float t) {",
        "  return pow(t, 4.0);",
        "}",

        "float quarticOut(float t) {",
        "  return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;",
        "}",

        "float quarticInOut(float t) {",
        "  return t < 0.5",
        "    ? +8.0 * pow(t, 4.0)",
        "    : -8.0 * pow(t - 1.0, 4.0) + 1.0;",
        "}",

        "float qinticIn(float t) {",
        "  return pow(t, 5.0);",
        "}",

        "float qinticOut(float t) {",
        "  return 1.0 - (pow(t - 1.0, 5.0));",
        "}",

        "float qinticInOut(float t) {",
        "  return t < 0.5",
        "    ? +16.0 * pow(t, 5.0)",
        "    : -0.5 * pow(2.0 * t - 2.0, 5.0) + 1.0;",
        "}",

        "float sineIn(float t) {",
        "  return sin((t - 1.0) * HALF_PI) + 1.0;",
        "}",

        "float sineOut(float t) {",
        "  return sin(t * HALF_PI);",
        "}",

        "float sineInOut(float t) {",
        "  return -0.5 * (cos(PI * t) - 1.0);",
        "}",

        "float exponentialIn(float t) {",
        "  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));",
        "}",

        "float exponentialOut(float t) {",
        "  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);",
        "}",

        "float exponentialInOut(float t) {",
        "  return t == 0.0 || t == 1.0",
        "    ? t",
        "    : t < 0.5",
        "      ? +0.5 * pow(2.0, (20.0 * t) - 10.0)",
        "      : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;",
        "}",

        "float circularIn(float t) {",
        "  return 1.0 - sqrt(1.0 - t * t);",
        "}",

        "float circularOut(float t) {",
        "  return sqrt((2.0 - t) * t);",
        "}",

        "float circularInOut(float t) {",
        "  return t < 0.5",
        "    ? 0.5 * (1.0 - sqrt(1.0 - 4.0 * t * t))",
        "    : 0.5 * (sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);",
        "}",

        "float elasticIn(float t) {",
        "  return sin(13.0 * t * HALF_PI) * pow(2.0, 10.0 * (t - 1.0));",
        "}",

        "float elasticOut(float t) {",
        "  return sin(-13.0 * (t + 1.0) * HALF_PI) * pow(2.0, -10.0 * t) + 1.0;",
        "}",

        "float elasticInOut(float t) {",
        "  return t < 0.5",
        "    ? 0.5 * sin(+13.0 * HALF_PI * 2.0 * t) * pow(2.0, 10.0 * (2.0 * t - 1.0))",
        "    : 0.5 * sin(-13.0 * HALF_PI * ((2.0 * t - 1.0) + 1.0)) * pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;",
        "}",

        "float backIn(float t) {",
        "  return pow(t, 3.0) - t * sin(t * PI);",
        "}",

        "float backOut(float t) {",
        "  float f = 1.0 - t;",
        "  return 1.0 - (pow(f, 3.0) - f * sin(f * PI));",
        "}",

        "float backInOut(float t) {",
        "  float f = t < 0.5",
        "    ? 2.0 * t",
        "    : 1.0 - (2.0 * t - 1.0);",
        "  float g = pow(f, 3.0) - f * sin(f * PI);",
        "  return t < 0.5",
        "    ? 0.5 * g",
        "    : 0.5 * (1.0 - g) + 0.5;",
        "}",

        "float bounceOut(float t) {",
        "  const float a = 4.0 / 11.0;",
        "  const float b = 8.0 / 11.0;",
        "  const float c = 9.0 / 10.0;",
        "  const float ca = 4356.0 / 361.0;",
        "  const float cb = 35442.0 / 1805.0;",
        "  const float cc = 16061.0 / 1805.0;",
        "  float t2 = t * t;",
        "  return t < a",
        "    ? 7.5625 * t2",
        "    : t < b",
        "      ? 9.075 * t2 - 9.9 * t + 3.4",
        "      : t < c",
        "        ? ca * t2 - cb * t + cc",
        "        : 10.8 * t * t - 20.52 * t + 10.72;",
        "}",

        "float bounceIn(float t) {",
        "  return 1.0 - bounceOut(1.0 - t);",
        "}",

        "float bounceInOut(float t) {",
        "  return t < 0.5",
        "    ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))",
        "    : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;",
        "}",

        "float ease(int type, float t) {",
        "  if (t < 0.0) return 0.0;",
        "  else if (t >= 1.0) return 1.0;",
        "",
        "  if (type == QUAD_IN) return easeInQuad(t);",
        "  if (type == QUAD_OUT) return easeOutQuad(t);",
        "  if (type == QUAD_IN_OUT) return easeInOutQuad(t);",
        "  if (type == CUBIC_IN) return cubicIn(t);",
        "  if (type == CUBIC_OUT) return cubicOut(t);",
        "  if (type == CUBIC_IN_OUT) return cubicInOut(t);",
        "  if (type == QUARTIC_IN) return quarticIn(t);",
        "  if (type == QUARTIC_OUT) return quarticOut(t);",
        "  if (type == QUARTIC_IN_OUT) return quarticInOut(t);",
        "  if (type == QINTIC_IN) return qinticIn(t);",
        "  if (type == QINTIC_OUT) return qinticOut(t);",
        "  if (type == QINTIC_IN_OUT) return qinticInOut(t);",
        "  if (type == SINE_IN) return sineIn(t);",
        "  if (type == SINE_OUT) return sineOut(t);",
        "  if (type == SINE_IN_OUT) return sineInOut(t);",
        "  if (type == EXPONENTIAL_IN) return exponentialIn(t);",
        "  if (type == EXPONENTIAL_OUT) return exponentialOut(t);",
        "  if (type == EXPONENTIAL_IN_OUT) return exponentialInOut(t);",
        "  if (type == CIRCULAR_IN) return circularIn(t);",
        "  if (type == CIRCULAR_OUT) return circularOut(t);",
        "  if (type == CIRCULAR_IN_OUT) return circularInOut(t);",
        "  if (type == ELASTIC_IN) return elasticIn(t);",
        "  if (type == ELASTIC_OUT) return elasticOut(t);",
        "  if (type == ELASTIC_IN_OUT) return elasticInOut(t);",
        "  if (type == BACK_IN) return backIn(t);",
        "  if (type == BACK_OUT) return backOut(t);",
        "  if (type == BACK_IN_OUT) return backInOut(t);",
        "  if (type == BOUNCE_OUT) return bounceOut(t);",
        "  if (type == BOUNCE_IN) return bounceIn(t);",
        "  if (type == BOUNCE_IN_OUT) return bounceInOut(t);",
        "  return t;",
        "}",
    ].join("\n");

    var vertexShader = [
        "attribute float startTime;",
        "attribute float endTime;",

        "attribute vec3  positionTo;",
        "uniform   int   positionEasing;",

        "attribute vec3  sizeInfo;",
        "uniform   int   sizeEasing;",

        "attribute vec3  texRotInfo;",
        "uniform   int   texRotEasing;",

        "attribute vec3  redInfo;",
        "uniform   int   redEasing;",

        "attribute vec3  greenInfo;",
        "uniform   int   greenEasing;",

        "attribute vec3  blueInfo;",
        "uniform   int   blueEasing;",

        "attribute vec3  alphaInfo;",
        "uniform   int   alphaEasing;",

        "uniform float now;",

        "varying mat3 vTexRot;",
        "varying float vVisible;",
        "varying vec4 vColor;",

        EasingFunctions,

        "void main() {",
        "    float sizeFrom      = sizeInfo[0];",
        "    float sizeTo        = sizeInfo[1];",
        "    float sizeDuration  = sizeInfo[2];",
        "",
        "    float texRotFrom    = texRotInfo[0];",
        "    float texRotTo      = texRotInfo[1];",
        "    float texRotDuration= texRotInfo[2];",
        "",
        "    float redFrom       = redInfo[0];",
        "    float redTo         = redInfo[1];",
        "    float redDuration   = redInfo[2];",
        "",
        "    float greenFrom     = greenInfo[0];",
        "    float greenTo       = greenInfo[1];",
        "    float greenDuration = greenInfo[2];",
        "",
        "    float blueFrom      = blueInfo[0];",
        "    float blueTo        = blueInfo[1];",
        "    float blueDuration  = blueInfo[2];",
        "",
        "    float alphaFrom     = alphaInfo[0];",
        "    float alphaTo       = alphaInfo[1];",
        "    float alphaDuration = alphaInfo[2];",
        "",
        "    float time = (now - startTime) / (endTime - startTime);",
        "    if (time < 0.0 || 1.0 <= time) {",
        "        vVisible = 0.0;",
        "        gl_PointSize = 0.0;",
        "        gl_Position = vec4(0.0);",
        "        return;",
        "    } else {",
        "        vVisible = 1.0;",
        "    }",
        "",
        "    float sizeTime  = (now - startTime) / (sizeDuration * (endTime - startTime));",
        "    float texRotTime= (now - startTime) / (texRotDuration * (endTime - startTime));",
        "    float redTime   = (now - startTime) / (redDuration * (endTime - startTime));",
        "    float greenTime = (now - startTime) / (greenDuration * (endTime - startTime));",
        "    float blueTime  = (now - startTime) / (blueDuration * (endTime - startTime));",
        "    float alphaTime = (now - startTime) / (alphaDuration * (endTime - startTime));",
        "",
        "    float texRot = texRotFrom + (texRotTo - texRotFrom) * ease(texRotEasing, texRotTime);",
        "    vTexRot = mat3(",
        "        1.0, 0.0, 0.0,",
        "        0.0, 1.0, 0.0,",
        "        0.5, 0.5, 1.0",
        "    ) * mat3(",
        "        cos(texRot), sin(texRot), 0.0,",
        "       -sin(texRot), cos(texRot), 0.0,",
        "        0.0, 0.0, 1.0",
        "    ) * mat3(",
        "        1.0, 0.0, 0.0,",
        "        0.0, 1.0, 0.0,",
        "       -0.5,-0.5, 1.0",
        "    );",
        "",
        "    vColor = vec4(",
        "        redFrom   + (redTo   - redFrom)   * ease(redEasing,   redTime),",
        "        greenFrom + (greenTo - greenFrom) * ease(greenEasing, greenTime),",
        "        blueFrom  + (blueTo  - blueFrom)  * ease(blueEasing,  blueTime),",
        "        alphaFrom + (alphaTo - alphaFrom) * ease(alphaEasing, alphaTime)",
        "    );",
        "",
        "    vec4 mvPosition = modelViewMatrix * vec4( position + (positionTo - position) * ease(positionEasing, time), 1.0 );",
        "    float s = sizeFrom + (sizeTo - sizeFrom) * ease(sizeEasing, sizeTime);",
        "    gl_PointSize = s * ( 300.0 / length( mvPosition.xyz ) );",
        "    gl_Position = projectionMatrix * mvPosition;",
        "}",
    ].join("\n");

    var fragmentShader = [
        "uniform sampler2D texture;",

        "varying mat3 vTexRot;",
        "varying float vVisible;",
        "varying vec4 vColor;",

        "void main() {",
        "    if (vVisible == 0.0) {",
        "        discard;",
        "    }",
        "    gl_FragColor = texture2D( texture, (vTexRot * vec3(gl_PointCoord, 1.0)).xy ) * vColor;",
        "}",
    ].join("\n");

})();

var tm = tm || {};
/** @namespace */
tm.asset = tm.asset || {};

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");

    tm.asset = tm.asset || {};

    tm.define("tm.asset.ThreeJSON", {
        superClass: "tm.event.EventDispatcher",

        /**
         * @constructor tm.asset.ThreeJSON
         * @extends {tm.event.EventDispatcher}
         */
        init: function(path) {
            this.superInit();
            this.mesh = null;

            if (tm.asset.ThreeJSON.loader === null) {
                tm.asset.ThreeJSON.loader = new THREE.JSONLoader();
            }

            tm.asset.ThreeJSON.loader.load(path, function(geometry, materials) {
                this.build(geometry, materials);
                this.flare("load");
            }.bind(this));
        },

        build: function(geometry, materials) {
            materials.forEach(function(m) {
                m.shading = THREE.FlatShading;
            });
            this.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        },
    });
    tm.asset.ThreeJSON.loader = null;

    tm.asset.Loader.register("three", function(path) {
        return tm.asset.ThreeJSON(path);
    });

})();

var tm = tm || {};
/** @namespace */
tm.asset = tm.asset || {};

(function() {
    // var tm = require("../../../libs/tmlib");
    // var THREE = require("../../../libs/three");

    tm.asset = tm.asset || {};

    tm.define("tm.asset.Vox", {
        superClass: "tm.event.EventDispatcher",

        /**
         * usage:
         * tm.asset.LoadingScene({ assets: { vox: "test.vox" } });
         *
         * @constructor tm.asset.Vox
         * @extends {tm.event.EventDispatcher}
         */
        init: function(path) {
            this.superInit();

            this.mesh = null;

            if (tm.asset.Vox.parser === null) {
                tm.asset.Vox.parser = new vox.Parser();
            }

            tm.asset.Vox.parser.parse(path).then(function(voxelData) {
                var builder = new vox.MeshBuilder(voxelData);
                this.mesh = builder.createMesh();
                this.flare("load");
            }.bind(this));
        },
    });
    tm.asset.Vox.parser = null;

    tm.asset.Loader.register("vox", function(path) {
        return tm.asset.Vox(path);
    });

})();

(function() {
    tm.asset = tm.asset || {};

    _modelPath = "";

    tm.define("tm.asset.MQO", {
        superClass: "tm.event.EventDispatcher",

        model: null,

        init: function(path) {
            this.superInit();
            this.loadFromURL(path);
        },

        // URLからロード
        loadFromURL: function(path) {
            var modelurl = path.split("/");
            _modelPath = "";
            for (var i = 0, len = modelurl.length; i < len-1; i++) {
                _modelPath += modelurl[i];
            }

            var that = this;
            var req = new XMLHttpRequest();
            req.open("GET", path, true);
            req.onload = function() {
                var data = req.responseText;
                that.loadFromData(data);
            };
            req.send(null);
        },

        //データからロード
        loadFromData: function(data) {
            this.model = tm.MQOModel(data);
            this.flare("load");
        },
    });

    //ローダーに拡張子登録
    tm.asset.Loader.register("mqo", function(path) {
        return tm.asset.MQO(path);
    });

    /*
     * メタセコイアモデル
     */
    tm.define("tm.MQOModel", {
        //変換後メッシュアレイ
        meshes: [],

        //メッシュアレイ
        _rawMeshes: [],

        //マテリアルアレイ
        _rawMaterials: null,
        
        init: function(data) {
            this.meshes = [];
            this._rawMeshes = [];
            this._rawMaterials = null;
            this.parse(data);
            this.convert();
        },

        parse: function(data) {
            // マテリアル
            var materialText = data.match(/^Material [\s\S]*?^\}/m);
            this._rawMaterials = tm.MQOMaterial(materialText[0]);       //マテリアルチャンクは原則一つ

            // オブジェクト
            var objectText = data.match(/^Object [\s\S]*?^\}/gm);
            for (var i = 0, len = objectText.length; i < len; ++i) {
                var mesh = tm.MQOMesh(objectText[i]);
                this._rawMeshes.push(mesh);
            }
        },

        convert: function(){
            this.meshes = [];
            for (var i = 0, len = this._rawMeshes.length; i < len; i++) {
                var mesh = this._rawMeshes[i];
                var list = mesh.convert(this._rawMaterials);
                for (var j = 0, len2 = list.length; j < len2; j++) {
                    this.meshes.push(list[j]);
                }
            }
        },
    });

    /*
     * メタセコイアメッシュ
     */
    tm.define("tm.MQOMesh", {
        name: "",   //メッシュ名

        vertices: [],   // 頂点
        faces: [],      // 面情報
        vertNormals: [],// 頂点法線
        
        facet: 59.5,    // スムージング角度

        mirror: 0,      //ミラーリング
        mirrorAxis: 0,  //ミラーリング軸

        init: function(text) {
            this.vertices = [];
            this.faces = [];
            this.vertNormals = [];
            this.parse(text);
        },

        parse:function(text){
            //オブジェクト名
            var name = text.split(' ');
            this.name = name[1].replace(/"/g, "");

            //スムージング角
            var facet = text.match(/facet ([0-9\.]+)/);
            if( facet ){ this.facet = Number(facet[1]); }

            //可視フラグ
            var visible = text.match(/visible ([0-9\.]+)/);
            if( visible ){ this.visible = Number(visible[1]); }

            //ミラーリング
            var mirror = text.match(/mirror ([0-9])/m);
            if( mirror ){
                this.mirror = Number(mirror[1]);
                // 軸
                var mirrorAxis = text.match(/mirror_axis ([0-9])/m);
                if( mirrorAxis ){
                    this.mirrorAxis = Number(mirrorAxis[1]);
                }
            }

            //頂点情報
            var vertex_txt = text.match(/vertex ([0-9]+).+\{\s([\w\W]+)}$/gm);
            this._parseVertices( RegExp.$1, RegExp.$2 );

            //フェース情報
            var face_txt = text.match(/face ([0-9]+).+\{\s([\w\W]+)}$/gm);
            this._parseFaces( RegExp.$1, RegExp.$2 );
        },

        convert: function(materials){
            //不可視設定の場合は処理をスキップ
            if( this.visible == 0 ){
                return [];  //空の配列を返す
            }

            //フェースが使用するマテリアルを調べる
            var facemat = [];
            facemat[facemat.length] = this.faces[0].m[0];
            for (var i = 0, lf = this.faces.length; i < lf; i++) {
                var fm = this.faces[i].m[0];
                for (var j = 0, lfm = facemat.length; j < lfm; j++) {
                    if( facemat[j] == this.faces[i].m[0] )fm = -1;
                }
                if( fm != -1 )facemat.push(fm);
            }

            //使用マテリアルに応じてオブジェクトを分割変換
            var meshList = []
            for (var mn = 0; mn < facemat.length; mn++) {
                var matnum = facemat[mn];
                var sp = this.build(matnum, materials.materials[matnum]);
                if (sp) meshList.push(sp);
            }
            return meshList;
        },

        /*
         * フェース情報からマテリアルに対応した頂点情報を構築
         * THREE形式専用
         */
        build: function(num, mqoMat) {
            //マテリアル情報
            var mat = null;
            if (mqoMat) {
                //シェーダーパラメータによってマテリアルを使い分ける
                if(mqoMat.shader === undefined) {
                    mat = new THREE.MeshPhongMaterial();
                } else if(mqoMat.shader == 2) {
                    mat = new THREE.MeshLambertMaterial();
                } else if(mqoMat.shader == 3) {
                    mat = new THREE.MeshPhongMaterial();
                } else  {
                    mat = new THREE.MeshBasicMaterial();
                }
                var r = mqoMat.col[0];
                var g = mqoMat.col[1];
                var b = mqoMat.col[2];
//                if (mat.color) mat.color.setRGB(r*mqoMat.dif, g*mqoMat.dif, b*mqoMat.dif);
                if (mat.color) mat.color.setRGB(r, g, b);
                if (mat.emissive) mat.emissive.setRGB(r*mqoMat.emi*0.1, g*mqoMat.emi*0.1, b*mqoMat.emi*0.1);
                if (mat.ambient) mat.ambient.setRGB(r*mqoMat.amb, g*mqoMat.amb, b*mqoMat.amb);
                if (mat.specular) mat.specular.setRGB(r*mqoMat.spc, g*mqoMat.spc, b*mqoMat.spc);
                if (mqoMat.tex) {
                    mat.map = THREE.ImageUtils.loadTexture(_modelPath+"/"+mqoMat.tex);
                }
                mat.transparent = true;
                mat.shiness = mqoMat.power;
                mat.opacity = mqoMat.col[3];
            } else {
                //デフォルトマテリアル
                mat = new THREE.MeshBasicMaterial();
                mat.color.setRGB(0.7, 0.7, 0.7);
                mat.transparent = true;
                mat.shiness = 1.0;
            }

            //ジオメトリ情報
            var geo = new THREE.Geometry();

            //頂点情報初期化
            for(var i = 0; i < this.vertices.length; i++) {
                this.vertices[i].to = -1;
            }
            var countVertex = 0;

            //インデックス情報
            for (var i = 0, len = this.faces.length; i < len; i++) {
                var face = this.faces[i];
                if (face.m != num) continue;
                if (face.vNum < 3) continue;

                var vIndex = face.v;
                if (face.vNum == 3) {
                    //法線
                    var nx = face.n[0];
                    var ny = face.n[1];
                    var nz = face.n[2];
                    var normal =  new THREE.Vector3(nx, ny, nz);

                    //フェース情報
                    var index = [];
                    index[0] = vIndex[2];
                    index[1] = vIndex[1];
                    index[2] = vIndex[0];
                    for (var j = 0; j < 3; j++) {
                        var v = this.vertices[index[j]];
                        if (v.to != -1) {
                            index[j] = v.to;
                        } else {
                            v.to = countVertex;
                            index[j] = v.to;
                            countVertex++;
                        }
                    }
                    var face3 = new THREE.Face3(index[0], index[1], index[2], normal, undefined, face.m[0]);

                    //頂点法線
                    face3.vertexNormals.push(normal);
                    face3.vertexNormals.push(normal);
                    face3.vertexNormals.push(normal);

                    geo.faces.push(face3);

                    // ＵＶ座標
                    geo.faceVertexUvs[0].push([
                        new THREE.Vector2(face.uv[4], 1.0 - face.uv[5]),
                        new THREE.Vector2(face.uv[2], 1.0 - face.uv[3]),
                        new THREE.Vector2(face.uv[0], 1.0 - face.uv[1])]);
                } else if (face.vNum == 4) {
                    //法線
                    var nx = face.n[0];
                    var ny = face.n[1];
                    var nz = face.n[2];
                    var normal =  new THREE.Vector3(nx, ny, nz);

                    //四角を三角に分割
                    {
                        //フェース情報
                        var index = [];
                        index[0] = vIndex[3];
                        index[1] = vIndex[2];
                        index[2] = vIndex[1];
                        for (var j = 0; j < 3; j++) {
                            var v = this.vertices[index[j]];
                            if (v.to != -1) {
                                index[j] = v.to;
                            } else {
                                v.to = countVertex;
                                index[j] = v.to;
                                countVertex++;
                            }
                        }
                        var face3 = new THREE.Face3(index[0], index[1], index[2], normal, undefined, face.m[0]);
//                        var face3 = new THREE.Face3(vIndex[3], vIndex[2], vIndex[1], normal, undefined, face.m[0]);

                        //頂点法線
                        face3.vertexNormals.push(normal);
                        face3.vertexNormals.push(normal);
                        face3.vertexNormals.push(normal);

                        geo.faces.push(face3);

                        // ＵＶ座標
                        geo.faceVertexUvs[0].push([
                            new THREE.Vector2(face.uv[6], 1.0 - face.uv[7]),
                            new THREE.Vector2(face.uv[4], 1.0 - face.uv[5]),
                            new THREE.Vector2(face.uv[2], 1.0 - face.uv[3])]);
                    }
                    {
                        //フェース情報
                        var index = [];
                        index[0] = vIndex[1];
                        index[1] = vIndex[0];
                        index[2] = vIndex[3];
                        for (var j = 0; j < 3; j++) {
                            var v = this.vertices[index[j]];
                            if (v.to != -1) {
                                index[j] = v.to;
                            } else {
                                v.to = countVertex;
                                index[j] = v.to;
                                countVertex++;
                            }
                        }
                        var face3 = new THREE.Face3(index[0], index[1], index[2], normal, undefined, face.m[0]);
//                        var face3 = new THREE.Face3(vIndex[1], vIndex[0], vIndex[3], normal, undefined, face.m[0]);

                        //頂点法線
                        face3.vertexNormals.push(normal);
                        face3.vertexNormals.push(normal);
                        face3.vertexNormals.push(normal);

                        geo.faces.push(face3);

                        // ＵＶ座標
                        geo.faceVertexUvs[0].push([
                            new THREE.Vector2(face.uv[2], 1.0 - face.uv[3]),
                            new THREE.Vector2(face.uv[0], 1.0 - face.uv[1]),
                            new THREE.Vector2(face.uv[6], 1.0 - face.uv[7])]);
                    }
                }
            }

            //頂点情報
            var scale = 1;
            this.vertices.sort(function(a, b) {
                return a.to - b.to;
            });
            for(var i = 0; i < this.vertices.length; i++) {
                var v = this.vertices[i];
                if (v.to != -1) {
                    var x = v.x*scale;
                    var y = v.y*scale;
                    var z = v.z*scale;
                    geo.vertices.push(new THREE.Vector3(x, y, z));
                }
            }


            //各種情報計算
            geo.computeBoundingBox();
            geo.computeFaceNormals();
            geo.computeVertexNormals();

            //メッシュ生成
            var obj = new THREE.Mesh(geo, mat);
            return obj;
        },

        //頂点情報のパース
        _parseVertices: function(num, text) {
            var scale = 0.1;
            var vertexTextList = text.split('\n');
            for (var i = 0; i <= num; i++) {
                var vertex = vertexTextList[i].split(' ');
                if (vertex.length < 3)continue;
                var v = {};
                v.x = Number(vertex[0])*scale;
                v.y = Number(vertex[1])*scale;
                v.z = Number(vertex[2])*scale;
                this.vertices.push(v);
            }

            //ミラーリング対応
            if (this.mirror) {
                var self = this;
                var toMirror = (function(){
                    return {
                        1: function(v) { return [ v[0]*-1, v[1], v[2] ]; },
                        2: function(v) { return [ v[0], v[1]*-1, v[2] ]; },
                        4: function(v) { return [ v[0], v[1], v[2]*-1 ]; },
                    }[self.mirrorAxis];
                })();
                var len = this.vertices.length;
                for (var i = 0; i < len; i++) {
                    this.vertices.push(toMirror(this.vertices[i]));
                }
            }
        },

        //フェース情報のパース
        _parseFaces: function(num, text) {
            var faceTextList = text.split('\n');

            //法線計算
            var calcNormalize = function(a, b, c) {
                var v1 = [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
                var v2 = [ c[0] - b[0], c[1] - b[1], c[2] - b[2] ];
                var v3 = [
                    v1[1]*v2[2] - v1[2]*v2[1],
                    v1[2]*v2[0] - v1[0]*v2[2],
                    v1[0]*v2[1] - v1[1]*v2[0]
                ];
                var len = Math.sqrt(v3[0]*v3[0] + v3[1]*v3[1] + v3[2]*v3[2]);
                v3[0] /= len;
                v3[1] /= len;
                v3[2] /= len;

                return v3;
            };

            for (var i = 0; i <= num; i++ ){
                // トリムっとく
                var faceText = faceTextList[i].replace(/^\s+|\s+$/g, "");
                // 面の数
                var vertex_num = Number(faceText[0]);

                var info = faceText.match(/([A-Za-z]+)\(([\w\s\-\.\(\)]+?)\)/gi);
                var face = { vNum: vertex_num };
                if (!info) continue;
                
                for (var j = 0, len = info.length; j < len; j++) {
                    var m = info[j].match(/([A-Za-z]+)\(([\w\s\-\.\(\)]+?)\)/);
                    var key = m[1].toLowerCase();
                    var value = m[2].split(" ");
                    value.forEach(function(elm, i, arr){
                        arr[i] = Number(elm);
                    });
                    face[key] = value;
                }
                
                // UV デフォルト値
                if (!face.uv) {
                    face.uv = [0, 0, 0, 0, 0, 0, 0, 0];
                }

                // マテリアル デフォルト値
                if (!face.m) {
                    face.m = [undefined];
                }

                // 法線（面の場合のみ）
                if (face.v.length > 2) {
                    face.n = calcNormalize(this.vertices[face.v[0]], this.vertices[face.v[1]], this.vertices[face.v[2]]);
                }

                this.faces.push(face);
            }

            // ミラーリング対応
            if( this.mirror ){
                var swap = function(a,b){ var temp = this[a]; this[a] = this[b]; this[b] = temp; return this; };
                var len = this.faces.length;
                var vertexOffset = (this.vertices.length/2);
                for(var i = 0; i < len; i++) {
                    var targetFace = this.faces[i];
                    var face = {
                        uv  : [],
                        v   : [],
                        vNum: targetFace.vNum,
                    };
                    for (var j = 0; j < targetFace.v.length; j++) { face.v[j] = targetFace.v[j] + vertexOffset; }
                    for (var j = 0; j < targetFace.uv.length; j++) { face.uv[j] = targetFace.uv[j]; }

                    if (face.vNum == 3) {
                        swap.call(face.v, 1, 2);
                    } else {
                        swap.call(face.v, 0, 1);
                        swap.call(face.v, 2, 3);
                    }

                    face.n = targetFace.n;
                    face.m = targetFace.m;

                    this.faces.push(face);
                }
            }

            // 頂点法線を求める
            var vertNormal = Array(this.vertices.length);
            for (var i = 0, len = this.vertices.length; i < len; i++) vertNormal[i] = [];

            for (var i = 0; i < this.faces.length; i++) {
                var face = this.faces[i];
                var vIndices = face.v;

                for (var j = 0; j < face.vNum; j++) {
                    var index = vIndices[j];
                    vertNormal[index].push.apply(vertNormal[index], face.n);
                }
            }

            for (var i = 0; i < vertNormal.length; i++) {
                var vn = vertNormal[i];
                var result = [0, 0, 0];
                var len = vn.length/3;
                for (var j = 0; j < len; j++) {
                    result[0] += vn[j*3+0];
                    result[1] += vn[j*3+1];
                    result[2] += vn[j*3+2];
                }

                result[0] /= len;
                result[1] /= len;
                result[2] /= len;

                var len = Math.sqrt(result[0]*result[0] + result[1]*result[1] + result[2]*result[2]);
                result[0] /= len;
                result[1] /= len;
                result[2] /= len;
                
                this.vertNormals[i] = result;
            }
        },
    });

    /*
     * メタセコイアマテリアル
     */
    tm.define("tm.MQOMaterial", {
        materials: [],

        init: function(data) {
            this.materials = [];
            this.parse(data);
        },

        //マテリアル情報のパース
        parse: function(data) {
//            var infoText    = data.match(/^Material [0-9]* \{\r\n([\s\S]*?)\r\n^\}$/m);
//            var matTextList = infoText[1].split('\n');
            var matTextList = data.split('\n');

            for (var i = 1, len = matTextList.length-1; i < len; i++) {
                var mat = {};
                // トリムっとく
                var matText = matTextList[i].replace(/^\s+|\s+$/g, "");
                var info = matText.match(/([A-Za-z]+)\(([\w\W]+?)\)/gi);    //マテリアル情報一個分抜く

                var nl = matText.split(' ');    //マテリアル名取得
                mat['name'] = nl[0].replace(/"/g, "");

                for( var j = 0, len2 = info.length; j < len2; j++ ){
                    var m = info[j].match(/([A-Za-z]+)\(([\w\W]+?)\)/); //要素を抜き出す
                    var key = m[1].toLowerCase();   //文字列小文字化
                    var value = null;

                    if( key != "tex" && key != "aplane" ){
                        //テクスチャ以外の要素
                        value = m[2].split(" ");
                        value.forEach(function(elm, i, arr){
                            arr[i] = Number(elm);
                        });
                    }else{
                        //テクスチャの場合
                        value = m[2].replace(/"/g, "");
                    }
                    mat[key] = value;
                }
                this.materials.push(mat);
            }
        },
        convert: function() {
        },
    });

})();

