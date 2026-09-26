
/* ============================================================
   HILO CONDUCTOR BOTÁNICO — v4 (Dynamic Living Growth)
   - Real-time branch growth: branches sprout & unfold as you scroll down
   - Responsive retraction: branches smoothly fold & retract as you scroll up
   - Inward direction: branches grow inward toward the content (Left: +X, Right: -X)
   - Rhythm & Density: 50+ botanical nodes with olive leaves, buds & sub-twigs
   - Butter-smooth: 60FPS fixed viewport canvas with high-DPI scaling
   ============================================================ */
(function initBotanicalVine() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.innerWidth < 1280) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CW = 180;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function gold(a) { return 'rgba(201, 169, 110, ' + a + ')'; }
  function goldLight(a) { return 'rgba(232, 217, 189, ' + a + ')'; }
  function goldDark(a) { return 'rgba(158, 125, 66, ' + a + ')'; }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function easeOutBack(t) {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function pseudoRandom(seed) {
    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  // Find or create left and right canvas
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
  var nodes = [];
  var accents = [];

  function getStemX(worldY, isRight) {
    var baseX = isRight ? CW - 32 : 32;
    var sway = Math.sin(worldY / 250) * 8 * (isRight ? -1 : 1) + Math.sin(worldY / 80) * 2.5;
    return baseX + sway;
  }

  function generateNodes() {
    nodes = [];
    accents = [];
    docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    
    // Major branch nodes every ~210px
    var step = 210;
    var total = Math.floor((docH - 300) / step);
    for (var i = 0; i < total; i++) {
      var seed = i * 7 + 13;
      var y = 200 + i * step + Math.floor(pseudoRandom(seed) * 50 - 25);
      nodes.push({
        worldY: y,
        len: 70 + Math.floor(pseudoRandom(seed + 1) * 45), // 70px to 115px
        angle: 0.18 + pseudoRandom(seed + 2) * 0.20,       // graceful arch upward
        leafCount: pseudoRandom(seed + 3) > 0.4 ? 3 : 2,
        hasSubBranch: pseudoRandom(seed + 4) > 0.35,
        hasBud: pseudoRandom(seed + 5) > 0.45,
        seed: seed
      });

      // Accent leaflet along trunk
      var accY = y + 105 + Math.floor(pseudoRandom(seed + 6) * 30 - 15);
      accents.push({
        worldY: accY,
        tilt: (i % 2 === 0 ? 0.35 : -0.28),
        size: 13 + Math.floor(pseudoRandom(seed + 7) * 4)
      });
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

  // Botanical leaf drawing with central vein
  function drawLeaf(ctx, x, y, angle, length, width, fillAlpha, strokeAlpha) {
    if (length <= 0.5) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo( width * 0.85, -length * 0.35,  width * 0.95, -length * 0.75, 0, -length);
    ctx.bezierCurveTo(-width * 0.95, -length * 0.75, -width * 0.85, -length * 0.35, 0, 0);

    ctx.fillStyle = gold(fillAlpha);
    ctx.fill();

    ctx.strokeStyle = goldLight(strokeAlpha);
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Central vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length * 0.85);
    ctx.strokeStyle = goldLight(strokeAlpha * 0.5);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  // Golden bud / olive jewel
  function drawBud(ctx, x, y, scale) {
    if (scale <= 0.1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 2.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = goldLight(0.9);
    ctx.fill();
    ctx.strokeStyle = goldDark(0.8);
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Outer glow aura
    ctx.beginPath();
    ctx.arc(0, 0, 4.5 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = gold(0.3 * scale);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Glowing apex sprout at the descending tip of the vine
  function drawApexBud(ctx, x, y, isRight) {
    ctx.save();
    ctx.translate(x, y);
    var dirX = isRight ? -1 : 1;

    // Glowing dot
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = goldLight(0.95);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.strokeStyle = gold(0.4);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2 tiny budding leaflets curling outward
    drawLeaf(ctx, 0, 0, dirX * 0.5, 9, 4, 0.4, 0.8);
    drawLeaf(ctx, 0, 0, -dirX * 0.2, 7, 3.2, 0.3, 0.7);

    ctx.restore();
  }

  // Draw an organic dynamic branch with De Casteljau progression
  function drawDynamicBranch(ctx, node, screenY, isRight, growth) {
    var dirX = isRight ? -1 : 1;
    var sx = getStemX(node.worldY, isRight);
    var sy = screenY;
    var len = node.len;
    var ang = node.angle;

    // Control point and end point
    var cpx = sx + dirX * len * 0.48 * Math.cos(ang * 0.45);
    var cpy = sy - len * 0.22 * Math.sin(ang);
    var ex  = sx + dirX * len * Math.cos(ang);
    var ey  = sy - len * Math.sin(ang);

    // De Casteljau split for growth parameter t
    var t = growth;
    var q0x = sx, q0y = sy;
    var q1x = (1 - t) * sx + t * cpx;
    var q1y = (1 - t) * sy + t * cpy;
    var q2x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cpx + t * t * ex;
    var q2y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cpy + t * t * ey;

    // Main branch stroke
    ctx.beginPath();
    ctx.moveTo(q0x, q0y);
    ctx.quadraticCurveTo(q1x, q1y, q2x, q2y);
    ctx.strokeStyle = gold(0.45 + growth * 0.35);
    ctx.lineWidth   = 1.55;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Leaf pair 1 at frac = 0.38
    var f1 = 0.38;
    if (growth > f1) {
      var lx1 = (1 - f1) * (1 - f1) * sx + 2 * (1 - f1) * f1 * cpx + f1 * f1 * ex;
      var ly1 = (1 - f1) * (1 - f1) * sy + 2 * (1 - f1) * f1 * cpy + f1 * f1 * ey;
      var tdx1 = 2 * (1 - f1) * (cpx - sx) + 2 * f1 * (ex - cpx);
      var tdy1 = 2 * (1 - f1) * (cpy - sy) + 2 * f1 * (ey - cpy);
      var tang1 = Math.atan2(tdy1, tdx1);

      var p1 = clamp((growth - f1) / 0.24, 0, 1);
      var s1 = easeOutBack(p1);
      drawLeaf(ctx, lx1, ly1, tang1 - 0.70, 15 * s1, 6.2 * s1, 0.32, 0.72);
      drawLeaf(ctx, lx1, ly1, tang1 + 0.65, 13 * s1, 5.5 * s1, 0.28, 0.65);
    }

    // Sub-branch at frac = 0.58
    var fSub = 0.58;
    if (node.hasSubBranch && growth > fSub) {
      var subGrowth = clamp((growth - fSub) / 0.32, 0, 1);
      var sbx = (1 - fSub) * (1 - fSub) * sx + 2 * (1 - fSub) * fSub * cpx + fSub * fSub * ex;
      var sby = (1 - fSub) * (1 - fSub) * sy + 2 * (1 - fSub) * fSub * cpy + fSub * fSub * ey;
      var subLen = 38 * subGrowth;
      var subAng = ang + 0.40;
      var subEx = sbx + dirX * subLen * Math.cos(subAng);
      var subEy = sby - subLen * Math.sin(subAng);

      ctx.beginPath();
      ctx.moveTo(sbx, sby);
      ctx.lineTo(subEx, subEy);
      ctx.strokeStyle = gold(0.40 + subGrowth * 0.30);
      ctx.lineWidth = 1.1;
      ctx.stroke();

      if (subGrowth > 0.45) {
        var subP = clamp((subGrowth - 0.45) / 0.55, 0, 1);
        var subS = easeOutBack(subP);
        drawLeaf(ctx, subEx, subEy, Math.atan2(subEy - sby, subEx - sbx), 12 * subS, 5 * subS, 0.30, 0.70);
      }
    }

    // Leaf pair 2 at frac = 0.72
    var f2 = 0.72;
    if (growth > f2) {
      var lx2 = (1 - f2) * (1 - f2) * sx + 2 * (1 - f2) * f2 * cpx + f2 * f2 * ex;
      var ly2 = (1 - f2) * (1 - f2) * sy + 2 * (1 - f2) * f2 * cpy + f2 * f2 * ey;
      var tdx2 = 2 * (1 - f2) * (cpx - sx) + 2 * f2 * (ex - cpx);
      var tdy2 = 2 * (1 - f2) * (cpy - sy) + 2 * f2 * (ey - cpy);
      var tang2 = Math.atan2(tdy2, tdx2);

      var p2 = clamp((growth - f2) / 0.20, 0, 1);
      var s2 = easeOutBack(p2);
      drawLeaf(ctx, lx2, ly2, tang2 - 0.65, 13 * s2, 5.5 * s2, 0.30, 0.70);
      drawLeaf(ctx, lx2, ly2, tang2 + 0.60, 11 * s2, 4.8 * s2, 0.26, 0.62);
    }

    // Terminal leaf at branch tip (q2x, q2y)
    if (growth > 0.85) {
      var pTip = clamp((growth - 0.85) / 0.15, 0, 1);
      var sTip = easeOutBack(pTip);
      var tdxTip = 2 * (1 - t) * (cpx - sx) + 2 * t * (ex - cpx);
      var tdyTip = 2 * (1 - t) * (cpy - sy) + 2 * t * (ey - cpy);
      var tangTip = Math.atan2(tdyTip, tdxTip);
      drawLeaf(ctx, q2x, q2y, tangTip, 16 * sTip, 7 * sTip, 0.38, 0.85);

      if (node.hasBud) {
        drawBud(ctx, q2x, q2y, sTip);
      }
    }
  }

  // Draw full vine for one side
  function renderSide(ctx, isRight, scrollY) {
    ctx.clearRect(0, 0, CW, viewH);

    var tipScreenY = currentReach - scrollY;
    var maxStemY = Math.min(viewH, Math.max(0, tipScreenY));

    // 1. Draw main stem line
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
      // Exact tip
      if (maxStemY < viewH) {
        var tipX = getStemX(currentReach, isRight);
        ctx.lineTo(tipX, maxStemY);
      }

      ctx.strokeStyle = gold(0.55);
      ctx.lineWidth   = 1.5;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Apex bud at tip
      if (tipScreenY >= 0 && tipScreenY <= viewH) {
        var tipX = getStemX(currentReach, isRight);
        drawApexBud(ctx, tipX, tipScreenY, isRight);
      }
    }

    // 2. Draw major branch nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var sY = n.worldY - scrollY;
      if (sY < -150 || sY > viewH + 150) continue;

      var growth = 0;
      if (currentReach >= n.worldY) {
        growth = clamp((currentReach - n.worldY) / 160, 0, 1);
      }
      if (growth <= 0.001) continue;

      drawDynamicBranch(ctx, n, sY, isRight, growth);
    }

    // 3. Accent leaflets along trunk
    var dirX = isRight ? -1 : 1;
    for (var j = 0; j < accents.length; j++) {
      var acc = accents[j];
      var aY = acc.worldY - scrollY;
      if (aY < -50 || aY > viewH + 50) continue;

      if (currentReach >= acc.worldY) {
        var aGrowth = clamp((currentReach - acc.worldY) / 100, 0, 1);
        var aScale = easeOutBack(aGrowth);
        var stemX = getStemX(acc.worldY, isRight);
        var leafAng = (dirX > 0 ? 0.45 : -0.45) + acc.tilt;
        drawLeaf(ctx, stemX, aY, leafAng, acc.size * aScale, acc.size * 0.45 * aScale, 0.28, 0.65);
      }
    }
  }

  function render() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    renderSide(leftCtx, false, scrollY);
    renderSide(rightCtx, true, scrollY);
  }

  // Animation ticker: smooth organic chasing of scroll
  var targetReach = 0;
  var currentReach = 0;
  var isTicking = false;

  function tick() {
    var diff = targetReach - currentReach;
    if (Math.abs(diff) > 0.4) {
      currentReach += diff * 0.18;
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

    // Tip reaches ~70% down the screen, expanding to full document at bottom
    targetReach = scrollY + viewH * (0.65 + scrollProgress * 0.35);
    requestTick();
  }

  // Init
  resize();
  onScroll();
  currentReach = targetReach; // Instant render on first load
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
