(function () {
  "use strict";

  var APP_NAME = "papipu_button";

  function track(eventName, params) {
    if (typeof window.gtag !== "function") return;

    var payload = { app_name: APP_NAME };
    var key;

    if (params) {
      for (key in params) {
        if (
          Object.prototype.hasOwnProperty.call(params, key) &&
          params[key] != null
        ) {
          payload[key] = params[key];
        }
      }
    }

    window.gtag("event", eventName, payload);
  }

  function trackPageView() {
    track("page_view", {
      page_path: window.location.pathname,
    });
  }

  window.PapipuAnalytics = {
    trackPageView: trackPageView,
    trackMainButtonClick: function (params) {
      track("main_button_click", params);
    },
    trackShareClick: function (params) {
      track("share_click", params);
    },
    trackSaveImageClick: function (params) {
      track("save_image_click", params);
    },
    trackSupportClick: function (params) {
      track("support_click", params);
    },
    trackPwaInstallHintClick: function (params) {
      track("pwa_install_hint_click", params);
    },
    trackPwaInstallHintClose: function (params) {
      track("pwa_install_hint_close", params);
    },
  };

  function bindSupportLink() {
    var link = document.getElementById("papipu-support-link");
    if (!link) return;

    link.addEventListener("click", function () {
      window.PapipuAnalytics.trackSupportClick({});
    });
  }

  function init() {
    trackPageView();
    bindSupportLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
