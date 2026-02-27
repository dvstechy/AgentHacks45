import { getCurrentUser } from "@/app/actions/user";
import DashboardLayoutClient from "./layout-client";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
