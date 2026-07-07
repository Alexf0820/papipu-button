(function () {
  "use strict";

  var COUNTER_DIGITS = 24;
  var AUTO_DISMISS_MS = 30000;

  // 運営が設定する世界記録カウント。将来的に追加・削除しやすいよう配列で管理。
  var WORLD_RECORD_COUNTS = [
    1000000000, // 1,000,000,000
    10000000000, // 10,000,000,000
    100000000000, // 100,000,000,000
    1000000000000, // 1,000,000,000,000
  ];

  var initialized = false;
  var previousCount = -1;
  var elPage;
  var elWorldCounter;
  var elRoot;
  var elCard;
  var elCardCounter;
  var elContinue;
  var elSave;
  var currentRank = "gold";
  var dismissTimer;

  /* ── Count helpers ── */
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

  /* ── Classification ── */
  function powerOfTenExponent(count) {
    if (count < 10) return -1;
    var n = count;
    var exp = 0;
    while (n > 1) {
      if (n % 10 !== 0) return -1;
      n = n / 10;
      exp += 1;
    }
    return n === 1 ? exp : -1;
  }

  function repeatingDigitLength(count) {
    var s = String(count);
    var first = s.charAt(0);
    for (var i = 1; i < s.length; i++) {
      if (s.charAt(i) !== first) return 0;
    }
    return s.length;
  }

  function isAscendingConsecutive(count) {
    var s = String(count);
    if (s.length < 3) return false;
    if (s.charAt(0) !== "1") return false;
    for (var i = 1; i < s.length; i++) {
      if (parseInt(s.charAt(i), 10) !== parseInt(s.charAt(i - 1), 10) + 1) {
        return false;
      }
    }
    return true;
  }

  function isDescendingConsecutive(count) {
    var s = String(count);
    if (s.length < 3) return false;
    if (s.charAt(0) !== "9") return false;
    for (var i = 1; i < s.length; i++) {
      if (parseInt(s.charAt(i), 10) !== parseInt(s.charAt(i - 1), 10) - 1) {
        return false;
      }
    }
    return true;
  }

  // bronze / silver / gold / world-record / null を返す
  function classifyCount(count) {
    count = parseCount(count);
    if (count < 10) return null;

    if (WORLD_RECORD_COUNTS.indexOf(count) !== -1) return "world-record";

    var exp = powerOfTenExponent(count);
    if (exp >= 6) return "gold"; // 1,000,000 以上の10のべき乗
    if (exp >= 3) return "silver"; // 1000 / 10000 / 100000
    if (exp >= 1) return "bronze"; // 10 / 100

    var rep = repeatingDigitLength(count);
    if (rep >= 5) return "silver"; // 11111 〜 99999
    if (rep >= 3) return "bronze"; // 111 〜 9999 のゾロ目

    if (isAscendingConsecutive(count)) return "bronze"; // 123, 1234...
    if (isDescendingConsecutive(count)) return "bronze"; // 987, 9876...

    return null;
  }

  /* ── Rank config ── */
  var RANKS = {
    bronze: {
      className: "rank-bronze",
      medal: "🥉",
      title: "BRONZE PUSH!",
      messages: ["A lucky little moment!"],
      tagline: "One Button.<br />One World.",
      confetti: 24,
      flash: false,
      palette: ["#b87333", "#cd853f", "#e8a15c", "#d2691e", "#f0b070"],
    },
    silver: {
      className: "rank-silver",
      medal: "🥈",
      title: "SILVER PUSH!",
      messages: ["A rare moment!"],
      tagline: "One Button.<br />One World.",
      confetti: 48,
      flash: true,
      palette: ["#c0c0c0", "#e8e8e8", "#a8a8a8", "#f5f5f5", "#d0d0d0"],
    },
    gold: {
      className: "rank-gold",
      medal: "🥇",
      title: "GOLDEN PUSH!",
      messages: ["You reached a world milestone."],
      tagline: "One Button.<br />One World.",
      confetti: 68,
      flash: true,
      palette: ["#fff6cc", "#f5e6a8", "#e6c34c", "#d4af37", "#c9a227"],
    },
    "world-record": {
      className: "rank-world-record",
      medal: "👑",
      title: "WORLD RECORD PUSH!",
      messages: [
        "You are part of history.",
        "The world will remember this moment.",
      ],
      tagline: "One Button.<br />One World.<br />One History.",
      confetti: 96,
      flash: true,
      palette: [
        "#ff5d5d",
        "#ff9f40",
        "#ffe14d",
        "#57ff8f",
        "#4dd2ff",
        "#8b7bff",
        "#ff6ec7",
        "#ffffff",
      ],
    },
  };

  /* ── Dismiss ── */
  function clearDismissTimer() {
    if (dismissTimer) {
      window.clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  }

  function hideMilestone() {
    if (!elRoot || !elPage) return;

    clearDismissTimer();
    elRoot.classList.add("hidden");
    elRoot.hidden = true;
    elPage.classList.remove("papipu-page-hidden");
    elPage.hidden = false;
  }

  /* ── HTML builders ── */
  function buildConfettiHtml(amount, palette) {
    var html = '<div class="papipu-milestone-confetti" aria-hidden="true">';
    var i;

    for (i = 0; i < amount; i += 1) {
      var x = (Math.random() * 100).toFixed(1);
      var delay = (Math.random() * 3.5).toFixed(2);
      var duration = (5 + Math.random() * 4).toFixed(2);
      var size = (7 + Math.random() * 8).toFixed(1);
      var drift = (-90 + Math.random() * 180).toFixed(0);
      var rotate = (Math.random() * 360).toFixed(0);
      var sway = (0.5 + Math.random() * 0.9).toFixed(2);
      var variant = i % 3;
      var color = palette[i % palette.length];

      html +=
        '<span class="papipu-milestone-confetti-piece papipu-milestone-confetti-' +
        variant +
        '" style="--x:' +
        x +
        "%;--delay:" +
        delay +
        "s;--duration:" +
        duration +
        "s;--size:" +
        size +
        "px;--drift:" +
        drift +
        "px;--rotate:" +
        rotate +
        "deg;--sway:" +
        sway +
        ";--color:" +
        color +
        '"></span>';
    }

    html += "</div>";
    return html;
  }

  function buildSparklesHtml() {
    var spots = [
      { top: "8%", left: "6%" },
      { top: "16%", left: "90%" },
      { top: "70%", left: "10%" },
      { top: "80%", left: "86%" },
      { top: "44%", left: "2%" },
      { top: "50%", left: "95%" },
    ];
    var html = '<div class="papipu-milestone-sparkles" aria-hidden="true">';
    var i;

    for (i = 0; i < spots.length; i += 1) {
      html +=
        '<span class="papipu-milestone-sparkle" style="top:' +
        spots[i].top +
        ";left:" +
        spots[i].left +
        ";animation-delay:" +
        (i * 0.2).toFixed(2) +
        's"></span>';
    }

    html += "</div>";
    return html;
  }

  function buildCardHtml(rank, count) {
    var cfg = RANKS[rank];
    var messagesHtml = "";
    var i;

    for (i = 0; i < cfg.messages.length; i += 1) {
      messagesHtml +=
        '<p class="papipu-milestone-message">' + cfg.messages[i] + "</p>";
    }

    return (
      buildSparklesHtml() +
      '<p class="papipu-milestone-title">' +
      cfg.medal +
      " " +
      cfg.title +
      "</p>" +
      messagesHtml +
      '<p class="papipu-milestone-counter">' +
      formatCount(count) +
      "</p>" +
      '<p class="papipu-milestone-tagline">' +
      cfg.tagline +
      "</p>"
    );
  }

  /* ── Show ── */
  function applyRankClass(rank) {
    var key;
    for (key in RANKS) {
      if (Object.prototype.hasOwnProperty.call(RANKS, key)) {
        elRoot.classList.remove(RANKS[key].className);
      }
    }
    elRoot.classList.add(RANKS[rank].className);
  }

  function playEntrance(rank) {
    var cfg = RANKS[rank];
    var flash = elRoot.querySelector(".papipu-milestone-flash");
    var title = elRoot.querySelector(".papipu-milestone-title");

    if (flash) {
      flash.classList.remove("papipu-milestone-flash-active");
      if (cfg.flash) {
        void flash.offsetWidth;
        flash.classList.add("papipu-milestone-flash-active");
      }
    }

    if (title) {
      title.classList.remove("papipu-milestone-title-enter");
      void title.offsetWidth;
      title.classList.add("papipu-milestone-title-enter");
    }
  }

  function showMilestone(rank, count) {
    if (!elRoot || !elPage || !elCard) return;

    var cfg = RANKS[rank];
    if (!cfg) return;

    currentRank = rank;
    clearDismissTimer();

    var confettiEl = elRoot.querySelector(".papipu-milestone-confetti");
    if (confettiEl) {
      confettiEl.outerHTML = buildConfettiHtml(cfg.confetti, cfg.palette);
    }

    elCard.innerHTML = buildCardHtml(rank, count);
    elCardCounter = elCard.querySelector(".papipu-milestone-counter");

    applyRankClass(rank);

    elPage.classList.add("papipu-page-hidden");
    elPage.hidden = true;
    elRoot.classList.remove("hidden");
    elRoot.hidden = false;
    playEntrance(rank);

    dismissTimer = window.setTimeout(function () {
      hideMilestone();
    }, AUTO_DISMISS_MS);
  }

  function onCounterChange() {
    if (!elWorldCounter) return;

    var count = parseCount(elWorldCounter.textContent);
    if (count > previousCount) {
      var rank = classifyCount(count);
      if (rank) {
        showMilestone(rank, count);
      }
    }
    previousCount = count;
  }

  /* ── Save Image ── */
  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawConfettiCanvas(ctx, width, height, palette, amount) {
    var i;
    for (i = 0; i < amount; i += 1) {
      var x = Math.random() * width;
      var y = Math.random() * height;
      var size = 10 + Math.random() * 16;
      var angle = Math.random() * Math.PI;
      var variant = i % 3;

      ctx.save();
      ctx.globalAlpha = 0.55 + Math.random() * 0.4;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = palette[i % palette.length];

      if (variant === 0) {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (variant === 1) {
        ctx.fillRect(-size * 0.28, -size * 0.5, size * 0.56, size);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.5, size * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  var CARD_IMAGE_THEME = {
    bronze: {
      cardTop: "#1c1206",
      cardBottom: "#0c0803",
      border: "rgba(205, 133, 63, 0.6)",
      cardGlow: "rgba(205, 133, 63, 0.22)",
      title: "#f0b070",
      titleGlow: "rgba(232, 161, 92, 0.6)",
      message: "#e0a15c",
      counter: "#fafafa",
      counterGlow: "rgba(205, 133, 63, 0.55)",
      tagline: "#e8c39a",
    },
    silver: {
      cardTop: "#17181a",
      cardBottom: "#0a0b0c",
      border: "rgba(200, 200, 200, 0.6)",
      cardGlow: "rgba(210, 210, 210, 0.22)",
      title: "#f5f5f5",
      titleGlow: "rgba(230, 230, 230, 0.6)",
      message: "#d6d6d6",
      counter: "#ffffff",
      counterGlow: "rgba(210, 210, 210, 0.5)",
      tagline: "#dcdcdc",
    },
    gold: {
      cardTop: "#161206",
      cardBottom: "#0b0a05",
      border: "rgba(212, 175, 55, 0.6)",
      cardGlow: "rgba(212, 175, 55, 0.22)",
      title: "#fff3c4",
      titleGlow: "rgba(255, 220, 120, 0.6)",
      message: "#f0d878",
      counter: "#fafafa",
      counterGlow: "rgba(212, 175, 55, 0.55)",
      tagline: "#e8d5a3",
    },
  };

  function drawCardImage(ctx, width, height, rank, countText) {
    var cfg = RANKS[rank];
    var theme = CARD_IMAGE_THEME[rank];
    var cx = width / 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    var bgGlow = ctx.createRadialGradient(
      cx,
      height * 0.42,
      0,
      cx,
      height * 0.42,
      width * 0.7
    );
    bgGlow.addColorStop(0, theme.cardGlow);
    bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    drawConfettiCanvas(ctx, width, height, cfg.palette, 74);

    var cardW = width * 0.82;
    var cardH = height * 0.74;
    var cardX = (width - cardW) / 2;
    var cardY = (height - cardH) / 2;

    var cardGlow = ctx.createRadialGradient(
      cx,
      cardY + cardH * 0.4,
      0,
      cx,
      cardY + cardH * 0.4,
      cardW * 0.62
    );
    cardGlow.addColorStop(0, theme.cardGlow);
    cardGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = cardGlow;
    ctx.fillRect(cardX - 40, cardY - 40, cardW + 80, cardH + 80);

    var cardFill = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
    cardFill.addColorStop(0, theme.cardTop);
    cardFill.addColorStop(1, theme.cardBottom);
    roundedRectPath(ctx, cardX, cardY, cardW, cardH, 56);
    ctx.fillStyle = cardFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.border;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = theme.title;
    ctx.font = "700 88px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.shadowColor = theme.titleGlow;
    ctx.shadowBlur = 32;
    ctx.fillText(cfg.title, cx, cardY + cardH * 0.2);
    ctx.shadowBlur = 0;

    ctx.fillStyle = theme.message;
    ctx.font = "500 40px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(cfg.messages[0], cx, cardY + cardH * 0.36);

    ctx.fillStyle = theme.counter;
    ctx.font = "700 54px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.shadowColor = theme.counterGlow;
    ctx.shadowBlur = 26;
    ctx.fillText(countText, cx, cardY + cardH * 0.55);
    ctx.shadowBlur = 0;

    ctx.fillStyle = theme.tagline;
    ctx.font = "300 50px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("One Button.", cx, cardY + cardH * 0.74);
    ctx.fillText("One World.", cx, cardY + cardH * 0.82);
  }

  function drawWorldRecordImage(ctx, width, height, countText) {
    var cx = width / 2;
    var cfg = RANKS["world-record"];

    // ── Cosmos background ──
    var space = ctx.createRadialGradient(
      cx,
      height * 0.28,
      0,
      cx,
      height * 0.28,
      height * 0.85
    );
    space.addColorStop(0, "#241a52");
    space.addColorStop(0.5, "#0c0a24");
    space.addColorStop(1, "#000006");
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, width, height);

    // Stars
    var i;
    for (i = 0; i < 120; i += 1) {
      var sx = Math.random() * width;
      var sy = Math.random() * height * 0.85;
      var sr = Math.random() * 1.8 + 0.4;
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.random() * 0.6;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Light pillars rising from the earth (bottom center)
    var rayColors = [
      "rgba(255, 90, 90, 0.16)",
      "rgba(255, 200, 80, 0.16)",
      "rgba(120, 255, 160, 0.16)",
      "rgba(90, 200, 255, 0.16)",
      "rgba(170, 130, 255, 0.16)",
      "rgba(255, 130, 220, 0.16)",
    ];
    var baseX = cx;
    var baseY = height * 1.02;
    for (i = 0; i < 26; i += 1) {
      var angle = -Math.PI / 2 + (i - 13) * 0.09;
      var spread = 24;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(
        baseX + Math.cos(angle - 0.01) * height * 1.2 - spread,
        baseY + Math.sin(angle - 0.01) * height * 1.2
      );
      ctx.lineTo(
        baseX + Math.cos(angle + 0.01) * height * 1.2 + spread,
        baseY + Math.sin(angle + 0.01) * height * 1.2
      );
      ctx.closePath();
      ctx.fillStyle = rayColors[i % rayColors.length];
      ctx.fill();
      ctx.restore();
    }

    // Earth arc glow at the bottom
    var earthGlow = ctx.createRadialGradient(
      cx,
      height * 1.06,
      height * 0.12,
      cx,
      height * 1.06,
      height * 0.55
    );
    earthGlow.addColorStop(0, "rgba(120, 200, 255, 0.55)");
    earthGlow.addColorStop(0.4, "rgba(80, 140, 255, 0.22)");
    earthGlow.addColorStop(1, "rgba(80, 140, 255, 0)");
    ctx.fillStyle = earthGlow;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, height * 1.28, height * 0.5, Math.PI, Math.PI * 2);
    ctx.closePath();
    var earthFill = ctx.createLinearGradient(0, height * 0.82, 0, height);
    earthFill.addColorStop(0, "#2a5db0");
    earthFill.addColorStop(1, "#08122e");
    ctx.fillStyle = earthFill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(150, 220, 255, 0.75)";
    ctx.stroke();
    ctx.restore();

    // Rainbow confetti
    drawConfettiCanvas(ctx, width, height, cfg.palette, 110);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Crown
    ctx.font = "80px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("👑", cx, height * 0.14);

    // Rainbow title (two lines)
    var titleGrad = ctx.createLinearGradient(cx - 360, 0, cx + 360, 0);
    titleGrad.addColorStop(0, "#ff6ec7");
    titleGrad.addColorStop(0.25, "#8b7bff");
    titleGrad.addColorStop(0.5, "#4dd2ff");
    titleGrad.addColorStop(0.75, "#57ff8f");
    titleGrad.addColorStop(1, "#ffe14d");
    ctx.fillStyle = titleGrad;
    ctx.font = "800 92px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.shadowColor = "rgba(140, 190, 255, 0.6)";
    ctx.shadowBlur = 30;
    ctx.fillText("WORLD RECORD", cx, height * 0.24);
    ctx.fillText("PUSH!", cx, height * 0.32);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#e8ecff";
    ctx.font = "500 38px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("You are part of history.", cx, height * 0.4);
    ctx.fillStyle = "#c9d3ff";
    ctx.font = "400 34px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("The world will remember this moment.", cx, height * 0.45);

    // Counter in a rounded, rainbow-bordered pill
    var pillW = width * 0.78;
    var pillH = 108;
    var pillX = (width - pillW) / 2;
    var pillY = height * 0.5;
    roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(8, 10, 30, 0.72)";
    ctx.fill();
    var pillGrad = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0);
    pillGrad.addColorStop(0, "#ff6ec7");
    pillGrad.addColorStop(0.33, "#8b7bff");
    pillGrad.addColorStop(0.66, "#4dd2ff");
    pillGrad.addColorStop(1, "#57ff8f");
    ctx.lineWidth = 4;
    ctx.strokeStyle = pillGrad;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 52px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.shadowColor = "rgba(140, 190, 255, 0.6)";
    ctx.shadowBlur = 22;
    ctx.fillText(countText, cx, pillY + pillH / 2);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#dfe6ff";
    ctx.font = "300 48px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("One Button.", cx, height * 0.68);
    ctx.fillText("One World.", cx, height * 0.735);
    ctx.fillText("One History.", cx, height * 0.79);
  }

  function saveMilestoneImage() {
    if (!elCardCounter) return;

    var countText = elCardCounter.textContent || formatCount(0);
    var canvas = document.createElement("canvas");
    var width = 1080;
    var height = 1350;
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentRank === "world-record") {
      drawWorldRecordImage(ctx, width, height, countText);
    } else {
      drawCardImage(ctx, width, height, currentRank, countText);
    }

    canvas.toBlob(function (blob) {
      if (!blob) return;

      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "papipu-" + currentRank + "-push.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  /* ── DOM setup ── */
  function createMilestoneScreen() {
    elRoot = document.createElement("div");
    elRoot.id = "papipu-milestone";
    elRoot.className = "papipu-milestone rank-gold hidden";
    elRoot.hidden = true;
    elRoot.innerHTML =
      '<div class="papipu-milestone-bg" aria-hidden="true"></div>' +
      '<div class="papipu-milestone-flash" aria-hidden="true"></div>' +
      buildConfettiHtml(68, RANKS.gold.palette) +
      '<div class="papipu-milestone-inner">' +
      '<div class="papipu-milestone-card"></div>' +
      '<div class="papipu-milestone-actions">' +
      '<button type="button" id="papipu-milestone-save" class="papipu-milestone-btn papipu-milestone-btn-secondary">Save Image</button>' +
      '<button type="button" id="papipu-milestone-continue" class="papipu-milestone-btn">Continue</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(elRoot);

    elCard = elRoot.querySelector(".papipu-milestone-card");
    elContinue = document.getElementById("papipu-milestone-continue");
    elSave = document.getElementById("papipu-milestone-save");

    if (elContinue) {
      elContinue.addEventListener("click", hideMilestone);
    }
    if (elSave) {
      elSave.addEventListener("click", saveMilestoneImage);
    }
  }

  function init() {
    if (initialized) return;

    elPage = document.querySelector(".papipu-page");
    elWorldCounter = document.getElementById("papipu-counter");
    if (!elPage || !elWorldCounter) return;

    initialized = true;
    createMilestoneScreen();
    previousCount = parseCount(elWorldCounter.textContent);

    var observer = new MutationObserver(function () {
      onCounterChange();
    });

    observer.observe(elWorldCounter, {
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
