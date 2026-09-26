
/* ============================================================
   HILO CONDUCTOR BOTÁNICO — v5 (Refined, Subtle, Alternating)
   - Subtle & delicate: thin 1.0px hairline strokes in champagne gold
   - Aerodynamic leaves: slender olive/laurel leaves lying forward along the branch
   - Alternating rhythm: branches alternate Left / Right every ~450px
   - No clutter: Hero begins pure and pristine (first branch starts at y = 650)
   - Max 1-2 branches visible per screen, never crowded
   - Butter-smooth: 60FPS fixed canvas with retina high-DPI scaling
   ============================================================ */
(function initBotanicalVine() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.innerWidth < 1280) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CW = 180;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function gold(a) { return 'rgba(201, 169, 110, ' + a + ')'; }
  function goldLight(a) { return 'rgba(232, 217, 189, ' + a + ')'; }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function easeOutBack(t) {
    var c1 = 1.4;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function pseudoRandom(seed) {
    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function getOrCreateCanvas(side) {
    var id = 'vine-canvas-' + side;
    var c = document.getElementById(id);
    if (!c) {
      c = document.createElement('canvas');
      c.id = id;
      document.body.appendChild(c);
    }
    c.style.position      = 'fixed';
    c.style.top           = '0';
    c.style[side]         = '0';
    c.style.width         = CW + 'px';
    c.style.height        = '100vh';
    c.style.pointerEvents = 'none';
    c.style.zIndex        = '2';
    return c;
  }

  var LC = getOrCreateCanvas('left');
  var RC = getOrCreateCanvas('right');
  var leftCtx = LC.getContext('2d');
  var rightCtx = RC.getContext('2d');

  var viewH = window.innerHeight;
  var docH = document.documentElement.scrollHeight;
  var nodesLeft = [];
  var nodesRight = [];

  function getStemX(worldY, isRight) {
    var baseX = isRight ? CW - 26 : 26;
    var sway = Math.sin(worldY / 320) * 5 * (isRight ? -1 : 1);
    return baseX + sway;
  }

  function generateNodes() {
    nodesLeft = [];
    nodesRight = [];
    docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    // Staggered alternating distribution:
    // Left at 650, 1550, 2450, 3350... (every 900px)
    // Right at 1100, 2000, 2900, 3800... (offset by 450px)
    // Total: only 1 branch appears every ~450px across the entire page!
    var interval = 900;
    var startY = 650;
    for (var y = startY; y < docH - 450; y += interval) {
      nodesLeft.push({
        worldY: y,
        len: 60 + Math.floor(pseudoRandom(y) * 14) // 60px to 74px
      });

      var rightY = y + 450;
      if (rightY < docH - 450) {
        nodesRight.push({
          worldY: rightY,
          len: 60 + Math.floor(pseudoRandom(rightY) * 14)
        });
      }
    }
  }

  function resize() {
    viewH = window.innerHeight;
    if (window.innerWidth < 1280) {
      LC.style.display = RC.style.display = 'none';
      return;
    }
    LC.style.display = RC.style.display = '';

    [LC, RC].forEach(function(c) {
      c.width  = Math.round(CW * dpr);
      c.height = Math.round(viewH * dpr);
      c.style.width  = CW + 'px';
      c.style.height = viewH + 'px';
      var ctx = c.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    });

    generateNodes();
    requestTick();
  }

  // Refined, slender olive leaf with central vein
  function drawLeaf(ctx, x, y, angle, length, width, fillAlpha, strokeAlpha) {
    if (length <= 0.5) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo( width * 0.70, -length * 0.35,  width * 0.60, -length * 0.75, 0, -length);
    ctx.bezierCurveTo(-width * 0.60, -length * 0.75, -width * 0.70, -length * 0.35, 0, 0);

    ctx.fillStyle = gold(fillAlpha);
    ctx.fill();

    ctx.strokeStyle = goldLight(strokeAlpha);
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Delicate vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length * 0.82);
    ctx.strokeStyle = goldLight(strokeAlpha * 0.45);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  // Subtle pearl bud
  function drawBud(ctx, x, y, scale) {
    if (scale <= 0.1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 1.6 * scale, 0, Math.PI * 2);
    ctx.fillStyle = goldLight(0.75);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3.2 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = gold(0.25 * scale);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  // Minimal golden apex sprout at the tip of the stem
  function drawApexBud(ctx, x, y, isRight) {
    ctx.save();
    ctx.translate(x, y);
    var dirX = isRight ? -1 : 1;

    ctx.beginPath();
    ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
    ctx.fillStyle = goldLight(0.85);
    ctx.fill();

    // 2 tiny budding leaflets (delicate, 6px)
    drawLeaf(ctx, 0, 0, dirX * 0.40, 6.5, 2.2, 0.25, 0.60);
    drawLeaf(ctx, 0, 0, -dirX * 0.20, 5.0, 1.8, 0.20, 0.50);

    ctx.restore();
  }

  // Tangentially-emerging branch with forward-leaning olive leaves
  function drawSubtleBranch(ctx, node, screenY, isRight, growth) {
    var dirX = isRight ? -1 : 1;
    var sx = getStemX(node.worldY, isRight);
    var sy = screenY;
    var len = node.len;

    // Cubic bezier: starts near-vertical from stem, sweeping gently inward & upward
    var p0x = sx;
    var p0y = sy;
    var p1x = sx + dirX * len * 0.12;
    var p1y = sy - len * 0.45;
    var p2x = sx + dirX * len * 0.60;
    var p2y = sy - len * 0.60;
    var p3x = sx + dirX * len * 0.92;
    var p3y = sy - len * 0.45;

    // De Casteljau subdivision for cubic bezier up to t = growth
    var t = growth;
    var p01x = (1 - t) * p0x + t * p1x;
    var p01y = (1 - t) * p0y + t * p1y;
    var p12x = (1 - t) * p1x + t * p2x;
    var p12y = (1 - t) * p1y + t * p2y;
    var p23x = (1 - t) * p2x + t * p3x;
    var p23y = (1 - t) * p2y + t * p3y;

    var p012x = (1 - t) * p01x + t * p12x;
    var p012y = (1 - t) * p01y + t * p12y;
    var p123x = (1 - t) * p12x + t * p23x;
    var p123y = (1 - t) * p12y + t * p23y;

    var p0123x = (1 - t) * p012x + t * p123x;
    var p0123y = (1 - t) * p012y + t * p123y;

    // Branch stroke: delicate hairline (1.0px)
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.bezierCurveTo(p01x, p01y, p012x, p012y, p0123x, p0123y);
    ctx.strokeStyle = gold(0.28 + growth * 0.18);
    ctx.lineWidth   = 1.05;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Helper: evaluate full curve point and tangent at fraction f
    function evalCurve(f) {
      var inv = 1 - f;
      var cx = inv*inv*inv * p0x + 3*inv*inv*f * p1x + 3*inv*f*f * p2x + f*f*f * p3x;
      var cy = inv*inv*inv * p0y + 3*inv*inv*f * p1y + 3*inv*f*f * p2y + f*f*f * p3y;
      var tx = 3*inv*inv * (p1x - p0x) + 6*inv*f * (p2x - p1x) + 3*f*f * (p3x - p2x);
      var ty = 3*inv*inv * (p1y - p0y) + 6*inv*f * (p2y - p1y) + 3*f*f * (p3y - p2y);
      return { x: cx, y: cy, ang: Math.atan2(ty, tx) };
    }

    // Leaf pair 1 at f = 0.50 (forward-angled along branch)
    var f1 = 0.50;
    if (growth > f1) {
      var c1 = evalCurve(f1);
      var p1 = clamp((growth - f1) / 0.25, 0, 1);
      var s1 = easeOutBack(p1);
      // Acute angles pointing forward
      drawLeaf(ctx, c1.x, c1.y, c1.ang - 0.35, 12 * s1, 3.8 * s1, 0.12, 0.45);
      drawLeaf(ctx, c1.x, c1.y, c1.ang + 0.30, 10.5 * s1, 3.4 * s1, 0.10, 0.40);
    }

    // Leaf pair 2 at f = 0.78
    var f2 = 0.78;
    if (growth > f2) {
      var c2 = evalCurve(f2);
      var p2 = clamp((growth - f2) / 0.20, 0, 1);
      var s2 = easeOutBack(p2);
      drawLeaf(ctx, c2.x, c2.y, c2.ang - 0.32, 11 * s2, 3.4 * s2, 0.12, 0.45);
      drawLeaf(ctx, c2.x, c2.y, c2.ang + 0.28, 9.5 * s2, 3.0 * s2, 0.10, 0.40);
    }

    // Terminal leaf at tip (p0123x, p0123y)
    if (growth > 0.88) {
      var pTip = clamp((growth - 0.88) / 0.12, 0, 1);
      var sTip = easeOutBack(pTip);
      var tipAngle = Math.atan2(p0123y - p012y, p0123x - p012x);
      drawLeaf(ctx, p0123x, p0123y, tipAngle, 13 * sTip, 4.2 * sTip, 0.15, 0.50);
      drawBud(ctx, p0123x, p0123y, sTip);
    }
  }

  // Draw full vine for one side
  function renderSide(ctx, isRight, scrollY) {
    ctx.clearRect(0, 0, CW, viewH);

    var tipScreenY = currentReach - scrollY;
    var maxStemY = Math.min(viewH, Math.max(0, tipScreenY));

    // 1. Draw subtle main stem line (1px hairline)
    if (maxStemY > 0) {
      ctx.beginPath();
      var startWorldY = Math.max(0, scrollY);
      var startX = getStemX(startWorldY, isRight);
      ctx.moveTo(startX, 0);

      var stepY = 16;
      for (var sy = stepY; sy <= maxStemY; sy += stepY) {
        var wY = scrollY + sy;
        var ptX = getStemX(wY, isRight);
        ctx.lineTo(ptX, sy);
      }
      if (maxStemY < viewH) {
        var tipX = getStemX(currentReach, isRight);
        ctx.lineTo(tipX, maxStemY);
      }

      ctx.strokeStyle = gold(0.32);
      ctx.lineWidth   = 1.0;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Apex bud at tip
      if (tipScreenY >= 0 && tipScreenY <= viewH) {
        var tipX = getStemX(currentReach, isRight);
        drawApexBud(ctx, tipX, tipScreenY, isRight);
      }
    }

    // 2. Draw branches for this specific side
    var sideNodes = isRight ? nodesRight : nodesLeft;
    for (var i = 0; i < sideNodes.length; i++) {
      var n = sideNodes[i];
      var sY = n.worldY - scrollY;
      if (sY < -120 || sY > viewH + 120) continue;

      var growth = 0;
      if (currentReach >= n.worldY) {
        growth = clamp((currentReach - n.worldY) / 240, 0, 1);
      }
      if (growth <= 0.001) continue;

      drawSubtleBranch(ctx, n, sY, isRight, growth);
    }
  }

  function render() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    renderSide(leftCtx, false, scrollY);
    renderSide(rightCtx, true, scrollY);
  }

  var targetReach = 0;
  var currentReach = 0;
  var isTicking = false;

  function tick() {
    var diff = targetReach - currentReach;
    if (Math.abs(diff) > 0.4) {
      currentReach += diff * 0.16;
      render();
      requestAnimationFrame(tick);
    } else {
      currentReach = targetReach;
      render();
      isTicking = false;
    }
  }

  function requestTick() {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(tick);
    }
  }

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var maxScroll = Math.max(1, docH - viewH);
    var scrollProgress = clamp(scrollY / maxScroll, 0, 1);

    // Tip reaches ~60% down the screen, expanding to full document at bottom
    targetReach = scrollY + viewH * (0.60 + scrollProgress * 0.40);
    requestTick();
  }

  // Init
  resize();
  onScroll();
  currentReach = targetReach;
  render();

  window.addEventListener('scroll', onScroll, { passive: true });

  var _rt;
  window.addEventListener('resize', function() {
    clearTimeout(_rt);
    _rt = setTimeout(resize, 200);
  });

  window.addEventListener('load', function() {
    docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    generateNodes();
    requestTick();
  });
})();
