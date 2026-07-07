(function () {
  "use strict";

  var BUTTON_SOUND = "/sounds/button-pop.m4a";

  var initialized = false;
  var elTapButton;
  var elCounter;

  function bindElements() {
    elTapButton = document.getElementById("tap-button");
    elCounter = document.getElementById("papipu-counter");
  }

  function playTapAnimation() {
    if (!elTapButton) return;
    elTapButton.classList.remove("papipu-button-pressed");
    requestAnimationFrame(function () {
      if (!elTapButton) return;
      elTapButton.classList.add("papipu-button-pressed");
    });
    window.setTimeout(function () {
      if (elTapButton) elTapButton.classList.remove("papipu-button-pressed");
    }, 150);
  }

  function playCounterFlash() {
    if (!elCounter) return;
    elCounter.classList.remove("papipu-counter-flash");
    requestAnimationFrame(function () {
      if (!elCounter) return;
      elCounter.classList.add("papipu-counter-flash");
    });
  }

  function handleTap() {
    window.playSound("/sounds/button-pop.m4a");
    playTapAnimation();
    playCounterFlash();
  }

  function init() {
    if (initialized) return;

    bindElements();
    if (!elTapButton) return;

    initialized = true;
    elTapButton.addEventListener("click", handleTap);
  }

  function scheduleInit() {
    window.setTimeout(function () {
      init();
      if (!initialized) {
        window.setTimeout(init, 0);
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleInit, { once: true });
  } else {
    scheduleInit();
  }
})();
