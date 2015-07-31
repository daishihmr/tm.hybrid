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
