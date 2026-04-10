const mongoose = require("mongoose");

const governanceWorkspaceSchema = new mongoose.Schema(
  {
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    roleTabs: { type: mongoose.Schema.Types.Mixed, default: {} },
    roles: { type: [mongoose.Schema.Types.Mixed], default: [] },
    committees: { type: mongoose.Schema.Types.Mixed, default: {} },
    workflow: { type: mongoose.Schema.Types.Mixed, default: {} },
    curriculum: { type: mongoose.Schema.Types.Mixed, default: {} },
    meetings: { type: [mongoose.Schema.Types.Mixed], default: [] },
    feedbackEntries: { type: [mongoose.Schema.Types.Mixed], default: [] },
    documents: { type: [mongoose.Schema.Types.Mixed], default: [] },
    cqiEntries: { type: [mongoose.Schema.Types.Mixed], default: [] },
    timeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.GovernanceWorkspace ||
  mongoose.model("GovernanceWorkspace", governanceWorkspaceSchema);
