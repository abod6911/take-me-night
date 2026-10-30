// High-resolution procedural circular plate generator for fallback/instant rendering
const cache = new Map();

export function generatePlateCanvas(type, size = 600) {
  if (cache.has(`${type}_${size}`)) {
    return cache.get(`${type}_${size}`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;

  // 1. Ceramic Stoneware Base Plate
  ctx.save();
  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.04;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#161616';
  ctx.fill();
  ctx.restore();

  // Subtle concentric throwing rings on stoneware
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Plate gradient rim
  const rimGrad = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
  rimGrad.addColorStop(0, '#1c1c1c');
  rimGrad.addColorStop(0.85, '#242424');
  rimGrad.addColorStop(1, '#0e0e0e');
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Stoneware texture lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  for (let ring = r * 0.2; ring < r; ring += 18) {
    ctx.beginPath();
    ctx.arc(cx, cy, ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Inner basin shadow
  const basinGrad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 0.85);
  basinGrad.addColorStop(0, '#222222');
  basinGrad.addColorStop(0.7, '#181818');
  basinGrad.addColorStop(1, '#0c0c0c');
  ctx.fillStyle = basinGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.fill();

  // 2. Dish Specific Renderings
  if (type === 'picanha') {
    renderPicanha(ctx, cx, cy, size);
  } else if (type === 'sirloin') {
    renderSirloin(ctx, cx, cy, size);
  } else if (type === 'ribs') {
    renderRibs(ctx, cx, cy, size);
  } else if (type === 'chicken') {
    renderChicken(ctx, cx, cy, size);
  } else if (type === 'pork') {
    renderPork(ctx, cx, cy, size);
  } else {
    renderTartare(ctx, cx, cy, size);
  }

  // Soft overall sheen
  const sheen = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  cache.set(`${type}_${size}`, dataUrl);
  return dataUrl;
}

function renderPicanha(ctx, cx, cy, size) {
  // Jus puddle
  const jusGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.32);
  jusGrad.addColorStop(0, 'rgba(92, 45, 12, 0.65)');
  jusGrad.addColorStop(0.6, 'rgba(64, 25, 6, 0.45)');
  jusGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = jusGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, size * 0.32, size * 0.24, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 5 Slices of Picanha steak
  const slices = 5;
  for (let i = 0; i < slices; i++) {
    const ox = cx + (i - 2) * (size * 0.09) - 10;
    const oy = cy + (i - 2) * (size * 0.04);
    const angle = -0.25 + i * 0.08;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    // Meat slice shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(-size * 0.16, -size * 0.06, size * 0.32, size * 0.12, 8);
    ctx.fill();

    // Charred crust
    ctx.fillStyle = '#1c0e0b';
    ctx.beginPath();
    ctx.roundRect(-size * 0.16, -size * 0.06, size * 0.32, size * 0.12, 8);
    ctx.fill();

    // Pink juicy steak interior
    const meatGrad = ctx.createLinearGradient(-size * 0.14, 0, size * 0.14, 0);
    meatGrad.addColorStop(0, '#59161a');
    meatGrad.addColorStop(0.3, '#a32832');
    meatGrad.addColorStop(0.5, '#bd323c');
    meatGrad.addColorStop(0.7, '#96222b');
    meatGrad.addColorStop(1, '#421115');
    ctx.fillStyle = meatGrad;
    ctx.beginPath();
    ctx.roundRect(-size * 0.14, -size * 0.045, size * 0.28, size * 0.09, 5);
    ctx.fill();

    // Crispy golden fat cap on top edge
    ctx.fillStyle = '#e5a842';
    ctx.beginPath();
    ctx.roundRect(-size * 0.15, -size * 0.06, size * 0.3, size * 0.02, 3);
    ctx.fill();

    // Char lines across meat
    ctx.strokeStyle = '#140706';
    ctx.lineWidth = 3;
    for (let c = -size * 0.1; c <= size * 0.1; c += 15) {
      ctx.beginPath();
      ctx.moveTo(c, -size * 0.045);
      ctx.lineTo(c + 8, size * 0.045);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Chimichurri verde dollops (herb specks & chili oil)
  for (let h = 0; h < 32; h++) {
    const hx = cx + (Math.sin(h * 3.7) * size * 0.22);
    const hy = cy + (Math.cos(h * 2.3) * size * 0.18);
    ctx.fillStyle = h % 3 === 0 ? '#386927' : (h % 3 === 1 ? '#4e8c32' : '#9e2d1f');
    ctx.beginPath();
    ctx.arc(hx, hy, 2 + (h % 4), 0, Math.PI * 2);
    ctx.fill();
  }

  // Maldon sea salt flakes
  ctx.fillStyle = '#ffffff';
  for (let s = 0; s < 18; s++) {
    const sx = cx + (Math.sin(s * 5.1) * size * 0.18);
    const sy = cy + (Math.cos(s * 4.3) * size * 0.12);
    ctx.fillRect(sx, sy, 3, 3);
  }
}

function renderSirloin(ctx, cx, cy, size) {
  // Charred greens base
  ctx.fillStyle = '#22381b';
  for (let g = 0; g < 8; g++) {
    ctx.save();
    ctx.translate(cx + (g - 3.5) * 20, cy + (g % 2) * 15 + 10);
    ctx.rotate(0.3 * (g - 3.5));
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.15, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Sliced Sirloin
  for (let i = 0; i < 4; i++) {
    const ox = cx + (i - 1.5) * (size * 0.1);
    const oy = cy + (i - 1.5) * 8;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(-0.15);

    // Crust
    ctx.fillStyle = '#170c09';
    ctx.beginPath();
    ctx.roundRect(-size * 0.18, -size * 0.07, size * 0.36, size * 0.14, 10);
    ctx.fill();

    // Tender meat gradient
    const sGrad = ctx.createLinearGradient(0, -size * 0.05, 0, size * 0.05);
    sGrad.addColorStop(0, '#5e171b');
    sGrad.addColorStop(0.5, '#ab2934');
    sGrad.addColorStop(1, '#66161c');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.roundRect(-size * 0.16, -size * 0.05, size * 0.32, size * 0.1, 6);
    ctx.fill();

    ctx.restore();
  }

  // Melting Café de Paris Butter quenelle in center
  const butterGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, size * 0.12);
  butterGrad.addColorStop(0, '#f2d652');
  butterGrad.addColorStop(0.6, '#bfa02c');
  butterGrad.addColorStop(1, 'rgba(120, 95, 20, 0)');
  ctx.fillStyle = butterGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Green herbs inside butter
  ctx.fillStyle = '#28541a';
  for (let b = 0; b < 16; b++) {
    ctx.fillRect(cx + Math.sin(b * 3) * 25, cy + Math.cos(b * 2) * 20, 2.5, 2.5);
  }
}

function renderRibs(ctx, cx, cy, size) {
  // Sticky dark glaze puddle
  ctx.fillStyle = 'rgba(74, 21, 10, 0.7)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 0.3, size * 0.22, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 4 Rib bones
  for (let r = 0; r < 4; r++) {
    const rx = cx + (r - 1.5) * (size * 0.11);
    const ry = cy + (r - 1.5) * (size * 0.05);

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(0.2);

    // Rib bone tip
    ctx.fillStyle = '#d4cbb8';
    ctx.beginPath();
    ctx.ellipse(-size * 0.17, 0, size * 0.03, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();

    // Caramelized charred pork rib meat
    const ribGrad = ctx.createLinearGradient(-size * 0.14, 0, size * 0.16, 0);
    ribGrad.addColorStop(0, '#2e0e0a');
    ribGrad.addColorStop(0.4, '#6b1c11');
    ribGrad.addColorStop(0.7, '#8f2913');
    ribGrad.addColorStop(1, '#2b0906');
    ctx.fillStyle = ribGrad;
    ctx.beginPath();
    ctx.roundRect(-size * 0.14, -size * 0.045, size * 0.32, size * 0.09, 8);
    ctx.fill();

    // Burnt honey glaze highlight
    ctx.fillStyle = 'rgba(247, 184, 52, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, -10, size * 0.1, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Toasted coriander seeds & piri-piri flakes
  for (let c = 0; c < 24; c++) {
    ctx.fillStyle = c % 2 === 0 ? '#d18630' : '#e6332a';
    ctx.beginPath();
    ctx.arc(cx + Math.sin(c * 2.8) * size * 0.2, cy + Math.cos(c * 1.9) * size * 0.15, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderChicken(ctx, cx, cy, size) {
  // Roasted chicken quarter
  ctx.save();
  ctx.translate(cx, cy);

  // Golden crisp skin with grill marks
  const chickGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 0.22);
  chickGrad.addColorStop(0, '#e59f3c');
  chickGrad.addColorStop(0.7, '#965319');
  chickGrad.addColorStop(1, '#3b1c09');
  ctx.fillStyle = chickGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.24, size * 0.18, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Distinct grill grate cross-hatch marks
  ctx.strokeStyle = 'rgba(25, 10, 5, 0.85)';
  ctx.lineWidth = 4;
  for (let l = -size * 0.15; l <= size * 0.15; l += 18) {
    ctx.beginPath();
    ctx.moveTo(l, -size * 0.12);
    ctx.lineTo(l + 30, size * 0.12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(l + 25, -size * 0.12);
    ctx.lineTo(l - 5, size * 0.12);
    ctx.stroke();
  }

  // Smoked paprika butter pool
  ctx.fillStyle = 'rgba(217, 56, 41, 0.6)';
  ctx.beginPath();
  ctx.ellipse(20, 20, size * 0.15, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Fresh rosemary sprig
  ctx.strokeStyle = '#2d541f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, size * 0.1);
  ctx.quadraticCurveTo(0, 0, size * 0.16, -size * 0.1);
  ctx.stroke();

  // Rosemary needles
  for (let n = -size * 0.12; n < size * 0.14; n += 10) {
    ctx.beginPath();
    ctx.moveTo(n, -n * 0.6);
    ctx.lineTo(n - 6, -n * 0.6 - 8);
    ctx.moveTo(n, -n * 0.6);
    ctx.lineTo(n + 6, -n * 0.6 + 8);
    ctx.stroke();
  }

  // Black lemon ash specks
  ctx.fillStyle = '#141414';
  for (let a = 0; a < 20; a++) {
    ctx.fillRect(Math.sin(a * 4) * size * 0.15, Math.cos(a * 3) * size * 0.1, 2, 2);
  }

  ctx.restore();
}

function renderPork(ctx, cx, cy, size) {
  // Pork pluma seared medallions
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(cx + (i - 1) * (size * 0.14), cy + (i % 2 === 0 ? -10 : 15));
    ctx.rotate((i - 1) * 0.25);

    ctx.fillStyle = '#24100b';
    ctx.beginPath();
    ctx.roundRect(-size * 0.12, -size * 0.08, size * 0.24, size * 0.16, 12);
    ctx.fill();

    const pGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, size * 0.1);
    pGrad.addColorStop(0, '#c75462');
    pGrad.addColorStop(0.7, '#8f2e3a');
    pGrad.addColorStop(1, '#4a151b');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.roundRect(-size * 0.1, -size * 0.065, size * 0.2, size * 0.13, 8);
    ctx.fill();

    ctx.restore();
  }

  // Charred pear slice
  ctx.save();
  ctx.translate(cx, cy + size * 0.15);
  ctx.rotate(-0.4);
  ctx.fillStyle = '#e5b842';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#291807';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function renderTartare(ctx, cx, cy, size) {
  // Neat circular ring of diced embered beef
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = '#180708';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Diced beef texture
  const tGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, size * 0.17);
  tGrad.addColorStop(0, '#8c1f28');
  tGrad.addColorStop(0.6, '#6b141c');
  tGrad.addColorStop(1, '#420a0f');
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // Diced beef chunks effect
  ctx.fillStyle = '#a82c37';
  for (let d = 0; d < 36; d++) {
    const dx = Math.sin(d * 4) * (size * 0.12);
    const dy = Math.cos(d * 3.3) * (size * 0.12);
    ctx.fillRect(dx, dy, 6, 6);
  }

  // Golden orange cured egg yolk in center crater
  const yolkGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, size * 0.06);
  yolkGrad.addColorStop(0, '#ffbb24');
  yolkGrad.addColorStop(0.8, '#f57a0a');
  yolkGrad.addColorStop(1, '#c95100');
  ctx.fillStyle = yolkGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Gloss highlight on yolk
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.02, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Pickled mustard seeds & micro-greens
  for (let m = 0; m < 20; m++) {
    ctx.fillStyle = m % 2 === 0 ? '#edd068' : '#3d6e2a';
    ctx.beginPath();
    ctx.arc(Math.sin(m * 2.7) * (size * 0.14), Math.cos(m * 2.1) * (size * 0.14), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
