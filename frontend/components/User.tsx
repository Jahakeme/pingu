"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const User = () => {
    const { data, status } = useSession();
    const router = useRouter();
  return (
    <div>
        {
            status === "authenticated" ? 
            <div className="flex justify-center items-center h-screen">
                <p>Welcome, {data?.user?.name}</p>
            </div>:
            <div className=" flex justify-center items-center h-screen">
                <button onClick={() => {router.push("/signin")}} className=" bg-blue-600 px-6 py-2 rounded hover:bg-green-400">Sign in</button>
            </div>
        }
    </div>
  )
}

export default User
