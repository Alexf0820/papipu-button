(function () {
  "use strict";

  var initialized = false;
  var elTapButton;
  var elCounter;

  function bindElements() {
    elTapButton = document.getElementById("tap-button");
    elCounter = document.getElementById("papipu-counter");
  }

  function clearPressClasses() {
    if (!elTapButton) return;
    elTapButton.classList.remove("tap-pop");
    elTapButton.classList.remove("papipu-button-pressed");
  }

  function playTapAnimation() {
    if (!elTapButton) return;
    elTapButton.classList.remove("tap-pop");
    elTapButton.classList.remove("papipu-button-pressed");
    void elTapButton.offsetWidth;
    elTapButton.classList.add("tap-pop");
    elTapButton.classList.add("papipu-button-pressed");
  }

  function handleAnimationEnd(event) {
    if (!elTapButton || event.target !== elTapButton) return;
    elTapButton.classList.remove("tap-pop");
  }

  function releasePress() {
    clearPressClasses();
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
    elTapButton.addEventListener("animationend", handleAnimationEnd);
    elTapButton.addEventListener("touchend", releasePress);
    elTapButton.addEventListener("touchcancel", releasePress);
    elTapButton.addEventListener("pointerup", releasePress);
    elTapButton.addEventListener("pointercancel", releasePress);
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
