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
