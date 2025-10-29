import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const userInfo = await getServerSession(authOptions);
    if (!userInfo?.user) {
        redirect('/signin');
    }
  return <>{children}</>;
}
