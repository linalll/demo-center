import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-primary-light/60 to-background px-6 py-12">
      <div className="w-full max-w-sm animate-enter">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo size={40} />
          <div>
            <p className="font-bold leading-none">سنتر أنمكا</p>
            <p className="text-xs text-muted leading-none mt-0.5">ANMKA Center</p>
          </div>
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
