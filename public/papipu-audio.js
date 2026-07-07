(function () {
  "use strict";

  var audioCache = {};

  function getAudio(src) {
    if (!audioCache[src]) {
      var audio = new Audio();
      audio.preload = "none";
      audio.src = src;
      audio.addEventListener("error", function () {
        console.warn("Audio skipped (not found or unsupported):", src);
      });
      audioCache[src] = audio;
    }
    return audioCache[src];
  }

  function tryPlaySrc(src, onFailed) {
    if (!src) {
      if (onFailed) onFailed();
      return;
    }
    try {
      var audio = getAudio(src);
      var failed = false;

      function fail() {
        if (failed) return;
        failed = true;
        if (onFailed) onFailed();
      }

      if (audio.error) {
        fail();
        return;
      }

      audio.addEventListener(
        "error",
        function () {
          fail();
        },
        { once: true }
      );

      audio.currentTime = 0;
      if (audio.readyState === 0) {
        audio.load();
      }
      var playPromise = audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function (e) {
          console.warn("Audio play failed:", src, e);
          fail();
        });
      }
    } catch (e) {
      console.warn("Audio play failed:", src, e);
      if (onFailed) onFailed();
    }
  }

  function tryPlayWithFallbacks(srcs) {
    var queue = [];
    srcs.forEach(function (src) {
      if (src && queue.indexOf(src) === -1) {
        queue.push(src);
      }
    });

    function tryNext(index) {
      if (index >= queue.length) return;
      tryPlaySrc(queue[index], function () {
        tryNext(index + 1);
      });
    }

    tryNext(0);
  }

  function playSound(resolved) {
    if (!resolved) return;
    if (typeof resolved === "string") {
      tryPlaySrc(resolved);
      return;
    }
    tryPlayWithFallbacks([
      resolved.primary,
      resolved.fallback,
      resolved.basePrimary,
      resolved.baseFallback,
    ]);
  }

  window.playSound = playSound;
})();
