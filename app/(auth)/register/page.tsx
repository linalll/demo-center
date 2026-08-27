import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell title="إنشاء حساب" subtitle="أنشئ حساب كولي أمر لمتابعة أبنائك، أو كطالب لمتابعة حضورك ودرجاتك">
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
