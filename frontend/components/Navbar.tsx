"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="flex items-start justify-between mr-1 md:px-6 py-4">
      <div className="flex items-center">
        <Image
          src="/pingulogo.svg"
          alt="Pingu Logo"
          width={120}
          height={120}
          className="cursor-pointer w-16 h-12 md:w-24 md:h-20 lg:w-28 lg:h-24"
          onClick={() => router.push("/")}
        />
      </div>
      <div className="flex items-center gap-2 md:gap-3 pt-2 md:pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs md:text-sm px-3 md:px-4"
          onClick={() => {
            router.push("/signin");
          }}
        >
          Sign in
        </Button>
        <Button
          size="sm"
          className="text-xs md:text-sm px-3 md:px-4"
          onClick={() => {
            router.push("/signup");
          }}
        >
          Care to join?
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
