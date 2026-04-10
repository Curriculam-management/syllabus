const ROLE_TABS = {
  HOD: ["curriculum", "meetings", "approval", "cqi", "feedback", "mom"],
  Teacher: ["curriculum", "cqi"],
  DCC: ["mom", "approval"],
  BOS: ["mom", "approval"],
  "Member Secretary": ["meetings", "mom"],
  "External Expert": ["curriculum"],
  "Final Boss": ["approval", "mom"],
  Feedback: ["feedback"],
};

const WORKFLOW_STAGES = [
  {
    key: "feedback",
    label: "Teacher Draft & Feedback",
    owner: "Teacher, Industry, Alumni, Students",
    summary: "Teacher prepares draft curriculum, uploads POs, and receives feedback.",
  },
  {
    key: "hodReview",
    label: "HOD Review",
    owner: "HOD",
    summary: "HOD reviews teacher data. Can approve to DCC or reject.",
  },
  {
    key: "dcc",
    label: "DCC Approval",
    owner: "DCC",
    summary: "DCC reviews the HOD approved draft. Generates MOM.",
  },
  {
    key: "bos",
    label: "BOS Approval",
    owner: "BOS, External Expert",
    summary: "BoS & External Expert approve the proposal. Generates MOM.",
  },
  {
    key: "finalBoss",
    label: "Final Boss Approval",
    owner: "Final Boss",
    summary: "Final Boss gives final approval. Generates MOM.",
  },
  {
    key: "implementation",
    label: "Implementation on Website / ERP",
    owner: "Final Boss",
    summary: "Approved curriculum is uploaded to the website and ERP.",
  },
  {
    key: "cqi",
    label: "Result Analysis & CQI",
    owner: "HOD, Teacher, Final Boss",
    summary: "Annual result analysis and improvement actions.",
  },
];

const REQUIRED_RECORD_TYPES = [
  "DCC and BoS Constitution Order",
  "Minutes of DCC Meeting",
  "BoS Meeting Notice",
  "BoS Meeting Agenda",
  "Attendance Sheet of BoS Members",
  "Minutes of BoS Meeting",
  "Geo-tagged Photograph with E-Banner",
  "Approved Curriculum / Curriculum Revision Document",
  "Academic Council Approval",
];

const ROLE_CATALOG = [
  {
    name: "HOD",
    label: "HOD (Chairperson)",
    responsibility:
      "Reviews teacher drafts, conducts DCC and BoS meetings, ensures agenda coverage.",
  },
  {
    name: "Teacher",
    label: "Teacher",
    responsibility:
      "Prepares draft curriculum, COs, CO-PO mapping, PO upload, and improvement proposals.",
  },
  {
    name: "DCC",
    label: "DCC",
    responsibility: "Approves HOD drafts.",
  },
  {
    name: "BOS",
    label: "BOS",
    responsibility: "Approves DCC drafts.",
  },
  {
    name: "Member Secretary",
    label: "Member Secretary",
    responsibility:
      "Maintains official records, circulates notices, prepares agendas.",
  },
  {
    name: "External Expert",
    label: "External Expert",
    responsibility:
      "Provides mandatory expert review and recommendations during BoS deliberations.",
  },
  {
    name: "Final Boss",
    label: "Final Boss",
    responsibility:
      "Maintains final approval records, archives originals, and controls publication.",
  },
  {
    name: "Feedback",
    label: "Feedback",
    responsibility:
      "Students, alumni, and teachers use this role to submit stakeholder feedback.",
  },
];

const COMMITTEE_STRUCTURES = {
  dcc: [
    { member: "Head of Department", role: "Chairperson" },
    {
      member: "All faculty members on seniority base covering all discipline (Max 20)",
      role: "Member",
    },
    { member: "Director CRC / CRC Representative", role: "Member" },
    { member: "Dean Research or their Nominee", role: "Member" },
    { member: "IIC Representative", role: "Member" },
    { member: "External Member (Academia)", role: "Member" },
    { member: "External Member (Industry)", role: "Member" },
    { member: "Professor / Assistant Professor", role: "Member Secretary" },
    { member: "One Student", role: "Member" },
    { member: "One Alumni", role: "Member" },
  ],
  bos: [
    { member: "Head of Department / School", role: "Chairperson" },
    { member: "All Professor of the Department / School", role: "Member" },
    {
      member: "Maximum of Two Associate Professor nominated by Vice Chancellor",
      role: "Member",
    },
    { member: "External Member (Academia)", role: "Member" },
    { member: "External Member (Industry)", role: "Member" },
    { member: "Director CRC / CRC Representative", role: "Member" },
    { member: "Dean Research or their Nominee", role: "Member" },
    { member: "IIC Representative", role: "Member" },
    { member: "Professor / Assistant Professor", role: "Member Secretary" },
    { member: "Two Students (Other than First Year for UG)", role: "Member" },
    { member: "Two Alumni", role: "Member" },
  ],
};

