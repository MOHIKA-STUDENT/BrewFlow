export default function Settings() {
  const Field = ({ label, value, type = "text" }) => (
    <div>
      <label className="text-xs font-medium text-ink-500 dark:text-ink-300 mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        defaultValue={value}
        className="w-full px-3 py-2.5 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 text-sm outline-none focus:border-gold-500 text-ink-900 dark:text-paper-100"
      />
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
        <h2 className="font-display font-semibold text-ink-900 dark:text-paper-100">
          Business Profile
        </h2>
        <Field label="Brand name" value="Oatish" />
        <Field label="Contact email" value="founder@oatish.in" type="email" />
        <Field label="Product category" value="Oat Milk" />
      </div>

      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5">
        <h2 className="font-display font-semibold text-ink-900 dark:text-paper-100 mb-1">
          Authentication
        </h2>
        <p className="text-sm text-ink-500 dark:text-ink-300">
          Login, roles, and permissions arrive in Sprint 11. This screen is a placeholder
          so the navigation and layout already exist when that logic is added.
        </p>
      </div>
    </div>
  );
}
