const mongoose = require("mongoose");

const GovernanceWorkspace = require("../models/GovernanceWorkspace");
const {
  createSeedWorkspace,
  WORKFLOW_STAGES,
  REQUIRED_RECORD_TYPES,
} = require("../data/seedData");

let memoryWorkspace = createSeedWorkspace();

const LEGACY_DEMO_IDS = {
  meetings: new Set(["meet-001", "meet-002"]),
  feedbackEntries: new Set(["fb-001", "fb-002", "fb-003"]),
  documents: new Set([
    "doc-001",
    "doc-002",
    "doc-003",
    "doc-004",
    "doc-005",
    "doc-006",
    "doc-007",
  ]),
  cqiEntries: new Set(["cqi-001"]),
  timeline: new Set(["tl-001", "tl-002", "tl-003", "tl-004"]),
};

const STAGE_INDEX = WORKFLOW_STAGES.reduce((accumulator, stage, index) => {
  accumulator[stage.key] = index;
  return accumulator;
}, {});

const STAGE_ADVANCE_RULES = {
  feedback: ["Teacher", "HOD"],
  hodReview: ["HOD"],
  dcc: ["DCC", "HOD"],
  bos: ["BOS", "HOD"],
  finalBoss: ["Final Boss"],
  implementation: ["Final Boss"],
  cqi: [],
};

const CURRICULUM_EDIT_ROLES = ["Teacher", "HOD"];
const MEETING_EDIT_ROLES = ["HOD", "Member Secretary"];
const VAULT_EDIT_ROLES = ["HOD", "Member Secretary", "Final Boss", "DCC", "BOS"];
const CQI_EDIT_ROLES = ["Teacher", "HOD", "Final Boss"];
const PUBLISH_ROLES = ["Final Boss"];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toPlainObject(workspace) {
  return typeof workspace.toObject === "function"
    ? workspace.toObject()
    : deepClone(workspace);
}

function assignField(workspace, key, value) {
  if (typeof workspace.set === "function") {
    workspace.set(key, value);
    return;
  }

  workspace[key] = value;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function requireRole(role, allowedRoles, actionLabel) {
  if (!allowedRoles.includes(role)) {
    const error = new Error(`${role} is not authorized to ${actionLabel}.`);
    error.statusCode = 403;
    throw error;
  }
}

function requireRange(value, min, max, label) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue) || numericValue < min || numericValue > max) {
    const error = new Error(`${label} must be between ${min} and ${max}.`);
    error.statusCode = 400;
    throw error;
  }

  return numericValue;
}

