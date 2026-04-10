import { useState } from "react";

import { buildCurriculumForm } from "../config/appData";
import {
  Field,
  SectionCard,
  StatusBadge,
  ghostButtonClass,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "../ui";

function CurriculumTab({ dashboard, selectedRole, submitAction, submitting }) {
  const [form, setForm] = useState(buildCurriculumForm(dashboard.curriculum));

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateCredit(field, value) {
    setForm((current) => ({
      ...current,
      creditDistribution: { ...current.creditDistribution, [field]: value },
    }));
  }

  function updateOutcome(index, field, value) {
    setForm((current) => ({
      ...current,
      courseOutcomes: current.courseOutcomes.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateMapping(index, field, value) {
    setForm((current) => ({
      ...current,
      coPoMapping: current.coPoMapping.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateCourseRevision(index, field, value) {
    setForm((current) => ({
      ...current,
      courseWiseRevision: current.courseWiseRevision.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await submitAction(
      "/curriculum",
      {
        actorRole: selectedRole,
        programName: form.programName,
        regulation: form.regulation,
        semesterWindow: form.semesterWindow,
        version: form.version,
        revisionPercentage: Number(form.revisionPercentage),
        detailedSyllabusSummary: form.detailedSyllabusSummary,
        justificationNote: form.justificationNote,
        benchmarkSources: form.benchmarkSources,
        creditDistribution: {
          foundation: Number(form.creditDistribution.foundation),
          core: Number(form.creditDistribution.core),
          elective: Number(form.creditDistribution.elective),
          projectAndInternship: Number(form.creditDistribution.projectAndInternship),
        },
        courseOutcomes: form.courseOutcomes,
        coPoMapping: form.coPoMapping.map((item) => ({
          ...item,
          po1: Number(item.po1),
          po2: Number(item.po2),
          po3: Number(item.po3),
          po4: Number(item.po4),
        })),
        courseWiseRevision: form.courseWiseRevision.map((item) => ({
          ...item,
          revisionPercentage: Number(item.revisionPercentage),
        })),
        uploadedPOs: form.uploadedPOs,
      },
      "Curriculum draft updated."
    );
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <SectionCard
        eyebrow="Curriculum"
        title="Draft curriculum pack"
        description="Maintain the syllabus summary, COs, CO-PO mapping, and revision details here."
        aside={
          <StatusBadge tone="active">
            {dashboard.curriculum.version} | {dashboard.curriculum.revisionBand}
          </StatusBadge>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Program name">
            <input
              className={inputClass}
              value={form.programName}
              onChange={(event) => updateField("programName", event.target.value)}
            />
          </Field>

          <Field label="Regulation">
            <input
              className={inputClass}
              value={form.regulation}
              onChange={(event) => updateField("regulation", event.target.value)}
            />
          </Field>

          <Field label="Semester window">
            <input
              className={inputClass}
              value={form.semesterWindow}
              onChange={(event) => updateField("semesterWindow", event.target.value)}
            />
          </Field>

          <Field label="Version">
            <input
              className={inputClass}
              value={form.version}
              onChange={(event) => updateField("version", event.target.value)}
            />
          </Field>

          <Field
            className="md:col-span-2"
            hint={`${form.revisionPercentage}% revision on 0-100 scale`}
            label="Syllabus revision percentage"
          >
            <input
              className="w-full accent-[#9B8EC7]"
              max="100"
              min="0"
              type="range"
              value={form.revisionPercentage}
              onChange={(event) => updateField("revisionPercentage", event.target.value)}
            />
          </Field>

          <Field className="md:col-span-2" label="Detailed course syllabus summary">
            <textarea
              className={textareaClass}
              rows="4"
              value={form.detailedSyllabusSummary}
              onChange={(event) => updateField("detailedSyllabusSummary", event.target.value)}
            />
          </Field>

          <Field className="md:col-span-2" label="Justification note">
            <textarea
              className={textareaClass}
              rows="4"
              value={form.justificationNote}
              onChange={(event) => updateField("justificationNote", event.target.value)}
            />
          </Field>

          <Field className="md:col-span-2" label="Benchmark sources">
            <textarea
              className={textareaClass}
              rows="3"
              value={form.benchmarkSources}
              onChange={(event) => updateField("benchmarkSources", event.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Credits"
        title="Credit distribution"
        description="Enter foundation, core, elective, and project or internship credits here."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["foundation", "Foundation"],
            ["core", "Core"],
            ["elective", "Elective"],
            ["projectAndInternship", "Project / Internship"],
          ].map(([field, label]) => (
            <Field key={field} label={label}>
              <input
                className={inputClass}
                type="number"
                value={form.creditDistribution[field]}
                onChange={(event) => updateCredit(field, event.target.value)}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="COs"
        title="Course outcomes"
        description="Add a new course outcome whenever needed."
        aside={
          <button
            className={ghostButtonClass}
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                courseOutcomes: [
                  ...current.courseOutcomes,
                  { code: "", description: "", bloomsLevel: "Apply" },
                ],
              }))
            }
          >
            Add CO
          </button>
        }
      >
        <div className="grid gap-3">
          {form.courseOutcomes.map((outcome, index) => (
            <div key={`${outcome.code}-${index}`} className="grid gap-3 rounded-[22px] border border-sky/60 bg-shell/55 p-4 md:grid-cols-[0.8fr_2fr_1fr]">
              <input
                className={inputClass}
                placeholder="CO code"
                value={outcome.code}
                onChange={(event) => updateOutcome(index, "code", event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Outcome description"
                value={outcome.description}
                onChange={(event) => updateOutcome(index, "description", event.target.value)}
              />
              <select
                className={inputClass}
                value={outcome.bloomsLevel}
                onChange={(event) => updateOutcome(index, "bloomsLevel", event.target.value)}
              >
                <option>Remember</option>
                <option>Understand</option>
                <option>Apply</option>
                <option>Analyze</option>
                <option>Evaluate</option>
                <option>Create</option>
              </select>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Mapping"
        title="CO-PO mapping"
        description="Fill in each row with a CO and its PO weights."
        aside={
          <button
            className={ghostButtonClass}
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                coPoMapping: [
                  ...current.coPoMapping,
                  { coCode: "", po1: "0", po2: "0", po3: "0", po4: "0" },
                ],
              }))
            }
          >
            Add mapping
          </button>
        }
      >
        <div className="grid gap-3">
          {form.coPoMapping.map((mapping, index) => (
            <div key={`${mapping.coCode}-${index}`} className="grid gap-3 rounded-[22px] border border-sky/60 bg-shell/55 p-4 md:grid-cols-5">
              <input
                className={inputClass}
                placeholder="CO"
                value={mapping.coCode}
                onChange={(event) => updateMapping(index, "coCode", event.target.value)}
              />
              {["po1", "po2", "po3", "po4"].map((field) => (
                <input
                  key={field}
                  className={inputClass}
                  max="3"
                  min="0"
                  type="number"
                  value={mapping[field]}
                  onChange={(event) => updateMapping(index, field, event.target.value)}
                />
              ))}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Revision"
        title="Course-wise revision percentage"
        description="Track individual course changes here."
        aside={
          <button
            className={ghostButtonClass}
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                courseWiseRevision: [
                  ...current.courseWiseRevision,
                  { courseCode: "", courseTitle: "", revisionPercentage: "0" },
                ],
              }))
            }
          >
            Add course
          </button>
        }
      >
        <div className="grid gap-3">
          {form.courseWiseRevision.map((item, index) => (
            <div key={`${item.courseCode}-${index}`} className="grid gap-3 rounded-[22px] border border-sky/60 bg-shell/55 p-4 md:grid-cols-[0.9fr_1.8fr_0.8fr]">
              <input
                className={inputClass}
                placeholder="Course code"
                value={item.courseCode}
                onChange={(event) => updateCourseRevision(index, "courseCode", event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Course title"
                value={item.courseTitle}
                onChange={(event) => updateCourseRevision(index, "courseTitle", event.target.value)}
              />
              <input
                className={inputClass}
                max="100"
                min="0"
                type="number"
                value={item.revisionPercentage}
                onChange={(event) =>
                  updateCourseRevision(index, "revisionPercentage", event.target.value)
                }
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="POs"
        title="Upload Program Outcomes"
        description="Upload the relevant program outcomes (PO/PSO/CLO) mapping documents."
      >
        <div className="grid gap-3">
          {form.uploadedPOs.map((po, index) => (
            <div key={index} className="flex gap-2">
              <input
                className={inputClass}
                placeholder="PO file reference or name"
                value={po}
                onChange={(event) => {
                  setForm(current => {
                    const newPOs = [...current.uploadedPOs];
                    newPOs[index] = event.target.value;
                    return { ...current, uploadedPOs: newPOs };
                  });
                }}
              />
            </div>
          ))}
          <button
            className={ghostButtonClass}
            type="button"
            onClick={() => {
              setForm(current => ({ ...current, uploadedPOs: [...current.uploadedPOs, ""] }));
            }}
          >
            Add PO reference
          </button>
        </div>
      </SectionCard>

      <button
        className={primaryButtonClass}
        disabled={submitting || !dashboard.allowedActions.canEditCurriculum}
        type="submit"
      >
        Save draft
      </button>
    </form>
  );
}

export default CurriculumTab;
