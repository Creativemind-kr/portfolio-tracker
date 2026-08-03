import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminRequest } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminRequest())) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
          포폴반 작업관리
        </Link>
        <LogoutButton />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
