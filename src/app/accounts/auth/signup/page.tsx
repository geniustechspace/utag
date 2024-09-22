"use client";

import { User as FirebaseUser } from "firebase/auth";
import { internalUrls } from "@/config/site-config";
import { User, useUserModel } from "@/models/user-profile";
import { handleAuthErrors, signUpWithEmail } from "@/providers/auth-provider";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import NextLink from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createUser } = useUserModel();

  const [name, setName] = useState<string | undefined>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [role, setRole] = useState<User["role"]>("Member");
  const [errors, setErrors] = useState<string>("");

  const redirectUrl = searchParams.get("redirect");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!(password === password2)) {
      setErrors("Passwords not the same!");
      return;
    }

    if (!name) {
      setErrors("User name required!");
      return;
    }

    try {
      const user = (await signUpWithEmail({ email, password })) as FirebaseUser;
      const slug = name.split(" ").join("-");
      const user_id = user.uid;
      const dateJoined = new Date();
      await createUser({
        user_id,
        name,
        email,
        password,
        role,
        slug,
        dateJoined,
        photoURL: user.photoURL || undefined,
      });
      router.push(redirectUrl || internalUrls.home);
    } catch (error) {
      handleAuthErrors(error, setErrors);
    }
  };

  return (
    <>
      <form className="" onSubmit={handleSubmit}>
        {errors && (
          <p className="text-center font-semibold text-sm text-danger pb-3">
            {errors}
          </p>
        )}

        <div className="my-10">
          <Input
            label={<span>Full name</span>}
            labelPlacement="outside"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
          />
        </div>

        <div className="my-10">
          <Input
            label={<span>Email</span>}
            labelPlacement="outside"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
          />
        </div>

        <div className="my-10">
          <Input
            label={<span>Password</span>}
            labelPlacement="outside"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
          />
        </div>

        <div className="my-10">
          <Input
            label={<span>Confirm password</span>}
            labelPlacement="outside"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
          />
        </div>

        <Button
          className="w-full mt-3 font-semibold"
          color="primary"
          radius="sm"
          type="submit"
          variant="solid"
        >
          Proceed to signup
        </Button>
      </form>

      <div className="m-auto text-center first-line:font-normal mt-6">
        <span className="m-1 block">
          <NextLink
            href={internalUrls.forgotPassword}
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            Forgot your password
          </NextLink>
        </span>
        <span className="block">
          Have an account already?{" "}
          <NextLink
            href={
              redirectUrl
                ? `${internalUrls.signin}?redirect=${redirectUrl}`
                : internalUrls.signin
            }
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            sign in
          </NextLink>
        </span>
      </div>
    </>
  );
}
