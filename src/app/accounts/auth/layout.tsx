"use client";

import { Divider } from "@/components/utils";
import { handleAuthErrors, loginWithGoogle } from "@/providers/auth-provider";
import { Button } from "@nextui-org/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<string>("");

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle()
      router.push(searchParams.get("redirect") || "/");
    } catch (error) {
      handleAuthErrors(error, setErrors);
    }
  };

  return (
    <section className="flex w-full max-w-screen-xl mx-auto justify-between gap-3 my-8 px-6">
      <div className="w-full md:w-2/4">Image</div>
      <div className="card w-full md:w-2/4 px-6 py-5 rounded-md">
        <div className="w-full inline-flex flex-nowrap gap-x-4 justify-center my-3">
          <Button
            className="border-1 font-semibold text-sx shadow-md w-full mb-3"
            radius="sm"
            color="primary"
            startContent={<FcGoogle className="" size={16} />}
            variant="faded"
            onClick={handleGoogleAuth}
          >
            Login with google
          </Button>
        </div>
        {errors && (
          <p className="text-center font-semibold text-sm text-danger mt-2">
            {errors}
          </p>
        )}

        <Divider className="my-0" textContent="or" />

        {children}
      </div>
    </section>
  );
}
