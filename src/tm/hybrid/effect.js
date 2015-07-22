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
