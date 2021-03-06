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
