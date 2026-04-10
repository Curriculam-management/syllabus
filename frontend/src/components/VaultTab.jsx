import { useState } from "react";

import { emptyDocumentForm } from "../config/appData";
import { formatDate } from "../utils/formatters";
import {
  Field,
  SectionCard,
  StatusBadge,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "../ui";

function VaultTab({ dashboard, selectedRole, submitAction, submitting }) {
  const [form, setForm] = useState(emptyDocumentForm);

  async function handleSubmit(event) {
    event.preventDefault();

    await submitAction(
      "/documents",
      {
        ...form,
        actorRole: selectedRole,
      },
      "Document added to the vault."
    );

    setForm(emptyDocumentForm);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        eyebrow="Vault"
        title="Archive records"
        description="Meeting records, notices, approvals, and evidence are archived here."
        aside={
          <StatusBadge tone="active">
            {dashboard.insights.requiredRecordCoverage.covered}/
            {dashboard.insights.requiredRecordCoverage.total} SOP records
          </StatusBadge>
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Document name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>

          <Field label="Document type">
            <select
              className={inputClass}
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            >
              <option>DCC and BoS Constitution Order</option>
              <option>Minutes of DCC Meeting</option>
              <option>BoS Meeting Notice</option>
              <option>BoS Meeting Agenda</option>
              <option>Attendance Sheet of BoS Members</option>
              <option>Minutes of BoS Meeting</option>
              <option>Geo-tagged Photograph with E-Banner</option>
              <option>Approved Curriculum / Curriculum Revision Document</option>
              <option>Academic Council Approval</option>
            </select>
          </Field>

          <Field label="Version">
            <input
              className={inputClass}
              placeholder="Optional"
              value={form.version}
              onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))}
            />
          </Field>

          <Field label="File reference">
            <input
              className={inputClass}
              value={form.reference}
              onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))}
            />
          </Field>

          <Field label="Geo-tag">
            <input
              className={inputClass}
              value={form.geotag}
              onChange={(event) => setForm((current) => ({ ...current, geotag: event.target.value }))}
            />
          </Field>

          <Field className="md:col-span-2" label="Notes">
            <textarea
              className={textareaClass}
              rows="4"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </Field>

          <button
            className={`${primaryButtonClass} md:col-span-2`}
            disabled={submitting || !dashboard.allowedActions.canManageDocuments}
            type="submit"
          >
            Archive record
          </button>
        </form>
      </SectionCard>

      <SectionCard
        eyebrow="Records"
        title="Archived documents"
        description="Uploaded records and missing SOP documents are both listed clearly."
      >
        <div className="grid gap-3">
          {dashboard.documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-col gap-3 rounded-[22px] border border-sky/60 bg-shell/55 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <h3 className="text-base font-semibold text-ink">{document.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {document.type} | {document.reference}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge tone="completed">{document.version}</StatusBadge>
                <span className="text-sm text-slate-500">{formatDate(document.uploadedOn)}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-lilac/60 bg-white/65 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
            Missing SOP records
          </p>
          {dashboard.insights.requiredRecordCoverage.missing.length ? (
            <div className="mt-4 grid gap-2">
              {dashboard.insights.requiredRecordCoverage.missing.map((record) => (
                <p key={record} className="text-sm text-slate-600">
                  {record}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              All mandatory departmental records are available.
            </p>
          )}
        </div>
      </SectionCard>
    </section>
  );
}

export default VaultTab;
