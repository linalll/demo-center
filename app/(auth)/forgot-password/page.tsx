import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="نسيت كلمة السر" subtitle="سنرسل لك رمز تحقق لتعيين كلمة سر جديدة">
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-muted">
        تذكرت كلمة السر؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
