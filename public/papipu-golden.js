(function () {
  "use strict";

  var COUNTER_DIGITS = 24;
  var AUTO_DISMISS_MS = 30000;

  var initialized = false;
  var previousCount = -1;
  var elPage;
  var elCounter;
  var elGolden;
  var elGoldenCounter;
  var elContinue;
  var elSave;
  var dismissTimer;

  function parseCount(value) {
    var n = typeof value === "number" ? value : parseInt(String(value), 10);
    if (!isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }

  function formatCount(count) {
    return String(parseCount(count))
      .padStart(COUNTER_DIGITS, "0")
      .slice(-COUNTER_DIGITS);
  }

  function isGoldenPushCount(count) {
    count = parseCount(count);
    if (count < 10) return false;

    var n = count;
    while (n > 1) {
      if (n % 10 !== 0) return false;
      n = n / 10;
    }

    return n === 1;
  }

  function clearDismissTimer() {
    if (dismissTimer) {
      window.clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  }

  function hideGoldenPush() {
    if (!elGolden || !elPage) return;

    clearDismissTimer();
    elGolden.classList.add("hidden");
    elGolden.hidden = true;
    elPage.classList.remove("papipu-page-hidden");
    elPage.hidden = false;
  }

  function showGoldenPush(count) {
    if (!elGolden || !elPage || !elGoldenCounter) return;

    clearDismissTimer();
    elGoldenCounter.textContent = formatCount(count);
    elPage.classList.add("papipu-page-hidden");
    elPage.hidden = true;
    elGolden.classList.remove("hidden");
    elGolden.hidden = false;

    dismissTimer = window.setTimeout(function () {
      hideGoldenPush();
    }, AUTO_DISMISS_MS);
  }

  function onCounterChange() {
    if (!elCounter) return;

    var count = parseCount(elCounter.textContent);
    if (count > previousCount && isGoldenPushCount(count)) {
      showGoldenPush(count);
    }
    previousCount = count;
  }

  function saveGoldenImage() {
    if (!elGoldenCounter) return;

    var countText = elGoldenCounter.textContent || formatCount(0);
    var canvas = document.createElement("canvas");
    var width = 1080;
    var height = 1350;
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    var glow = ctx.createRadialGradient(
      width / 2,
      height * 0.42,
      0,
      width / 2,
      height * 0.42,
      width * 0.55
    );
    glow.addColorStop(0, "rgba(212, 175, 55, 0.18)");
    glow.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#e8d5a3";
    ctx.font = "700 72px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Golden Push", width / 2, height * 0.34);

    ctx.fillStyle = "#fafafa";
    ctx.font = "600 52px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(countText, width / 2, height * 0.5);

    ctx.fillStyle = "#e8d5a3";
    ctx.font = "300 52px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("One Button.", width / 2, height * 0.66);
    ctx.fillText("One World.", width / 2, height * 0.72);

    canvas.toBlob(function (blob) {
      if (!blob) return;

      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "papipu-golden-push.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function createGoldenScreen() {
    elGolden = document.createElement("div");
    elGolden.id = "papipu-golden";
    elGolden.className = "papipu-golden hidden";
    elGolden.hidden = true;
    elGolden.innerHTML =
      '<div class="papipu-golden-inner">' +
      '<p class="papipu-golden-title">🥇 GOLDEN PUSH!</p>' +
      '<p class="papipu-golden-subtitle">You made history.</p>' +
      '<p id="papipu-golden-counter" class="papipu-golden-counter"></p>' +
      '<div class="papipu-golden-actions">' +
      '<button type="button" id="papipu-golden-save" class="papipu-golden-btn papipu-golden-btn-secondary">Save Image</button>' +
      '<button type="button" id="papipu-golden-continue" class="papipu-golden-btn">Continue</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(elGolden);

    elGoldenCounter = document.getElementById("papipu-golden-counter");
    elContinue = document.getElementById("papipu-golden-continue");
    elSave = document.getElementById("papipu-golden-save");

    if (elContinue) {
      elContinue.addEventListener("click", hideGoldenPush);
    }

    if (elSave) {
      elSave.addEventListener("click", saveGoldenImage);
    }
  }

  function init() {
    if (initialized) return;

    elPage = document.querySelector(".papipu-page");
    elCounter = document.getElementById("papipu-counter");
    if (!elPage || !elCounter) return;

    initialized = true;
    createGoldenScreen();
    previousCount = parseCount(elCounter.textContent);

    var observer = new MutationObserver(function () {
      onCounterChange();
    });

    observer.observe(elCounter, {
      characterData: true,
      childList: true,
      subtree: true,
    });
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
