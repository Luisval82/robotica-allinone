import { RoleBadge } from "@/components/ui/RoleBadge";
import type { DemoCredential } from "@/lib/types";

/**
 * Recuadro con los usuarios de prueba y sus contraseñas, a la vista.
 * Se muestra u oculta con SHOW_DEMO_CREDENTIALS en src/config/site.ts.
 */
export function DemoCredentials({
  users,
  onPick,
}: {
  users: DemoCredential[];
  onPick: (user: DemoCredential) => void;
}) {
  if (users.length === 0) return null;

  return (
    <section
      aria-labelledby="demo-title"
      className="mt-6 rounded-card border-2 border-dashed border-hub-500 bg-hub-50 p-5 sm:p-6"
    >
      <h2 id="demo-title" className="font-display text-xl font-semibold text-ink-900">
        Usuarios de prueba
      </h2>
      <p className="mt-1 text-sm font-semibold text-ink-600">
        Pulsa uno para rellenar el formulario y entrar con ese rol.
      </p>

      <ul className="mt-4 grid gap-2">
        {users.map((user) => (
          <li key={user.email}>
            <button
              type="button"
              onClick={() => onPick(user)}
              className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border-2 border-ink-100 bg-white px-3 py-2.5 text-left transition-colors hover:border-spike-500"
            >
              <RoleBadge role={user.role} course={user.course} />
              <span className="min-w-0 break-all font-mono text-sm text-ink-800">{user.email}</span>
              <span className="ml-auto font-mono text-sm font-bold text-ink-900">
                {user.password}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs font-semibold text-ink-500">
        Solo para pruebas. Antes de abrir la plataforma al alumnado, oculta este recuadro en{" "}
        <code className="font-mono">src/config/site.ts</code>.
      </p>
    </section>
  );
}
