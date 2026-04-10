import { useState } from "react";

import { emptyCqiForm } from "../config/appData";
import { formatDate } from "../utils/formatters";
import {
  Field,
  SectionCard,
  StatusBadge,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "../ui";

function CQITab({ dashboard, selectedRole, submitAction, submitting }) {
  const [form, setForm] = useState(emptyCqiForm);

  async function handleSubmit(event) {
    event.preventDefault();

    await submitAction(
      "/cqi",
      {
        ...form,
        actorRole: selectedRole,
      },
      "CQI action recorded and linked back to the DCC cycle."
    );

    setForm(emptyCqiForm);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        eyebrow="CQI"
        title="Record improvement actions"
        description="Annual analysis and improvement recommendations are captured here."
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Academic session">
            <input
              className={inputClass}
              value={form.session}
              onChange={(event) =>
                setForm((current) => ({ ...current, session: event.target.value }))
              }
            />
          </Field>

          <Field label="Source of analysis">
            <input
              className={inputClass}
              value={form.source}
              onChange={(event) =>
                setForm((current) => ({ ...current, source: event.target.value }))
              }
            />
          </Field>

          <Field className="md:col-span-2" label="Result analysis">
            <textarea
              className={textareaClass}
              rows="4"
              value={form.analysis}
              onChange={(event) =>
                setForm((current) => ({ ...current, analysis: event.target.value }))
              }
            />
          </Field>

          <Field className="md:col-span-2" label="Recommended action">
            <textarea
              className={textareaClass}
              rows="4"
              value={form.recommendation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recommendation: event.target.value,
                }))
              }
            />
          </Field>

          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-sky/60 bg-shell/55 px-4 py-3 text-sm text-slate-700">
            <input
              checked={form.forwardedToDcc}
              className="h-4 w-4 accent-[#9B8EC7]"
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  forwardedToDcc: event.target.checked,
                }))
              }
            />
            <span>Forward this CQI action to DCC for the next revision cycle</span>
          </label>

          <button
            className={`${primaryButtonClass} md:col-span-2`}
            disabled={submitting || !dashboard.allowedActions.canCreateCqi}
            type="submit"
          >
            Save CQI action
          </button>
        </form>
      </SectionCard>

      <SectionCard
        eyebrow="CQI Register"
        title="Logged actions"
        aside={<StatusBadge tone="active">{dashboard.insights.cqiCount} entries</StatusBadge>}
      >
        <div className="grid gap-4">
          {dashboard.cqiEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[24px] border border-sky/60 bg-shell/55 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{entry.session}</h3>
                  <p className="mt-1 text-sm text-slate-600">{entry.source}</p>
                </div>
                <StatusBadge tone={entry.forwardedToDcc ? "completed" : "pending"}>
                  {entry.forwardedToDcc ? "Sent to DCC" : "Open"}
                </StatusBadge>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">{entry.analysis}</p>
              <p className="mt-3 text-sm text-slate-600">{entry.recommendation}</p>
              <p className="mt-3 text-sm text-slate-500">
                Logged by {entry.createdBy} on {formatDate(entry.createdOn)}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

export default CQITab;
