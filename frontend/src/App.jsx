import { startTransition, useEffect, useEffectEvent, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  API_BASE,
  decodeRole,
  encodeRole,
  moduleMeta,
  roleOptions,
} from "./config/appData";
import FeedbackTab from "./components/FeedbackTab";
import CurriculumTab from "./components/CurriculumTab";
import MeetingsTab from "./components/MeetingsTab";
import VaultTab from "./components/VaultTab";
import ApprovalTab from "./components/ApprovalTab";
import CQITab from "./components/CQITab";
import { shellClass } from "./ui";
import LoginPage from "./pages/LoginPage";
import ModulePage from "./pages/ModulePage";
import RoleHomePage from "./pages/RoleHomePage";

function GovernanceFlow() {
  const navigate = useNavigate();
  const params = useParams();
  const routeRole = params.role ? decodeRole(params.role) : "";
  const currentModule = params.module || null;

  const [selectedRole, setSelectedRole] = useState(routeRole || "HOD");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (routeRole && routeRole !== selectedRole) {
      setSelectedRole(routeRole);
    }
  }, [routeRole, selectedRole]);

  function syncDashboard(data) {
    startTransition(() => {
      setDashboard(data);
    });
  }

  const loadDashboard = useEffectEvent(async (role) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/dashboard?role=${encodeURIComponent(role)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load dashboard.");
      }

      syncDashboard(data);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadDashboard(routeRole || selectedRole);
  }, [routeRole, selectedRole]);

  async function submitAction(endpoint, body, successText) {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      syncDashboard(data);
      setMessage({ type: "success", text: successText });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectRole(role) {
    setSelectedRole(role);
    if (role === "Feedback") {
      navigate(`/role/${encodeRole(role)}/feedback`);
      return;
    }

    navigate(`/role/${encodeRole(role)}`);
  }

  function handleOpenModule(module) {
    navigate(`/role/${encodeRole(selectedRole)}/${module}`);
  }

  function handleBackHome() {
    navigate("/");
  }

  function handleBackRole() {
    navigate(`/role/${encodeRole(selectedRole)}`);
  }

  if (routeRole && !roleOptions.includes(routeRole)) {
    return <Navigate to="/" replace />;
  }

  if (loading && !dashboard) {
    return (
      <main className={`${shellClass} flex min-h-screen items-center justify-center`}>
        <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-8 text-sm text-slate-600 shadow-card backdrop-blur-sm">
          Loading workspace...
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className={`${shellClass} flex min-h-screen items-center justify-center`}>
        <div className="rounded-[28px] border border-rose-200 bg-white/80 px-6 py-8 text-sm text-rose-600 shadow-card backdrop-blur-sm">
          Unable to load dashboard data.
        </div>
      </main>
    );
  }

  const visibleModules = dashboard.visibleTabs || [];

  if (routeRole === "Feedback" && !currentModule) {
    return <Navigate to={`/role/${encodeRole(routeRole)}/feedback`} replace />;
  }

  if (currentModule && !visibleModules.includes(currentModule)) {
    return <Navigate to={`/role/${encodeRole(selectedRole)}`} replace />;
  }

  const sharedProps = {
    dashboard,
    selectedRole,
    submitAction,
    submitting,
  };

  const modulePages = {
    feedback: <FeedbackTab {...sharedProps} />,
    curriculum: (
      <CurriculumTab
        key={`curriculum-${selectedRole}-${dashboard.curriculum.updatedAt}-${dashboard.curriculum.version}`}
        {...sharedProps}
      />
    ),
    meetings: <MeetingsTab {...sharedProps} />,
    mom: <VaultTab {...sharedProps} />,
    approval: <ApprovalTab {...sharedProps} />,
    cqi: <CQITab {...sharedProps} />,
  };

  const isHome = !routeRole;
  const isModulePage = Boolean(routeRole && currentModule);

  let pageContent = (
    <LoginPage
      roles={dashboard.roles}
      selectedRole={selectedRole || "HOD"}
      cycle={dashboard.meta.cycle}
      workflowStatus={dashboard.workflow.statusLabel}
      onSelectRole={handleSelectRole}
    />
  );

  if (!isHome && !isModulePage) {
    pageContent = (
      <RoleHomePage
        dashboard={dashboard}
        selectedRole={selectedRole}
        onBackHome={handleBackHome}
        onOpenModule={handleOpenModule}
      />
    );
  }

  if (isModulePage) {
    pageContent = (
      <ModulePage
        dashboard={dashboard}
        selectedRole={selectedRole}
        moduleTitle={moduleMeta[currentModule]?.title || currentModule}
        moduleDescription={moduleMeta[currentModule]?.description || "Continue working on this page."}
        onBackHome={handleBackHome}
        onBackRole={handleBackRole}
      >
        {modulePages[currentModule]}
      </ModulePage>
    );
  }

  return (
    <main className={shellClass}>
      {message ? (
        <div
          className={`mb-5 rounded-[24px] border px-5 py-4 text-sm font-medium shadow-card ${message.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-sky/60 bg-white/80 text-ink"
            }`}
        >
          {message.text}
        </div>
      ) : null}
      {pageContent}
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<GovernanceFlow />} />
      <Route path="/role/:role" element={<GovernanceFlow />} />
      <Route path="/role/:role/:module" element={<GovernanceFlow />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
