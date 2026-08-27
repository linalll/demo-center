import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell title="تسجيل الدخول" subtitle="سجل الدخول برقم هاتفك وكلمة السر">
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-dark">
          إنشاء حساب
        </Link>
      </p>
    </AuthShell>
  );
}