function createSeedWorkspace() {
  return {
    meta: {
      title: "Academic Governance Workflow",
      institution: "NEW FOLDER Demo Workspace",
      department: "Computer Science & Engineering",
      cycle: "AY 2026-27 Curriculum Revision",
      publishPolicy:
        "Curriculum can go live on the website/ERP only after Academic Council approval and only through Final Boss.",
      requiredRecords: REQUIRED_RECORD_TYPES,
      sopReference:
        "Standard Operating Procedure (SOP) Conduct of Department Curriculum Committee (DCC) and Board of Studies (BoS)",
    },
    roleTabs: ROLE_TABS,
    roles: ROLE_CATALOG,
    committees: COMMITTEE_STRUCTURES,
    workflow: {
      currentStage: "feedback",
      published: false,
      publishedAt: null,
      statusLabel: "Pending at Teacher Draft & Feedback",
      stages: WORKFLOW_STAGES.map((stage) => {
        if (stage.key === "feedback") {
          return { ...stage, status: "active" };
        }

        return { ...stage, status: "pending" };

        return { ...stage, status: "pending" };
      }),
    },
    curriculum: {
      programName: "B.Tech Computer Science and Engineering",
      regulation: "R2026",
      semesterWindow: "Semester V-VI",
      version: "v1.4",
      revisionPercentage: 42,
      revisionBand: "Moderate revision",
      updatedBy: "Teacher",
      updatedAt: "2026-04-02",
      detailedSyllabusSummary:
        "Core syllabus updated to improve industry alignment, lab balance, and outcome clarity.",
      justificationNote:
        "Revision aligns with outcome-based education expectations and recent stakeholder recommendations.",
      benchmarkSources:
        "Benchmarked against peer programs, industry expectations, and alumni observations.",
      creditDistribution: {
        foundation: 20,
        core: 70,
        elective: 16,
        projectAndInternship: 8,
      },
      courseOutcomes: [
        {
          code: "CO1",
          description: "Apply software engineering principles to design reliable computing solutions.",
          bloomsLevel: "Apply",
        },
        {
          code: "CO2",
          description: "Evaluate solution quality using testing, documentation, and review evidence.",
          bloomsLevel: "Evaluate",
        },
      ],
      coPoMapping: [
        { coCode: "CO1", po1: 3, po2: 2, po3: 3, po4: 1 },
        { coCode: "CO2", po1: 2, po2: 3, po3: 2, po4: 3 },
      ],
      courseWiseRevision: [
        {
          courseCode: "CSE501",
          courseTitle: "Software Engineering",
          revisionPercentage: 42,
        },
      ],
    },
    meetings: [
      {
        id: "seed-meet-001",
        meetingType: "BoS",
        title: "BoS Review Meeting",
        scheduledOn: "2026-04-05",
        scheduledTime: "14:30",
        mode: "Hybrid",
        noticeIssuedOn: "2026-03-27",
        noticeLeadDays: 9,
        noticeCompliant: true,
        agenda:
          "Review the DCC draft, record expert feedback, and approve the curriculum proposal.",
        supportingDocuments: [
          "draft-curriculum-v1.4.pdf",
          "co-po-matrix-v1.4.xlsx",
        ],
        status: "completed",
        totalAppointedMembers: 8,
        quorumRequired: 4,
        quorumMet: true,
        externalExpertRequired: true,
        externalExpertPresent: true,
        chairpersonSigned: true,
        memberSecretarySigned: true,
        attendance: [
          { name: "Dr. Sharma", role: "HOD", present: true },
          { name: "Dr. Verma", role: "External Expert", present: true },
          { name: "Ms. Khan", role: "Member Secretary", present: true },
          { name: "Prof. Iyer", role: "Professor", present: true },
        ],
        minutes:
          "BoS reviewed the DCC proposal and recommended the draft for Academic Council consideration.",
        decisions:
          "The draft syllabus, CO-PO matrix, and revision note were approved for Academic Council submission.",
        recommendations:
          "Maintain the meeting notice, signed minutes, and related records for audit purposes.",
        createdBy: "HOD",
      },
    ],
    feedbackEntries: [
      {
        id: "seed-fb-001",
        stakeholderType: "Industry",
        contributorName: "TechNova Labs",
        organization: "TechNova Labs",
        rating: 4,
        insight:
          "Improve practical exposure and keep curriculum outcomes aligned with current industry needs.",
        recommendation: "Increase applied lab activities in the revised syllabus.",
        submittedOn: "2026-03-14",
      },
    ],
    documents: [
      {
        id: "seed-doc-001",
        name: "DCC and BoS Constitution Order 2026",
        type: "DCC and BoS Constitution Order",
        version: "v1",
        reference: "dcc-bos-constitution-order-2026.pdf",
        geotag: "N/A",
        notes: "Signed constitution order maintained for governance records.",
        uploadedBy: "Member Secretary",
        uploadedOn: "2026-03-10",
      },
      {
        id: "seed-doc-002",
        name: "Minutes of BoS Meeting",
        type: "Minutes of BoS Meeting",
        version: "v1",
        reference: "bos-minutes-april-2026.pdf",
        geotag: "N/A",
        notes: "Signed by Chairperson and Member Secretary.",
        uploadedBy: "HOD",
        uploadedOn: "2026-04-05",
      },
    ],
    cqiEntries: [],
    timeline: [
      {
        id: "seed-tl-001",
        title: "Stakeholder feedback recorded",
        detail: "A stakeholder feedback entry was recorded for the current revision cycle.",
        date: "2026-03-14",
      },
      {
        id: "seed-tl-002",
        title: "BoS review completed",
        detail: "The BoS meeting minutes were recorded and the draft is ready for the next approval step.",
        date: "2026-04-05",
      },
    ],
  };
}

module.exports = {
  ROLE_TABS,
  ROLE_CATALOG,
  WORKFLOW_STAGES,
  REQUIRED_RECORD_TYPES,
  COMMITTEE_STRUCTURES,
  createSeedWorkspace,
};
