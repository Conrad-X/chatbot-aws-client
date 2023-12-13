const cheetahModel = {
  publicPath: "models/cheetah_params.pv",
  forceWrite: true,
};

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = cheetahModel;
})();