import { useState } from "react";

import { emptyFeedbackForm } from "../config/appData";
import {
  Field,
  MetricCard,
  SectionCard,
  StatusBadge,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "../ui";

function FeedbackTab({ dashboard, selectedRole, submitAction, submitting }) {
  const [form, setForm] = useState(emptyFeedbackForm);
  const isFeedbackRole = selectedRole === "Feedback";

  async function handleSubmit(event) {
    event.preventDefault();

    await submitAction(
      "/feedback",
      {
        ...form,
        actorRole: selectedRole,
        rating: Number(form.rating),
      },
      "Feedback recorded successfully."
    );

    setForm(emptyFeedbackForm);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        eyebrow="Feedback"
        title={isFeedbackRole ? "Submit your feedback" : "Feedback summary"}
        description={
          isFeedbackRole
            ? "This is the only page for students and alumni. Feedback is submitted here."
            : "HOD reviews the collected feedback here so it can be used during curriculum drafting."
        }
      >
        {isFeedbackRole ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Stakeholder type">
              <select
                className={inputClass}
                value={form.stakeholderType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stakeholderType: event.target.value }))
                }
              >
                <option>Teacher</option>
                <option>Industry</option>
                <option>Alumni</option>
                <option>Student</option>
              </select>
            </Field>

            <Field label="Contributor name">
              <input
                className={inputClass}
                value={form.contributorName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contributorName: event.target.value }))
                }
              />
            </Field>

            <Field label="Organization">
              <input
                className={inputClass}
                value={form.organization}
                onChange={(event) =>
                  setForm((current) => ({ ...current, organization: event.target.value }))
                }
              />
            </Field>

            <Field label="Rating">
              <input
                className={inputClass}
                max="5"
                min="1"
                type="number"
                value={form.rating}
                onChange={(event) =>
                  setForm((current) => ({ ...current, rating: event.target.value }))
                }
              />
            </Field>

            <Field className="md:col-span-2" label="Key insight">
              <textarea
                className={textareaClass}
                rows="4"
                value={form.insight}
                onChange={(event) =>
                  setForm((current) => ({ ...current, insight: event.target.value }))
                }
              />
            </Field>

            <Field className="md:col-span-2" label="Recommendation">
              <textarea
                className={textareaClass}
                rows="4"
                value={form.recommendation}
                onChange={(event) =>
                  setForm((current) => ({ ...current, recommendation: event.target.value }))
                }
              />
            </Field>

            <button className={`${primaryButtonClass} md:col-span-2`} disabled={submitting} type="submit">
              Save feedback
            </button>
          </form>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Entries"
              note="feedback records collected so far"
              value={dashboard.insights.feedbackCount}
            />
            <MetricCard
              label="Average rating"
              note="overall stakeholder sentiment"
              value={`${dashboard.insights.feedbackAverage}/5`}
            />
          </div>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Register"
        title="Collected feedback"
        description="Recent submissions are listed here in a simple readable format."
      >
        <div className="grid gap-4">
          {dashboard.feedbackEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[24px] border border-sky/60 bg-shell/55 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{entry.contributorName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {entry.stakeholderType} | {entry.organization}
                  </p>
                </div>
                <StatusBadge tone="completed">{entry.rating}/5</StatusBadge>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">{entry.insight}</p>
              <p className="mt-3 text-sm text-slate-600">{entry.recommendation}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

export default FeedbackTab;
