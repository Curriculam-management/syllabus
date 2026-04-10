import { primaryButtonClass } from "../ui";

function LoginPage({ roles, selectedRole, cycle, workflowStatus, onSelectRole }) {
  return (
    <section className="grid gap-6 py-4">
      <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(180,211,217,0.82),rgba(242,234,224,0.94),rgba(189,166,206,0.72))] p-6 shadow-card sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet">Login</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Select your role</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
          When the website opens, the first step is role selection. After choosing a
          role, the user is taken directly to the relevant workspace or page.
        </p>

        <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/65 px-4 py-3">
            <span className="font-semibold text-ink">Current cycle:</span> {cycle}
          </div>
          <div className="rounded-2xl bg-white/65 px-4 py-3">
            <span className="font-semibold text-ink">Workflow stage:</span> {workflowStatus}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <article
            key={role.name}
            className={`rounded-[28px] border p-5 shadow-card backdrop-blur-sm transition ${
              selectedRole === role.name
                ? "border-violet bg-white"
                : "border-white/70 bg-white/80 hover:-translate-y-0.5"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">Role</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">{role.label}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{role.responsibility}</p>
            <button
              className={`${primaryButtonClass} mt-6 w-full`}
              type="button"
              onClick={() => onSelectRole(role.name)}
            >
              Continue as {role.label}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LoginPage;
