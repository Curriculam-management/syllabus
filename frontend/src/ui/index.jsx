const badgeTones = {
  active: "border-violet/30 bg-violet/15 text-violet",
  completed: "border-sage/40 bg-sage/30 text-slate-700",
  pending: "border-lilac/45 bg-lilac/20 text-ink",
  published: "border-sky/40 bg-sky/35 text-ink",
};

export const shellClass = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8";
export const cardClass =
  "rounded-[28px] border border-white/70 bg-white/80 shadow-card backdrop-blur-sm";
export const panelClass = `${cardClass} p-5 sm:p-6`;
export const inputClass =
  "w-full rounded-2xl border border-sky/70 bg-shell/70 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/15";
export const textareaClass = `${inputClass} min-h-28 resize-y`;
export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-sky/70 bg-sky/45 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-sky/70 disabled:cursor-not-allowed disabled:opacity-50";
export const ghostButtonClass =
  "inline-flex items-center justify-center rounded-full border border-lilac/60 bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-violet hover:text-violet disabled:cursor-not-allowed disabled:opacity-50";

export function StatusBadge({ tone = "active", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        badgeTones[tone] || badgeTones.active
      }`}
    >
      {children}
    </span>
  );
}

export function MetricCard({ label, value, note }) {
  return (
    <article className={`${cardClass} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">{label}</p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">{value}</h3>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
    </article>
  );
}

export function SectionCard({ eyebrow, title, description, aside, children, className = "" }) {
  return (
    <section className={`${panelClass} ${className}`.trim()}>
      {eyebrow || title || description || aside ? (
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="mt-2 text-2xl font-semibold text-ink">{title}</h2> : null}
            {description ? (
              <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

export function Field({ label, hint, className = "", children }) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <span className="mt-2 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
