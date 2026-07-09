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

  function logSupabaseDiagnostics(context, extra) {
    var papipuSupabase = window.PapipuSupabase;
    var papipuSupabaseConfig = window.__PapipuSupabaseConfig || null;
    var payload = {
      calledAt: new Date().toISOString(),
      context: context,
      papipuSupabase: papipuSupabase !== undefined ? papipuSupabase : null,
      papipuSupabaseConfig: papipuSupabaseConfig,
      moduleConfig: config || null,
      hasSupabaseJsClient:
        !!(window.supabase && typeof window.supabase.createClient === "function"),
      hasPapipuSupabaseClient:
        !!(papipuSupabase && typeof papipuSupabase === "object"),
      hasModuleConfig: !!(config && config.url && config.anonKey),
    };

    if (extra) {
      payload.extra = extra;
    }

    console.log("[papipu-counter] supabase diagnostics", payload);
    return payload;
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

  function applyFallbackCount(reason, details) {
    console.log("[papipu-counter] applyFallbackCount", {
      calledAt: new Date().toISOString(),
      reason: reason || "unknown",
      details: details || null,
    });
    console.error("[papipu-counter] applyFallbackCount", {
      reason: reason || "unknown",
      details: details || null,
    });
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

  function extractCountFromInitialResponse(data) {
    if (data == null) return null;

    // 123
    if (typeof data === "number") {
      return data;
    }

    // { count: 123 }
    if (!Array.isArray(data) && typeof data === "object" && data.count != null) {
      return data.count;
    }

    // [{ count: 123 }]
    if (Array.isArray(data) && data.length > 0 && data[0]) {
      if (typeof data[0] === "object" && data[0].count != null) {
        return data[0].count;
      }
    }

    return null;
  }

  function fetchInitialCount() {
    if (initialFetchDone) return;
    initialFetchDone = true;

    console.log("[papipu-counter] fetchInitialCount called", {
      calledAt: new Date().toISOString(),
    });
    logSupabaseDiagnostics("fetchInitialCount:start", {
      endpoint: "GET /rest/v1/button_counter?id=eq.1&select=count",
      method: "GET",
    });

    if (!config || !config.url || !config.anonKey) {
      applyFallbackCount("missing_supabase_config", {
        hasConfig: !!config,
        hasUrl: !!(config && config.url),
        hasAnonKey: !!(config && config.anonKey),
        supabaseUrl: config && config.url ? config.url : null,
      });
      return;
    }

    var requestUrl =
      config.url + "/rest/v1/button_counter?id=eq.1&select=count";

    console.log("[papipu-counter] fetchInitialCount request", {
      calledAt: new Date().toISOString(),
      supabaseUrl: config.url,
      requestUrl: requestUrl,
      method: "GET",
    });

    fetch(requestUrl, { headers: supabaseHeaders() })
      .then(function (res) {
        return res.text().then(function (body) {
          console.log("[papipu-counter] fetchInitialCount response", {
            calledAt: new Date().toISOString(),
            supabaseUrl: config.url,
            requestUrl: requestUrl,
            status: res.status,
            ok: res.ok,
            responseBody: body,
          });

          if (!res.ok) {
            console.error("[papipu-counter] fetchInitialCount HTTP error", {
              supabaseUrl: config.url,
              requestUrl: requestUrl,
              status: res.status,
              responseBody: body,
              exceptionMessage: "HTTP " + res.status,
            });
            throw new Error("fetch count failed: HTTP " + res.status);
          }

          try {
            return JSON.parse(body);
          } catch (parseError) {
            console.error("[papipu-counter] fetchInitialCount JSON parse error", {
              supabaseUrl: config.url,
              requestUrl: requestUrl,
              status: res.status,
              responseBody: body,
              exceptionMessage: parseError.message,
            });
            throw parseError;
          }
        });
      })
      .then(function (payload) {
        var count = extractCountFromInitialResponse(payload);
        if (count != null) {
          console.log("[papipu-counter] fetchInitialCount success", {
            calledAt: new Date().toISOString(),
            count: count,
            payload: payload,
          });
          applyCount(count);
          return;
        }

        console.error("[papipu-counter] fetchInitialCount empty or invalid rows", {
          supabaseUrl: config.url,
          requestUrl: requestUrl,
          responseBody: payload,
          exceptionMessage: "No count value in response",
        });
        applyFallbackCount("empty_or_invalid_rows", {
          supabaseUrl: config.url,
          requestUrl: requestUrl,
          payload: payload,
        });
      })
      .catch(function (e) {
        console.error("[papipu-counter] fetchInitialCount failed", {
          supabaseUrl: config.url,
          requestUrl: requestUrl,
          status: e && e.status != null ? e.status : null,
          responseBody: e && e.responseBody != null ? e.responseBody : null,
          exceptionMessage: e && e.message ? e.message : String(e),
        });
        applyFallbackCount("fetch_error", {
          supabaseUrl: config.url,
          requestUrl: requestUrl,
          exceptionMessage: e && e.message ? e.message : String(e),
        });
      });
  }

  function incrementCounter() {
    console.log("[papipu-counter] incrementCounter called", {
      calledAt: new Date().toISOString(),
    });
    logSupabaseDiagnostics("incrementCounter:start", {
      endpoint: "POST /rest/v1/rpc/increment_counter",
      method: "POST",
    });

    if (!config || !config.url || !config.anonKey) {
      console.log("[papipu-counter] incrementCounter skipped", {
        reason: "missing_supabase_config",
        hasConfig: !!config,
        hasUrl: !!(config && config.url),
        hasAnonKey: !!(config && config.anonKey),
      });
      return;
    }

    var requestUrl = config.url + "/rest/v1/rpc/increment_counter";

    console.log("[papipu-counter] incrementCounter request", {
      calledAt: new Date().toISOString(),
      supabaseUrl: config.url,
      requestUrl: requestUrl,
      method: "POST",
    });

    fetch(requestUrl, {
      method: "POST",
      headers: supabaseHeaders(),
      body: "{}",
    })
      .then(function (res) {
        return res.text().then(function (body) {
          console.log("[papipu-counter] incrementCounter response", {
            calledAt: new Date().toISOString(),
            supabaseUrl: config.url,
            requestUrl: requestUrl,
            status: res.status,
            ok: res.ok,
            responseBody: body,
          });

          if (!res.ok) {
            throw new Error("increment failed: HTTP " + res.status + " " + body);
          }

          try {
            return JSON.parse(body);
          } catch (parseError) {
            throw new Error(
              "increment failed: invalid JSON " + parseError.message + " body=" + body
            );
          }
        });
      })
      .then(function (newCount) {
        console.log("[papipu-counter] incrementCounter success", {
          calledAt: new Date().toISOString(),
          newCount: newCount,
        });
        applyCount(newCount);
      })
      .catch(function (e) {
        console.warn("[papipu-counter] incrementCounter failed", {
          calledAt: new Date().toISOString(),
          supabaseUrl: config.url,
          exceptionMessage: e && e.message ? e.message : String(e),
        });
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
