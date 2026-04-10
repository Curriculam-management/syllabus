import { useState } from "react";

import {
  emptyMeetingForm,
  splitDocuments,
  splitMembers,
} from "../config/appData";
import { formatDate } from "../utils/formatters";
import { uploadFiles } from "../services/uploadFiles";
import {
  Field,
  SectionCard,
  StatusBadge,
  ghostButtonClass,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "../ui";

function MeetingsTab({ dashboard, selectedRole, submitAction, submitting }) {
  const [form, setForm] = useState(emptyMeetingForm);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [localMessage, setLocalMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLocalMessage(null);
      const uploadedEvidence = await uploadFiles(evidenceFiles);

      await submitAction(
        "/meetings",
        {
          ...form,
          actorRole: selectedRole,
          noticeSentBy: form.noticeSentBy,
          supportingDocuments: splitDocuments(form.supportingDocuments),
          presentMembers: splitMembers(form.presentMembers),
          absentMembers: splitMembers(form.absentMembers),
          totalAppointedMembers: Number(form.totalAppointedMembers),
          evidenceImages: uploadedEvidence.map((item) => item.url),
        },
        "Meeting registered with compliant notice window."
      );

      setForm(emptyMeetingForm);
      setEvidenceFiles([]);
      setLocalMessage({
        type: "success",
        text: "Meeting saved with notice sender and uploaded photos.",
      });
    } catch (error) {
      setLocalMessage({
        type: "error",
        text: error.message || "Unable to save meeting details.",
      });
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard
        eyebrow="Meetings"
        title="Schedule a meeting"
        description="The Member Secretary usually circulates the notice. The HOD conducts the meeting as Chairperson."
      >
        {localMessage ? (
          <div
            className={`mb-5 rounded-[22px] border px-4 py-3 text-sm ${
              localMessage.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-sky/60 bg-white/70 text-ink"
            }`}
          >
            {localMessage.text}
          </div>
        ) : null}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Meeting type">
            <select
              className={inputClass}
              value={form.meetingType}
              onChange={(event) => setForm((current) => ({ ...current, meetingType: event.target.value }))}
            >
              <option>DCC</option>
              <option>BoS</option>
            </select>
          </Field>

          <Field label="Meeting title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </Field>

          <Field label="Scheduled on">
            <input
              className={inputClass}
              type="date"
              value={form.scheduledOn}
              onChange={(event) => setForm((current) => ({ ...current, scheduledOn: event.target.value }))}
            />
          </Field>

          <Field label="Time of meeting">
            <input
              className={inputClass}
              type="time"
              value={form.scheduledTime}
              onChange={(event) => setForm((current) => ({ ...current, scheduledTime: event.target.value }))}
            />
          </Field>

          <Field label="Mode of meeting">
            <select
              className={inputClass}
              value={form.mode}
              onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}
            >
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </select>
          </Field>

          <Field label="Notice issued on">
            <input
              className={inputClass}
              type="date"
              value={form.noticeIssuedOn}
              onChange={(event) => setForm((current) => ({ ...current, noticeIssuedOn: event.target.value }))}
            />
          </Field>

          <Field label="Notice sent by">
            <select
              className={inputClass}
              value={form.noticeSentBy}
              onChange={(event) => setForm((current) => ({ ...current, noticeSentBy: event.target.value }))}
            >
              <option>Member Secretary</option>
              <option>HOD</option>
            </select>
          </Field>

          <Field label="Total appointed members">
            <input
              className={inputClass}
              min="1"
              type="number"
              value={form.totalAppointedMembers}
              onChange={(event) =>
                setForm((current) => ({ ...current, totalAppointedMembers: event.target.value }))
              }
            />
          </Field>

          <Field className="md:col-span-2" label="Agenda">
            <textarea
              className={textareaClass}
              rows="3"
              value={form.agenda}
              onChange={(event) => setForm((current) => ({ ...current, agenda: event.target.value }))}
            />
          </Field>

          <Field
            className="md:col-span-2"
            hint="Comma separated references"
            label="Supporting documents"
          >
            <input
              className={inputClass}
              value={form.supportingDocuments}
              onChange={(event) =>
                setForm((current) => ({ ...current, supportingDocuments: event.target.value }))
              }
            />
          </Field>

          <Field
            className="md:col-span-2"
            hint="Upload a meeting banner, notice image, or geo-tagged photos."
            label="Meeting images / e-banner / photos"
          >
            <input
              className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-violet file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
              multiple
              accept="image/*"
              type="file"
              onChange={(event) => setEvidenceFiles(Array.from(event.target.files || []))}
            />
          </Field>

          <Field className="md:col-span-2" hint="Comma separated names" label="Present members">
            <input
              className={inputClass}
              value={form.presentMembers}
              onChange={(event) => setForm((current) => ({ ...current, presentMembers: event.target.value }))}
            />
          </Field>

          <Field className="md:col-span-2" hint="Comma separated names" label="Absent members">
            <input
              className={inputClass}
              value={form.absentMembers}
              onChange={(event) => setForm((current) => ({ ...current, absentMembers: event.target.value }))}
            />
          </Field>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-sky/60 bg-shell/55 px-4 py-3 text-sm text-slate-700">
              <input
                checked={form.externalExpertPresent}
                className="h-4 w-4 accent-[#9B8EC7]"
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({ ...current, externalExpertPresent: event.target.checked }))
                }
              />
              <span>External expert present</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-sky/60 bg-shell/55 px-4 py-3 text-sm text-slate-700">
              <input
                checked={form.chairpersonSigned}
                className="h-4 w-4 accent-[#9B8EC7]"
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({ ...current, chairpersonSigned: event.target.checked }))
                }
              />
              <span>Chairperson signed MoM</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-sky/60 bg-shell/55 px-4 py-3 text-sm text-slate-700">
              <input
                checked={form.memberSecretarySigned}
                className="h-4 w-4 accent-[#9B8EC7]"
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    memberSecretarySigned: event.target.checked,
                  }))
                }
              />
              <span>Member Secretary signed MoM</span>
            </label>
          </div>

          <Field className="md:col-span-2" label="Decisions">
            <textarea
              className={textareaClass}
              rows="3"
              value={form.decisions}
              onChange={(event) => setForm((current) => ({ ...current, decisions: event.target.value }))}
            />
          </Field>

          <Field className="md:col-span-2" label="Recommendations">
            <textarea
              className={textareaClass}
              rows="3"
              value={form.recommendations}
              onChange={(event) =>
                setForm((current) => ({ ...current, recommendations: event.target.value }))
              }
            />
          </Field>

          <button
            className={`${primaryButtonClass} md:col-span-2`}
            disabled={submitting || !dashboard.allowedActions.canCreateMeeting}
            type="submit"
          >
            Save meeting
          </button>
        </form>
      </SectionCard>

      <SectionCard
        eyebrow="Register"
        title="DCC and BoS records"
        description="Every saved meeting appears here with notice, attendance, signatures, and evidence."
      >
        <div className="grid gap-4">
          {dashboard.meetings.map((meeting) => {
            const presentCount = meeting.attendance.filter((member) => member.present).length;

            return (
              <article
                key={meeting.id}
                className="rounded-[24px] border border-sky/60 bg-shell/55 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{meeting.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {meeting.meetingType} | {formatDate(meeting.scheduledOn)} | {meeting.scheduledTime}
                    </p>
                  </div>
                  <StatusBadge tone={meeting.status === "completed" ? "completed" : "pending"}>
                    {meeting.status}
                  </StatusBadge>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">{meeting.agenda}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge tone="active">Notice: {meeting.noticeLeadDays} days</StatusBadge>
                  <StatusBadge tone={meeting.quorumMet ? "completed" : "pending"}>
                    Attendance: {presentCount}/{meeting.attendance.length}
                  </StatusBadge>
                  <StatusBadge tone={meeting.externalExpertPresent ? "completed" : "pending"}>
                    {meeting.externalExpertPresent ? "Expert present" : "Expert missing"}
                  </StatusBadge>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>Mode: {meeting.mode}</p>
                  <p>Notice sent by: {meeting.noticeSentBy || "Member Secretary"}</p>
                  <p>Supporting docs: {meeting.supportingDocuments?.join(", ") || "Not listed"}</p>
                  <p>
                    Signatures: {meeting.chairpersonSigned ? "Chairperson" : "Chairperson pending"} /{" "}
                    {meeting.memberSecretarySigned ? "Member Secretary" : "Member Secretary pending"}
                  </p>
                </div>

                {meeting.evidenceImages?.length ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {meeting.evidenceImages.map((imageUrl) => (
                      <a
                        key={imageUrl}
                        className={ghostButtonClass}
                        href={imageUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open image
                      </a>
                    ))}
                  </div>
                ) : null}

                <p className="mt-4 text-sm text-slate-600">{meeting.minutes || "MoM pending."}</p>
              </article>
            );
          })}
        </div>
      </SectionCard>
    </section>
  );
}

export default MeetingsTab;
