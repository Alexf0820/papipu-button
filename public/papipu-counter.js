(function () {
  "use strict";

  var COUNTER_DIGITS = 24;
  var LOADING_DISPLAY = "••••••••••••••••••••••••";
  var initialized = false;
  var initialFetchDone = false;
  var lastDisplayedCount = -1;
  var elCounter;
  var elTapButton;
  var config;

  function getConfig() {
    return window.__PapipuSupabaseConfig || null;
  }

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

  function applyCount(count) {
    var nextCount = parseCount(count);
    if (nextCount < lastDisplayedCount) return;
    lastDisplayedCount = nextCount;
    if (elCounter) {
      elCounter.textContent = formatCount(nextCount);
      elCounter.removeAttribute("data-loading");
    }
  }

  function applyFallbackCount() {
    lastDisplayedCount = 0;
    if (elCounter) {
      elCounter.textContent = formatCount(0);
      elCounter.removeAttribute("data-loading");
    }
  }

  function isCounterLoading() {
    if (!elCounter) return false;
    return elCounter.getAttribute("data-loading") === "true";
  }

  function supabaseHeaders() {
    return {
      apikey: config.anonKey,
      Authorization: "Bearer " + config.anonKey,
      "Content-Type": "application/json",
    };
  }

  function seedDisplayedCountFromDom() {
    if (!elCounter) return;
    if (isCounterLoading() || elCounter.textContent === LOADING_DISPLAY) {
      lastDisplayedCount = -1;
      return;
    }
    lastDisplayedCount = parseCount(elCounter.textContent);
  }

  function fetchInitialCount() {
    if (initialFetchDone) return;
    initialFetchDone = true;

    if (!config || !config.url || !config.anonKey) {
      applyFallbackCount();
      return;
    }

    var url =
      config.url + "/rest/v1/button_counter?id=eq.1&select=count";

    fetch(url, { headers: supabaseHeaders() })
      .then(function (res) {
        if (!res.ok) throw new Error("fetch count failed");
        return res.json();
      })
      .then(function (rows) {
        if (rows && rows[0] && rows[0].count != null) {
          applyCount(rows[0].count);
          return;
        }
        applyFallbackCount();
      })
      .catch(function (e) {
        console.warn("Failed to load world count:", e);
        applyFallbackCount();
      });
  }

  function incrementCounter() {
    if (!config || !config.url || !config.anonKey) return;

    var url = config.url + "/rest/v1/rpc/increment_counter";

    fetch(url, {
      method: "POST",
      headers: supabaseHeaders(),
      body: "{}",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("increment failed");
        return res.json();
      })
      .then(function (newCount) {
        applyCount(newCount);
      })
      .catch(function (e) {
        console.warn("Failed to increment world count:", e);
      });
  }

  function bindElements() {
    elCounter = document.getElementById("papipu-counter");
    elTapButton = document.getElementById("tap-button");
  }

  function init() {
    if (initialized) return;

    config = getConfig();
    bindElements();
    if (!elTapButton) return;

    initialized = true;
    seedDisplayedCountFromDom();
    elTapButton.addEventListener("click", incrementCounter);
    fetchInitialCount();
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
