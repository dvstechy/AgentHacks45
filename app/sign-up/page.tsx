import { SignUpForm } from "@/components/auth/sign-up-form";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getSession();
  
  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader session={session} />
      
      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-12 px-4">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>
          
          {/* Animated Gradient Orbs */}
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background"></div>
        </div>

        <SignUpForm />
      </main>
      
      <SiteFooter />
    </div>
  );
}
