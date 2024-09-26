"use client";

import { Image } from "@nextui-org/image";
import { User as AuthUser } from "firebase/auth";
import { Divider } from "@/components/utils";
import { handleAuthErrors, loginWithGoogle } from "@/providers/auth-provider";
import { useUserModel } from "@/providers/models/user-profile";
import { Button } from "@nextui-org/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createUser } = useUserModel();

  const [errors, setErrors] = useState<string>("");

  const handleGoogleAuth = async () => {
    try {
      const _user = (await loginWithGoogle()) as AuthUser;
      const user_id = _user.uid;
      await createUser({
        user_id,
        name: _user.displayName!,
        email: _user.email!,
        password: "",
        role: "Member",
        photoURL: _user.photoURL || undefined,
      });
      router.push(searchParams.get("redirect") || "/");
    } catch (error) {
      handleAuthErrors(error, setErrors);
    }
  };

  return (
    <section className="flex flex-wrap md:flex-nowrap w-full max-w-screen-xl mx-auto gap-3 my-8 px-6">
      <Image
        radius="sm"
        src="/images/registration.jpg"
        alt="UTAG - Registration Image"
        classNames={{wrapper: "overflow-hidden", img:"object-cover w-full h-full"}}
      />
      <div className="card w-full md:min-w-96 px-6 py-5 rounded-md">
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
