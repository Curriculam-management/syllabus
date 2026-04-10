export const API_BASE = "/api/governance";

export const roleOptions = [
  "HOD",
  "Teacher",
  "DCC",
  "BOS",
  "Member Secretary",
  "External Expert",
  "Final Boss",
  "Feedback",
];

export const moduleMeta = {
  curriculum: {
    title: "Curriculum Designer",
    description: "Prepare syllabus draft, COs, CO-PO mapping, and revision details.",
  },
  feedback: {
    title: "Feedback Portal",
    description: "Collect and review stakeholder inputs from students, alumni, and industry.",
  },
  meetings: {
    title: "Meeting Management",
    description: "Issue notices, manage agenda, attendance, and minutes of meeting.",
  },
  approval: {
    title: "Approval Desk",
    description: "Review compliance checks, move the workflow forward, and control publication.",
  },
  mom: {
    title: "MOM Archive",
    description: "Store MOMs, required records, approvals, notices, and meeting evidence.",
  },
  cqi: {
    title: "CQI",
    description: "Record annual result analysis and improvement actions for the next revision cycle.",
  },
};

export const emptyFeedbackForm = {
  stakeholderType: "Industry",
  contributorName: "",
  organization: "",
  rating: "5",
  insight: "",
  recommendation: "",
};

export const emptyMeetingForm = {
  meetingType: "DCC",
  title: "",
  scheduledOn: "",
  scheduledTime: "",
  mode: "Offline",
  noticeIssuedOn: "",
  noticeSentBy: "Member Secretary",
  agenda: "",
  supportingDocuments: "",
  presentMembers: "",
  absentMembers: "",
  totalAppointedMembers: "10",
  externalExpertPresent: false,
  chairpersonSigned: true,
  memberSecretarySigned: true,
  decisions: "",
  recommendations: "",
};

export const emptyDocumentForm = {
  name: "",
  type: "DCC and BoS Constitution Order",
  version: "",
  reference: "",
  geotag: "",
  notes: "",
};

export const emptyCqiForm = {
  session: "",
  source: "",
  analysis: "",
  recommendation: "",
  forwardedToDcc: true,
};

function createEmptyCourseRevision() {
  return {
    courseCode: "",
    courseTitle: "",
    revisionPercentage: "0",
  };
}

export function buildCurriculumForm(curriculum) {
  if (!curriculum) {
    return {
      programName: "",
      regulation: "",
      semesterWindow: "",
      version: "",
      revisionPercentage: "0",
      detailedSyllabusSummary: "",
      justificationNote: "",
      benchmarkSources: "",
      creditDistribution: {
        foundation: "0",
        core: "0",
        elective: "0",
        projectAndInternship: "0",
      },
      courseOutcomes: [{ code: "", description: "", bloomsLevel: "Apply" }],
      coPoMapping: [{ coCode: "", po1: "0", po2: "0", po3: "0", po4: "0" }],
      courseWiseRevision: [createEmptyCourseRevision()],
      uploadedPOs: [],
    };
  }

  return {
    programName: curriculum.programName || "",
    regulation: curriculum.regulation || "",
    semesterWindow: curriculum.semesterWindow || "",
    version: curriculum.version || "",
    revisionPercentage: String(curriculum.revisionPercentage ?? 0),
    detailedSyllabusSummary: curriculum.detailedSyllabusSummary || "",
    justificationNote: curriculum.justificationNote || "",
    benchmarkSources: curriculum.benchmarkSources || "",
    creditDistribution: {
      foundation: String(curriculum.creditDistribution?.foundation ?? 0),
      core: String(curriculum.creditDistribution?.core ?? 0),
      elective: String(curriculum.creditDistribution?.elective ?? 0),
      projectAndInternship: String(
        curriculum.creditDistribution?.projectAndInternship ?? 0
      ),
    },
    courseOutcomes:
      curriculum.courseOutcomes?.length > 0
        ? curriculum.courseOutcomes.map((item) => ({
          code: item.code || "",
          description: item.description || "",
          bloomsLevel: item.bloomsLevel || "Apply",
        }))
        : [{ code: "", description: "", bloomsLevel: "Apply" }],
    coPoMapping:
      curriculum.coPoMapping?.length > 0
        ? curriculum.coPoMapping.map((item) => ({
          coCode: item.coCode || "",
          po1: String(item.po1 ?? 0),
          po2: String(item.po2 ?? 0),
          po3: String(item.po3 ?? 0),
          po4: String(item.po4 ?? 0),
        }))
        : [{ coCode: "", po1: "0", po2: "0", po3: "0", po4: "0" }],
    courseWiseRevision:
      curriculum.courseWiseRevision?.length > 0
        ? curriculum.courseWiseRevision.map((item) => ({
          courseCode: item.courseCode || "",
          courseTitle: item.courseTitle || "",
          revisionPercentage: String(item.revisionPercentage ?? 0),
        }))
        : [createEmptyCourseRevision()],
    uploadedPOs:
      curriculum.uploadedPOs?.length > 0 ? curriculum.uploadedPOs : [],
  };
}

export function splitMembers(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitDocuments(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAdvanceLabel(stageKey) {
  const labels = {
    feedback: "Submit to HOD Review",
    hodReview: "Send to DCC",
    dcc: "Send to BoS",
    bos: "Escalate to Final Boss",
    finalBoss: "Unlock Implementation",
    implementation: "Move to CQI",
  };

  return labels[stageKey] || "Advance Workflow";
}

export function encodeRole(role) {
  return encodeURIComponent(role);
}

export function decodeRole(roleParam) {
  return decodeURIComponent(roleParam || "");
}
