import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { getSession } from "@/lib/auth";
import { LOGIN_PATH } from "@/lib/routes";

// Marco común de los tres paneles. Nadie llega aquí sin sesión.
export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header user={session} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
