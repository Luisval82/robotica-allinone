import { AlertIcon } from "@/components/ui/icons";

/** Aviso general del formulario (por ejemplo, credenciales incorrectas). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800"
    >
      <AlertIcon className="mt-0.5 size-5 shrink-0" />
      {message}
    </p>
  );
}
