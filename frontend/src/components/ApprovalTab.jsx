import { useState } from "react";

import { getAdvanceLabel } from "../config/appData";
import {
  Field,
  SectionCard,
  StatusBadge,
  ghostButtonClass,
  primaryButtonClass,
  textareaClass,
} from "../ui";

function ApprovalTab({ dashboard, selectedRole, submitAction, submitting }) {
  const [note, setNote] = useState("");

  async function handleAdvance() {
    await submitAction(
      "/workflow/advance",
      {
        actorRole: selectedRole,
        note,
      },
      "Workflow moved to the next governance stage."
    );

    setNote("");
  }

  async function handleReject() {
    await submitAction(
      "/workflow/reject",
      {
        actorRole: selectedRole,
        note,
      },
      "Workflow rejected back to feedback stage."
    );

    setNote("");
  }

  async function handlePublish() {
    await submitAction(
      "/workflow/publish",
      {
        actorRole: selectedRole,
      },
      "Approved curriculum is now marked live on website / ERP."
    );
  }

  const checklist = [
    {
      tone: dashboard.feedbackEntries.length > 0 ? "completed" : "pending",
      badge: dashboard.feedbackEntries.length > 0 ? "Ready" : "Pending",
      text: "Stakeholder feedback has been collected.",
    },
    {
      tone: "completed",
      badge: dashboard.curriculum.version,
      text: "Curriculum pack includes COs, mapping, syllabus summary, and justification note.",
    },
    {
      tone: dashboard.insights.bosCompliance.externalExpertPresent ? "completed" : "pending",
      badge: dashboard.insights.bosCompliance.externalExpertPresent ? "Expert present" : "Expert missing",
      text: "BoS requires at least one external expert.",
    },
    {
      tone: dashboard.insights.bosCompliance.quorumMet ? "completed" : "pending",
      badge: dashboard.insights.bosCompliance.quorumMet ? "Quorum met" : "Quorum pending",
      text: "Quorum must be satisfied before the workflow can move forward.",
    },
    {
      tone: dashboard.insights.bosCompliance.signaturesReady ? "completed" : "pending",
      badge: dashboard.insights.bosCompliance.signaturesReady ? "Signed MoM" : "Pending signatures",
      text: "Chairperson and Member Secretary signatures are required on BoS minutes.",
    },
    {
      tone:
        dashboard.workflow.currentStage === "implementation" ||
          dashboard.workflow.currentStage === "cqi" ||
          dashboard.workflow.published
          ? "completed"
          : "pending",
      badge:
        dashboard.workflow.currentStage === "implementation" ||
          dashboard.workflow.currentStage === "cqi" ||
          dashboard.workflow.published
          ? "Council approved"
          : "Awaiting council",
      text: "Academic Council approval must be complete before implementation starts.",
    },
    {
      tone: dashboard.allowedActions.canPublish ? "published" : "pending",
      badge: dashboard.allowedActions.canPublish ? "Unlocked" : "Locked",
      text: "Publish control belongs only to Final Boss.",
    },
  ];

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        eyebrow="Approval"
        title="Workflow control"
        description="Move the workflow to the next stage from here. Publish is unlocked only for the Final Boss."
        aside={<StatusBadge tone={dashboard.workflow.published ? "published" : "active"}>{dashboard.workflow.statusLabel}</StatusBadge>}
      >
        <Field label="Approval note / recommendation">
          <textarea
            className={textareaClass}
            rows="5"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            className={primaryButtonClass}
            disabled={submitting || !dashboard.allowedActions.canAdvanceWorkflow}
            type="button"
            onClick={handleAdvance}
          >
            {getAdvanceLabel(dashboard.workflow.currentStage)}
          </button>

          {dashboard.allowedActions.canRejectWorkflow && (
            <button
              className="px-5 py-2.5 rounded-[18px] text-sm font-semibold tracking-wide border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 active:bg-rose-500/30 disabled:opacity-50 transition-colors"
              disabled={submitting}
              type="button"
              onClick={handleReject}
            >
              Reject to Draft / Feedback
            </button>
          )}

          <button
            className={ghostButtonClass}
            disabled={submitting || !dashboard.allowedActions.canPublish}
            type="button"
            onClick={handlePublish}
          >
            Publish to website / ERP
          </button>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Checklist"
        title="Release conditions"
        description="These conditions should be clearly visible before final approval."
      >
        <div className="grid gap-3">
          {checklist.map((item) => (
            <div
              key={item.text}
              className="flex flex-col gap-3 rounded-[22px] border border-sky/60 bg-shell/50 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <p className="text-sm leading-6 text-slate-700">{item.text}</p>
              <StatusBadge tone={item.tone}>{item.badge}</StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

export default ApprovalTab;
