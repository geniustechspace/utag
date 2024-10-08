"use client";

import { Select, SelectItem } from "@nextui-org/select";
import { User as AuthUser } from "firebase/auth";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import NextLink from "next/link";

import {
  handleAuthErrors,
  loginWithEmail,
  logOut,
  signUpWithEmail,
} from "@/providers/auth-provider";
import { User, useUserModel } from "@/providers/models/user-profile";
import { internalUrls, userRoles } from "@/config/site-config";

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
      const _user = (await signUpWithEmail({ email, password })) as AuthUser;

      await logOut();
      await createUser({
        user_id: _user.uid,
        name,
        email,
        password: "",
        role,
        photoURL: _user.photoURL || undefined,
      });
      await loginWithEmail({ email, password });
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
          <Select
            label="Select a role"
            // size="sm"
            radius="sm"
            color="primary"
            variant="bordered"
            labelPlacement="outside"
            className=""
            classNames={{
              trigger:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
            onChange={(e) => setRole(e.target.value as User["role"])}
          >
            {userRoles.map((role) => (
              <SelectItem key={role}>{role}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="my-10">
          <Input
            label={<span>Full name</span>}
            labelPlacement="outside"
            type="text"
            value={name}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="my-10">
          <Input
            label={<span>Email</span>}
            labelPlacement="outside"
            type="email"
            value={email}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="my-10">
          <Input
            label={<span>Password</span>}
            labelPlacement="outside"
            type="password"
            value={password}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="my-10">
          <Input
            label={<span>Confirm password</span>}
            labelPlacement="outside"
            type="password"
            value={password2}
            radius="sm"
            color="primary"
            variant="bordered"
            className=""
            classNames={{
              mainWrapper: "w-full",
              inputWrapper:
                "border-primary-500 data-[hover=true]:border-primary font-bold",
            }}
            onChange={(e) => setPassword2(e.target.value)}
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
