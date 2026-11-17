// Piccoli aiuti di disegno usati da più file (abilità, aspetti dei personaggi).

export function cerchio(ctx, x, y, r, colore) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = colore;
  ctx.fill();
}

// Stellina a 5 punte. "giro" = rotazione in radianti.
export function stella(ctx, x, y, r, giro, colore) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = giro + (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = colore;
  ctx.fill();
}
