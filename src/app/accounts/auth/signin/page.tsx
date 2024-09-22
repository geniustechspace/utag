"use client";

import { internalUrls } from "@/config/site-config";
import {
  handleAuthErrors,
  loginWithEmail,
} from "@/providers/auth-provider";
import { Button } from "@nextui-org/button";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import NextLink from "next/link";
import { Input } from "@nextui-org/input";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail({ email, password });
      router.push(redirectUrl || internalUrls.home);
      return;
    } catch (error) {
      handleAuthErrors(error, setErrors);
      return;
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

        <Button
          className="w-full mt-3 font-semibold"
          color="primary"
          radius="sm"
          type="submit"
          variant="solid"
        >
          Proceed with login
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
          Don&apos;s have an account?{" "}
          <NextLink
            href={
              redirectUrl
                ? `${internalUrls.signup}?redirect=${redirectUrl}`
                : internalUrls.signup
            }
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            sign up
          </NextLink>
        </span>
      </div>
    </>
  );
}
