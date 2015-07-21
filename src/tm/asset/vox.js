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
                var builder = new vox.Builder(voxelData);
                this.mesh = builder.createMesh();
                this.flare("load");
            }.bind(this));
        },
    });
    tm.asset.Vox.parser = null;

    tm.asset.Loader.register("three", function(path) {
        return tm.asset.Vox(path);
    });

})();