function normalizeDate(value, fallback = todayIso()) {
  return String(value || fallback).trim();
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function stripLegacyDemoRecords(items, legacyIds) {
  return normalizeArray(items).filter((item) => !legacyIds.has(item?.id));
}

function formatStageStatus(stageKey, published) {
  if (published) {
    return "Live on website / ERP";
  }

  const stage = WORKFLOW_STAGES.find((item) => item.key === stageKey);
  return stage ? `Pending at ${stage.label}` : "Workflow initialized";
}

function getRevisionBand(revisionPercentage) {
  if (revisionPercentage <= 20) {
    return "Minor revision";
  }

  if (revisionPercentage <= 50) {
    return "Moderate revision";
  }

  if (revisionPercentage <= 75) {
    return "Major revision";
  }

  return "Complete revision";
}

function sanitizeCourseOutcomes(courseOutcomes = []) {
  return normalizeArray(courseOutcomes)
    .map((item) => ({
      code: String(item.code || "").trim(),
      description: String(item.description || "").trim(),
      bloomsLevel: String(item.bloomsLevel || "").trim() || "Apply",
    }))
    .filter((item) => item.code && item.description);
}

function sanitizeCoPoMapping(coPoMapping = []) {
  return normalizeArray(coPoMapping)
    .map((item) => ({
      coCode: String(item.coCode || "").trim(),
      po1: requireRange(item.po1 ?? 0, 0, 3, "PO1 weight"),
      po2: requireRange(item.po2 ?? 0, 0, 3, "PO2 weight"),
      po3: requireRange(item.po3 ?? 0, 0, 3, "PO3 weight"),
      po4: requireRange(item.po4 ?? 0, 0, 3, "PO4 weight"),
    }))
    .filter((item) => item.coCode);
}

function sanitizeCourseWiseRevision(entries = []) {
  return normalizeArray(entries)
    .map((entry) => ({
      courseCode: String(entry.courseCode || "").trim(),
      courseTitle: String(entry.courseTitle || "").trim(),
      revisionPercentage: requireRange(
        entry.revisionPercentage ?? 0,
        0,
        100,
        "Course-wise revision percentage"
      ),
    }))
    .filter((entry) => entry.courseCode && entry.courseTitle);
}

function parseAttendanceMembers(presentMembers = [], absentMembers = []) {
  const present = normalizeArray(presentMembers)
    .map((member) => String(member || "").trim())
    .filter(Boolean)
    .map((member) => ({ name: member, role: "Member", present: true }));

  const absent = normalizeArray(absentMembers)
    .map((member) => String(member || "").trim())
    .filter(Boolean)
    .map((member) => ({ name: member, role: "Member", present: false }));

  return [...present, ...absent];
}

function parseSupportingDocuments(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseUploadedAssets(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return [];
}

function calculateNoticeLeadDays(scheduledOn, noticeIssuedOn) {
  const meetingDate = new Date(scheduledOn);
  const noticeDate = new Date(noticeIssuedOn);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((meetingDate - noticeDate) / millisecondsPerDay);
}

function createMinutesTemplate(payload, quorumMet) {
  const decisions = String(payload.decisions || "").trim();
  const recommendations = String(payload.recommendations || "").trim();
  const agenda = String(payload.agenda || "").trim();
  const mode = String(payload.mode || "").trim() || "Offline";
  const scheduledTime = String(payload.scheduledTime || "").trim() || "TBD";

  return `${payload.meetingType} meeting held on ${payload.scheduledOn} at ${scheduledTime} (${mode}) reviewed ${agenda}. Quorum status: ${quorumMet ? "met" : "not met"
    }. Decisions: ${decisions || "To be recorded after the session."} Recommendations: ${recommendations || "No recommendations recorded yet."
    }`;
}

function getFeedbackAverage(feedbackEntries) {
  if (!feedbackEntries.length) {
    return 0;
  }

  const total = feedbackEntries.reduce(
    (sum, entry) => sum + Number(entry.rating || 0),
    0
  );
  return Number((total / feedbackEntries.length).toFixed(1));
}

function getNoticeComplianceRate(meetings) {
  if (!meetings.length) {
    return 0;
  }

  const compliant = meetings.filter((meeting) => meeting.noticeCompliant).length;
  return Math.round((compliant / meetings.length) * 100);
}

function getNextMeeting(meetings) {
  const upcoming = meetings
    .filter((meeting) => new Date(meeting.scheduledOn) >= new Date(todayIso()))
    .sort((left, right) => new Date(left.scheduledOn) - new Date(right.scheduledOn));

  return upcoming[0] || null;
}

function getLatestBosMeeting(meetings, options = {}) {
  const { completedOnly = false } = options;

  return meetings
    .filter((meeting) => meeting.meetingType === "BoS")
    .filter((meeting) => (completedOnly ? meeting.status === "completed" : true))
    .sort((left, right) => new Date(right.scheduledOn) - new Date(left.scheduledOn))[0];
}

function getRequiredRecordCoverage(documents) {
  const storedTypes = new Set(documents.map((document) => document.type));
  const covered = REQUIRED_RECORD_TYPES.filter((type) => storedTypes.has(type)).length;

  return {
    covered,
    total: REQUIRED_RECORD_TYPES.length,
    missing: REQUIRED_RECORD_TYPES.filter((type) => !storedTypes.has(type)),
  };
}

function getBosCompliance(meeting) {
  if (!meeting) {
    return {
      quorumMet: false,
      externalExpertPresent: false,
      signaturesReady: false,
    };
  }

  return {
    quorumMet: Boolean(meeting.quorumMet),
    externalExpertPresent: Boolean(meeting.externalExpertPresent),
    signaturesReady: Boolean(
      meeting.chairpersonSigned && meeting.memberSecretarySigned
    ),
  };
}

function updateWorkflowStageStatuses(workspace, currentStageKey) {
  workspace.workflow.stages = workspace.workflow.stages.map((stage) => {
    const stagePosition = STAGE_INDEX[stage.key];
    const currentPosition = STAGE_INDEX[currentStageKey];

    if (workspace.workflow.published && stage.key === "implementation") {
      return { ...stage, status: currentStageKey === "implementation" ? "published" : "completed" };
    }

    if (stagePosition < currentPosition) {
      return { ...stage, status: "completed" };
    }

    if (stage.key === currentStageKey) {
      return { ...stage, status: "active" };
    }

    return { ...stage, status: "pending" };
  });
}

function normalizeMeeting(meeting, defaults = {}) {
  const attendance = normalizeArray(meeting.attendance);
  const presentCount = attendance.filter((member) => member.present).length;
  const totalAppointedMembers = Number(
    meeting.totalAppointedMembers ?? defaults.totalAppointedMembers ?? attendance.length
  ) || attendance.length;
  const quorumRequired =
    Number(meeting.quorumRequired ?? defaults.quorumRequired) ||
    Math.ceil(totalAppointedMembers / 2);

  return {
    ...defaults,
    ...meeting,
    scheduledOn: normalizeDate(meeting.scheduledOn, defaults.scheduledOn || todayIso()),
    scheduledTime: String(meeting.scheduledTime || defaults.scheduledTime || "11:00").trim(),
    mode: String(meeting.mode || defaults.mode || "Offline").trim(),
    supportingDocuments: parseSupportingDocuments(
      meeting.supportingDocuments || defaults.supportingDocuments
    ),
    evidenceImages: parseUploadedAssets(
      meeting.evidenceImages || defaults.evidenceImages
    ),
    noticeSentBy: String(
      meeting.noticeSentBy || defaults.noticeSentBy || "Member Secretary"
    ).trim(),
    attendance,
    totalAppointedMembers,
    quorumRequired,
    quorumMet:
      typeof meeting.quorumMet === "boolean"
        ? meeting.quorumMet
        : presentCount >= quorumRequired,
    externalExpertRequired:
      typeof meeting.externalExpertRequired === "boolean"
        ? meeting.externalExpertRequired
        : defaults.externalExpertRequired || false,
    externalExpertPresent:
      typeof meeting.externalExpertPresent === "boolean"
        ? meeting.externalExpertPresent
        : defaults.externalExpertPresent || false,
    chairpersonSigned: Boolean(
      meeting.chairpersonSigned ?? defaults.chairpersonSigned ?? false
    ),
    memberSecretarySigned: Boolean(
      meeting.memberSecretarySigned ?? defaults.memberSecretarySigned ?? false
    ),
  };
}

function normalizeWorkspace(workspaceInput) {
  const seed = createSeedWorkspace();
  const workspace = workspaceInput;

  const roleTabs = Object.fromEntries(
    Object.keys(seed.roleTabs).map((role) => [
      role,
      (() => {
        const allowedTabs = new Set(seed.roleTabs[role]);
        const existingTabs = normalizeArray(workspace.roleTabs?.[role]).filter((tab) =>
          allowedTabs.has(tab)
        );

        return existingTabs.length ? existingTabs : seed.roleTabs[role];
      })(),
    ])
  );

  assignField(workspace, "meta", {
    ...seed.meta,
    ...(workspace.meta || {}),
    requiredRecords:
      normalizeArray(workspace.meta?.requiredRecords).length > 0
        ? workspace.meta.requiredRecords
        : seed.meta.requiredRecords,
  });

  assignField(workspace, "roleTabs", roleTabs);

  assignField(
    workspace,
    "roles",
    seed.roles
  );

  assignField(workspace, "committees", {
    dcc:
      normalizeArray(workspace.committees?.dcc).length > 0
        ? workspace.committees.dcc
        : seed.committees.dcc,
    bos:
      normalizeArray(workspace.committees?.bos).length > 0
        ? workspace.committees.bos
        : seed.committees.bos,
  });

  const stageMap = new Map(
    normalizeArray(workspace.workflow?.stages).map((stage) => [stage.key, stage])
  );
  assignField(workspace, "workflow", {
    ...seed.workflow,
    ...(workspace.workflow || {}),
    stages: seed.workflow.stages.map((stage) => ({
      ...stage,
      ...(stageMap.get(stage.key) || {}),
    })),
  });

  assignField(workspace, "curriculum", {
    ...seed.curriculum,
    ...(workspace.curriculum || {}),
    creditDistribution: {
      ...seed.curriculum.creditDistribution,
      ...(workspace.curriculum?.creditDistribution || {}),
    },
    courseOutcomes:
      normalizeArray(workspace.curriculum?.courseOutcomes).length > 0
        ? workspace.curriculum.courseOutcomes
        : seed.curriculum.courseOutcomes,
    coPoMapping:
      normalizeArray(workspace.curriculum?.coPoMapping).length > 0
        ? workspace.curriculum.coPoMapping
        : seed.curriculum.coPoMapping,
    courseWiseRevision:
      normalizeArray(workspace.curriculum?.courseWiseRevision).length > 0
        ? workspace.curriculum.courseWiseRevision
        : seed.curriculum.courseWiseRevision,
  });

  const seedMeetingMap = new Map(seed.meetings.map((meeting) => [meeting.id, meeting]));
  const filteredMeetings = stripLegacyDemoRecords(
    workspace.meetings,
    LEGACY_DEMO_IDS.meetings
  );
  assignField(
    workspace,
    "meetings",
    filteredMeetings.length
      ? filteredMeetings.map((meeting) =>
        normalizeMeeting(meeting, seedMeetingMap.get(meeting.id) || {})
      )
      : seed.meetings.map((meeting) => normalizeMeeting(meeting, meeting))
  );

  const filteredFeedbackEntries = stripLegacyDemoRecords(
    workspace.feedbackEntries,
    LEGACY_DEMO_IDS.feedbackEntries
  );
  assignField(
    workspace,
    "feedbackEntries",
    filteredFeedbackEntries.length
      ? filteredFeedbackEntries
      : seed.feedbackEntries
  );

  const filteredDocuments = stripLegacyDemoRecords(
    workspace.documents,
    LEGACY_DEMO_IDS.documents
  );
  assignField(
    workspace,
    "documents",
    filteredDocuments.length
      ? filteredDocuments
      : seed.documents
  );

  const filteredCqiEntries = stripLegacyDemoRecords(
    workspace.cqiEntries,
    LEGACY_DEMO_IDS.cqiEntries
  );
  assignField(
    workspace,
    "cqiEntries",
    filteredCqiEntries.length ? filteredCqiEntries : seed.cqiEntries
  );

  const filteredTimeline = stripLegacyDemoRecords(
    workspace.timeline,
    LEGACY_DEMO_IDS.timeline
  );
  assignField(
    workspace,
    "timeline",
    filteredTimeline.length ? filteredTimeline : seed.timeline
  );

  if (!workspace.workflow.currentStage || !STAGE_INDEX[workspace.workflow.currentStage] && workspace.workflow.currentStage !== "feedback") {
    workspace.workflow.currentStage = seed.workflow.currentStage;
  }

  workspace.workflow.statusLabel = formatStageStatus(
    workspace.workflow.currentStage,
    workspace.workflow.published
  );

  updateWorkflowStageStatuses(workspace, workspace.workflow.currentStage);
  return workspace;
}

async function ensureWorkspace() {
  if (isDatabaseConnected()) {
    let workspace = await GovernanceWorkspace.findOne();

    if (!workspace) {
      workspace = await GovernanceWorkspace.create(createSeedWorkspace());
    }

    normalizeWorkspace(workspace);
    return workspace;
  }

  memoryWorkspace = normalizeWorkspace(memoryWorkspace);
  return memoryWorkspace;
}

async function persistWorkspace(workspace) {
  if (isDatabaseConnected()) {
    await workspace.save();
    return workspace;
  }

  memoryWorkspace = workspace;
  return memoryWorkspace;
}

function getAllowedActions(workspace, role) {
  return {
    canEditCurriculum: CURRICULUM_EDIT_ROLES.includes(role),
    canCreateMeeting: MEETING_EDIT_ROLES.includes(role),
    canManageDocuments: VAULT_EDIT_ROLES.includes(role),
    canCreateCqi: CQI_EDIT_ROLES.includes(role),
    canAdvanceWorkflow:
      STAGE_ADVANCE_RULES[workspace.workflow.currentStage]?.includes(role) || false,
    canRejectWorkflow:
      (STAGE_ADVANCE_RULES[workspace.workflow.currentStage]?.includes(role) || false) &&
      !["feedback", "implementation", "cqi"].includes(workspace.workflow.currentStage),
    canPublish:
      PUBLISH_ROLES.includes(role) &&
      workspace.workflow.currentStage === "implementation" &&
      !workspace.workflow.published,
  };
}

function getVisibleTabsForRole(workspace, role) {
  if (role === "Feedback") {
    return ["feedback"];
  }

  return workspace.roleTabs[role] || workspace.roleTabs.Teacher || [];
}

function buildInsights(workspace) {
  const latestBosMeeting = getLatestBosMeeting(workspace.meetings, {
    completedOnly: true,
  });
  return {
    feedbackCount: workspace.feedbackEntries.length,
    feedbackAverage: getFeedbackAverage(workspace.feedbackEntries),
    noticeComplianceRate: getNoticeComplianceRate(workspace.meetings),
    documentCount: workspace.documents.length,
    requiredRecordCoverage: getRequiredRecordCoverage(workspace.documents),
    nextMeeting: getNextMeeting(workspace.meetings),
    latestTimelineEntry: workspace.timeline[0] || null,
    latestBosMeeting,
    bosCompliance: getBosCompliance(latestBosMeeting),
    cqiCount: workspace.cqiEntries.length,
  };
}

function buildDashboardPayload(workspace, role) {
  const plainWorkspace = toPlainObject(workspace);

  return {
    ...plainWorkspace,
    visibleTabs: getVisibleTabsForRole(plainWorkspace, role),
    selectedRole: role,
    allowedActions: getAllowedActions(plainWorkspace, role),
    insights: buildInsights(plainWorkspace),
    databaseMode: isDatabaseConnected() ? "mongodb" : "memory-fallback",
  };
}

async function getDashboard(role = "HOD") {
  const workspace = await ensureWorkspace();
  return buildDashboardPayload(workspace, role);
}

async function submitFeedback(payload) {
  const workspace = await ensureWorkspace();
  const rating = requireRange(payload.rating, 1, 5, "Rating");

  const entry = {
    id: createId("fb"),
    stakeholderType: String(payload.stakeholderType || "").trim() || "Student",
    contributorName: String(payload.contributorName || "").trim() || "Anonymous",
    organization: String(payload.organization || "").trim() || "Independent",
    rating,
    insight: String(payload.insight || "").trim(),
    recommendation: String(payload.recommendation || "").trim(),
    submittedOn: todayIso(),
  };

  if (!entry.insight) {
    const error = new Error("Feedback insight is required.");
    error.statusCode = 400;
    throw error;
  }

  workspace.feedbackEntries.unshift(entry);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: `${entry.stakeholderType} feedback submitted`,
    detail: `${entry.contributorName} added a new recommendation for curriculum revision.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole || "Teacher");
}

async function updateCurriculum(payload) {
  requireRole(payload.actorRole, CURRICULUM_EDIT_ROLES, "update curriculum");

  const workspace = await ensureWorkspace();
  const revisionPercentage = requireRange(
    payload.revisionPercentage,
    0,
    100,
    "Revision percentage"
  );

  workspace.curriculum = {
    ...workspace.curriculum,
    programName: String(payload.programName || workspace.curriculum.programName).trim(),
    regulation: String(payload.regulation || workspace.curriculum.regulation).trim(),
    semesterWindow: String(
      payload.semesterWindow || workspace.curriculum.semesterWindow
    ).trim(),
    version: String(payload.version || workspace.curriculum.version).trim(),
    revisionPercentage,
    revisionBand: getRevisionBand(revisionPercentage),
    updatedBy: payload.actorRole,
    updatedAt: todayIso(),
    detailedSyllabusSummary: String(
      payload.detailedSyllabusSummary || workspace.curriculum.detailedSyllabusSummary
    ).trim(),
    justificationNote: String(
      payload.justificationNote || workspace.curriculum.justificationNote
    ).trim(),
    benchmarkSources: String(
      payload.benchmarkSources || workspace.curriculum.benchmarkSources
    ).trim(),
    creditDistribution: {
      foundation: requireRange(
        payload.creditDistribution?.foundation ?? 0,
        0,
        200,
        "Foundation credits"
      ),
      core: requireRange(payload.creditDistribution?.core ?? 0, 0, 200, "Core credits"),
      elective: requireRange(
        payload.creditDistribution?.elective ?? 0,
        0,
        200,
        "Elective credits"
      ),
      projectAndInternship: requireRange(
        payload.creditDistribution?.projectAndInternship ?? 0,
        0,
        200,
        "Project and internship credits"
      ),
    },
    courseOutcomes: sanitizeCourseOutcomes(payload.courseOutcomes),
    coPoMapping: sanitizeCoPoMapping(payload.coPoMapping),
    courseWiseRevision: sanitizeCourseWiseRevision(payload.courseWiseRevision),
    uploadedPOs: Array.isArray(payload.uploadedPOs) ? payload.uploadedPOs.map(String) : [],
  };

  workspace.timeline.unshift({
    id: createId("tl"),
    title: "Curriculum draft updated",
    detail: `${payload.actorRole} refreshed COs, CO-PO mappings, revision summary, and justification note.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

async function createMeeting(payload) {
  requireRole(payload.actorRole, MEETING_EDIT_ROLES, "schedule meetings");

  const workspace = await ensureWorkspace();
  const meetingType = String(payload.meetingType || "").trim();
  const scheduledOn = String(payload.scheduledOn || "").trim();
  const scheduledTime = String(payload.scheduledTime || "").trim();
  const noticeIssuedOn = String(payload.noticeIssuedOn || "").trim();
  const mode = String(payload.mode || "").trim();
  const supportingDocuments = parseSupportingDocuments(payload.supportingDocuments);
  const noticeSentBy =
    String(payload.noticeSentBy || "Member Secretary").trim() || "Member Secretary";

  if (!meetingType || !scheduledOn || !scheduledTime || !noticeIssuedOn || !mode) {
    const error = new Error(
      "Meeting type, date, time, mode, and notice date are required."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!String(payload.agenda || "").trim()) {
    const error = new Error("Meeting agenda is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!supportingDocuments.length) {
    const error = new Error(
      "Draft curriculum documents or supporting materials must be listed."
    );
    error.statusCode = 400;
    throw error;
  }

  const noticeLeadDays = calculateNoticeLeadDays(scheduledOn, noticeIssuedOn);
  if (noticeLeadDays < 7 || noticeLeadDays > 10) {
    const error = new Error(
      "Meeting notice must be circulated 7 to 10 days before the meeting date."
    );
    error.statusCode = 400;
    throw error;
  }

  const attendance = parseAttendanceMembers(
    payload.presentMembers || [],
    payload.absentMembers || []
  );
  const totalAppointedMembers = requireRange(
    payload.totalAppointedMembers || attendance.length || 1,
    1,
    500,
    "Total appointed members"
  );
  const presentCount = attendance.filter((member) => member.present).length;
  const quorumRequired = Math.ceil(totalAppointedMembers / 2);
  const externalExpertPresent = Boolean(payload.externalExpertPresent);
  const chairpersonSigned = Boolean(payload.chairpersonSigned);
  const memberSecretarySigned = Boolean(payload.memberSecretarySigned);
  const isUpcoming = new Date(scheduledOn) > new Date(todayIso());
  let quorumMet = presentCount >= quorumRequired;

  if (meetingType === "BoS" && !isUpcoming) {
    if (!externalExpertPresent) {
      const error = new Error(
        "At least one external expert member is mandatory for the BoS meeting."
      );
      error.statusCode = 400;
      throw error;
    }

    if (!quorumMet) {
      const error = new Error(
        `BoS quorum not met. Minimum ${quorumRequired} present members are required.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const meeting = normalizeMeeting(
    {
      id: createId("meet"),
      meetingType,
      title:
        String(payload.title || "").trim() || `${meetingType} Governance Meeting`,
      scheduledOn,
      scheduledTime,
      mode,
      noticeIssuedOn,
      noticeLeadDays,
      noticeCompliant: true,
      agenda: String(payload.agenda || "").trim(),
      supportingDocuments,
      evidenceImages: parseUploadedAssets(payload.evidenceImages),
      noticeSentBy,
      status: isUpcoming ? "scheduled" : "completed",
      attendance,
      totalAppointedMembers,
      quorumRequired,
      quorumMet,
      externalExpertRequired: meetingType === "BoS",
      externalExpertPresent,
      chairpersonSigned,
      memberSecretarySigned,
      minutes: createMinutesTemplate(
        {
          ...payload,
          meetingType,
          scheduledOn,
          scheduledTime,
          mode,
        },
        quorumMet
      ),
      decisions: String(payload.decisions || "").trim(),
      recommendations: String(payload.recommendations || "").trim(),
      createdBy: payload.actorRole,
    },
    {}
  );

  workspace.meetings.unshift(meeting);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: `${meetingType} meeting scheduled`,
    detail: `${payload.actorRole} recorded the meeting. Notice is marked as sent by ${noticeSentBy} ${noticeLeadDays} days in advance with agenda and supporting documents.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

function getNextVersion(documents, type) {
  const existingVersions = documents
    .filter((document) => document.type === type)
    .map((document) => Number(String(document.version || "").replace(/[^\d]/g, "")) || 0);

  const nextVersion = Math.max(0, ...existingVersions) + 1;
  return `v${nextVersion}`;
}

async function addDocument(payload) {
  requireRole(payload.actorRole, VAULT_EDIT_ROLES, "add documents to the vault");

  const workspace = await ensureWorkspace();
  const type = String(payload.type || "").trim();
  const name = String(payload.name || "").trim();

  if (!type || !name) {
    const error = new Error("Document type and name are required.");
    error.statusCode = 400;
    throw error;
  }

  if (
    type === "Geo-tagged Photograph with E-Banner" &&
    !String(payload.geotag || "").trim()
  ) {
    const error = new Error("Geo-tag is required for geo-tagged photograph records.");
    error.statusCode = 400;
    throw error;
  }

  const document = {
    id: createId("doc"),
    name,
    type,
    version: String(payload.version || "").trim() || getNextVersion(workspace.documents, type),
    reference: String(payload.reference || "").trim() || "pending-upload-reference",
    geotag: String(payload.geotag || "").trim() || "N/A",
    notes: String(payload.notes || "").trim(),
    uploadedBy: payload.actorRole,
    uploadedOn: todayIso(),
  };

  workspace.documents.unshift(document);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: "Document archived",
    detail: `${document.name} stored in the vault with version ${document.version}.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

async function submitCqiEntry(payload) {
  requireRole(payload.actorRole, CQI_EDIT_ROLES, "record CQI actions");

  const workspace = await ensureWorkspace();
  const entry = {
    id: createId("cqi"),
    session: String(payload.session || "").trim(),
    source: String(payload.source || "").trim(),
    analysis: String(payload.analysis || "").trim(),
    recommendation: String(payload.recommendation || "").trim(),
    forwardedToDcc: Boolean(payload.forwardedToDcc),
    createdBy: payload.actorRole,
    createdOn: todayIso(),
  };

  if (!entry.session || !entry.source || !entry.analysis || !entry.recommendation) {
    const error = new Error(
      "Session, source, analysis, and recommendation are required for CQI."
    );
    error.statusCode = 400;
    throw error;
  }

  workspace.cqiEntries.unshift(entry);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: "CQI action recorded",
    detail: `${payload.actorRole} logged a continuous quality improvement action for ${entry.session}.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

function assertBosReady(workspace) {
  const latestBosMeeting = getLatestBosMeeting(workspace.meetings, {
    completedOnly: true,
  });

  if (!latestBosMeeting) {
    const error = new Error("BoS approval cannot advance without a recorded BoS meeting.");
    error.statusCode = 400;
    throw error;
  }

  if (!latestBosMeeting.noticeCompliant) {
    const error = new Error("BoS notice window is not compliant with the SOP.");
    error.statusCode = 400;
    throw error;
  }

  if (!latestBosMeeting.externalExpertPresent) {
    const error = new Error("BoS workflow requires at least one external expert.");
    error.statusCode = 400;
    throw error;
  }

  if (!latestBosMeeting.quorumMet) {
    const error = new Error("BoS quorum is not met.");
    error.statusCode = 400;
    throw error;
  }

  if (
    !latestBosMeeting.chairpersonSigned ||
    !latestBosMeeting.memberSecretarySigned
  ) {
    const error = new Error(
      "BoS minutes must be signed by the Chairperson and Member Secretary."
    );
    error.statusCode = 400;
    throw error;
  }
}

async function advanceWorkflow(payload) {
  const workspace = await ensureWorkspace();
  const currentStageKey = workspace.workflow.currentStage;
  const allowedRoles = STAGE_ADVANCE_RULES[currentStageKey] || [];

  requireRole(payload.actorRole, allowedRoles, "advance the workflow");

  if (currentStageKey === "bos") {
    assertBosReady(workspace);
  }

  if (currentStageKey === "implementation" && !workspace.workflow.published) {
    const error = new Error(
      "Publish the approved curriculum to website / ERP before moving to CQI."
    );
    error.statusCode = 400;
    throw error;
  }

  const currentIndex = STAGE_INDEX[currentStageKey];
  const nextStage = WORKFLOW_STAGES[currentIndex + 1];

  if (!nextStage) {
    const error = new Error("Workflow is already at the final stage.");
    error.statusCode = 400;
    throw error;
  }

  workspace.workflow.currentStage = nextStage.key;
  workspace.workflow.statusLabel = formatStageStatus(nextStage.key, false);
  updateWorkflowStageStatuses(workspace, nextStage.key);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: `${currentStageKey} stage approved`,
    detail:
      String(payload.note || "").trim() ||
      `${payload.actorRole} moved the workflow to ${nextStage.label}.`,
    date: todayIso(),
  });

  const generateMOMContent = (stageName) => `MINUTES OF THE MEETING OF ${stageName.toUpperCase()} 
OF DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING UNDER THE SCHOOL 
OF COMPUTER SCIENCE AND ENGINEERING HELD ON ${todayIso()} AT CONFERENCE ROOM, MAIN BUILDING, DEV BHOOMI 
UTTARAKHAND UNIVERSITY, DEHRADUN 
The following were present: 
1. Chairperson 
2. Member Secretary 
3. Members and Experts

Agenda Point 1: To consider and approve the detailed deliberation on the drafts for finalization of PO, PSO for B.Tech (CSE)...
Resolution: The ${stageName} consider the feedback of all the members... After detailed discussion and deliberations, the ${stageName} has approved the same and noted changes.`;

  if (["hodReview", "dcc", "bos", "finalBoss"].includes(currentStageKey) || ["dcc", "bos", "finalBoss"].includes(nextStage.key)) {
    workspace.documents.unshift({
      id: createId("doc"),
      name: `MOM for ${nextStage.label}`,
      type: "Minutes of Meeting",
      version: workspace.curriculum.version,
      reference: `mom-${nextStage.key}-${Date.now()}.pdf`,
      geotag: "N/A",
      notes: generateMOMContent(nextStage.label),
      uploadedBy: payload.actorRole,
      uploadedOn: todayIso(),
    });
  }

  if (currentStageKey === "finalBoss") {
    workspace.documents.unshift(
      {
        id: createId("doc"),
        name: `${workspace.curriculum.programName} Final Approval`,
        type: "Academic Council Approval",
        version: workspace.curriculum.version,
        reference: "final-approval.pdf",
        geotag: "N/A",
        notes: "Final approval received.",
        uploadedBy: payload.actorRole,
        uploadedOn: todayIso(),
      },
      {
        id: createId("doc"),
        name: `${workspace.curriculum.programName} Curriculum Revision Document`,
        type: "Approved Curriculum / Curriculum Revision Document",
        version: workspace.curriculum.version,
        reference: `${workspace.curriculum.programName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-approved-${workspace.curriculum.version}.pdf`,
        geotag: "N/A",
        notes: "Approved curriculum ready for website and ERP implementation.",
        uploadedBy: payload.actorRole,
        uploadedOn: todayIso(),
      }
    );
  }

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

async function rejectWorkflow(payload) {
  const workspace = await ensureWorkspace();
  const currentStageKey = workspace.workflow.currentStage;
  const allowedRoles = STAGE_ADVANCE_RULES[currentStageKey] || [];

  requireRole(payload.actorRole, allowedRoles, "reject the workflow");

  if (currentStageKey === "feedback" || currentStageKey === "implementation" || currentStageKey === "cqi") {
    const error = new Error("Workflow cannot be rejected at this stage.");
    error.statusCode = 400;
    throw error;
  }

  const prevStage = WORKFLOW_STAGES.find(s => s.key === "feedback");
  workspace.workflow.currentStage = prevStage.key;
  workspace.workflow.statusLabel = "Workflow Rejected Back to Feedback";
  updateWorkflowStageStatuses(workspace, prevStage.key);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: `${currentStageKey} stage rejected`,
    detail: String(payload.note || "").trim() || `${payload.actorRole} rejected the workflow back to ${prevStage.label}.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

async function publishCurriculum(payload) {
  const workspace = await ensureWorkspace();
  requireRole(payload.actorRole, PUBLISH_ROLES, "publish the curriculum");

  if (workspace.workflow.currentStage !== "implementation") {
    const error = new Error(
      "Publish is locked until Academic Council approval moves the workflow to implementation."
    );
    error.statusCode = 400;
    throw error;
  }

  if (workspace.workflow.published) {
    const error = new Error("Curriculum is already published.");
    error.statusCode = 400;
    throw error;
  }

  workspace.workflow.published = true;
  workspace.workflow.publishedAt = todayIso();
  workspace.workflow.statusLabel = formatStageStatus(
    workspace.workflow.currentStage,
    true
  );
  updateWorkflowStageStatuses(workspace, workspace.workflow.currentStage);
  workspace.timeline.unshift({
    id: createId("tl"),
    title: "Curriculum published",
    detail: `${payload.actorRole} pushed the approved version live on the website/ERP for next academic session.`,
    date: todayIso(),
  });

  await persistWorkspace(workspace);
  return buildDashboardPayload(workspace, payload.actorRole);
}

module.exports = {
  getDashboard,
  submitFeedback,
  updateCurriculum,
  createMeeting,
  addDocument,
  submitCqiEntry,
  advanceWorkflow,
  rejectWorkflow,
  publishCurriculum,
};
