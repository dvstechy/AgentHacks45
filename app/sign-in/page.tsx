import { SignInForm } from "@/components/auth/sign-in-form";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function SignInPage() {
  const session = await getSession();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <SiteHeader session={session} />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
              <Image src="/logo_1.png" alt="IMS Logo" width={32} height={32} className="object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your dashboard
              </p>
            </div>
          </div>

          <SignInForm />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}