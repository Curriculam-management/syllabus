import { moduleMeta } from "../config/appData";
import { formatDate } from "../utils/formatters";
import {
  cardClass,
  ghostButtonClass,
  primaryButtonClass,
  StatusBadge,
} from "../ui";

function RoleHomePage({ dashboard, selectedRole, onBackHome, onOpenModule }) {
  const currentRole = dashboard.roles.find((role) => role.name === selectedRole);
  const nextMeeting = dashboard.insights?.nextMeeting;
  const latestUpdate = dashboard.timeline[0];
  const visibleModules = dashboard.visibleTabs || [];

  return (
    <section className="grid gap-6 py-4">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(189,166,206,0.66),rgba(242,234,224,0.95),rgba(180,211,217,0.72))] p-6 shadow-card sm:p-8">
          <button className={ghostButtonClass} type="button" onClick={onBackHome}>
            Change role
          </button>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-violet">
            Workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">{currentRole?.label}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            {currentRole?.responsibility}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge tone={dashboard.workflow.published ? "published" : "active"}>
              {dashboard.workflow.published ? "Published" : "In progress"}
            </StatusBadge>
            <span className="text-sm text-slate-700">{dashboard.workflow.statusLabel}</span>
          </div>
        </section>

        <section className="grid gap-4">
          <article className={`${cardClass} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">
              Next meeting
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">
              {nextMeeting ? nextMeeting.meetingType : "No meeting"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {nextMeeting ? formatDate(nextMeeting.scheduledOn) : "No upcoming meeting scheduled."}
            </p>
          </article>

          <article className={`${cardClass} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">
              Latest update
            </p>
            <h2 className="mt-3 text-xl font-semibold text-ink">
              {latestUpdate?.title || "No recent activity"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {latestUpdate?.detail || "Once users start working, recent activity will appear here."}
            </p>
          </article>
        </section>
      </div>

      <section className={`${cardClass} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
          Available pages
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Choose one page to continue</h2>
        <p className="mt-2 text-sm text-slate-600">
          The interface is intentionally simple. Each role only sees the pages relevant to its work.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleModules.map((moduleKey) => (
            <article key={moduleKey} className="rounded-[24px] border border-sky/60 bg-shell/55 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">Page</p>
              <h3 className="mt-3 text-xl font-semibold text-ink">
                {moduleMeta[moduleKey]?.title || moduleKey}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {moduleMeta[moduleKey]?.description || "Open this page to continue working."}
              </p>
              <button
                className={`${primaryButtonClass} mt-5 w-full`}
                type="button"
                onClick={() => onOpenModule(moduleKey)}
              >
                Open page
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default RoleHomePage;
