"use client";
// Tiếng chuông nhẹ tổng hợp bằng Web Audio (không cần file âm thanh).
let ctx: AudioContext | null = null;

export function chime(kind: "pick" | "flip" | "shuffle" = "flip") {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;
    const notes = kind === "pick" ? [880] : kind === "shuffle" ? [392, 523] : [660, 990, 1320];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = now + i * 0.07;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(kind === "pick" ? 0.05 : 0.07, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "flip" ? 1.8 : 0.6));
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 2);
    });
  } catch {
    /* trình duyệt không hỗ trợ âm thanh: bỏ qua */
  }
}
