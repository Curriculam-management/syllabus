import { ghostButtonClass, panelClass, StatusBadge } from "../ui";

function ModulePage({
  dashboard,
  selectedRole,
  moduleTitle,
  moduleDescription,
  onBackHome,
  onBackRole,
  children,
}) {
  const isFeedbackRole = selectedRole === "Feedback";

  return (
    <section className="grid gap-6 py-4">
      <div className={panelClass}>
        <div className="flex flex-wrap gap-3">
          {!isFeedbackRole ? (
            <button className={ghostButtonClass} type="button" onClick={onBackRole}>
              Back to role page
            </button>
          ) : null}
          <button className={ghostButtonClass} type="button" onClick={onBackHome}>
            Change role
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
              {selectedRole}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">{moduleTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {moduleDescription}
            </p>
          </div>

          <StatusBadge tone={isFeedbackRole ? "completed" : dashboard.workflow.published ? "published" : "active"}>
            {isFeedbackRole ? "Feedback only" : dashboard.workflow.statusLabel}
          </StatusBadge>
        </div>
      </div>

      {children}
    </section>
  );
}

export default ModulePage;
