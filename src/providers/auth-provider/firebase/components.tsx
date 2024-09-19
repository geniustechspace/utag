"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import clsx from "clsx";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

import { handleAuthErrors } from ".";

import { Divider } from "@/components/utils";

export const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      router.back();

      return;
    } catch (error) {
      handleAuthErrors(error, setErrors);

      return;
    }
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      {errors && (
        <p className="text-center font-semibold text-sm text-danger pb-3">
          {errors}
        </p>
      )}
      <div className="">
        <label className="block text-xs font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          required
          className="w-full border border-emerald-200 dark:border-emerald-700 rounded-md py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-primary dark:focus:border-emerald-400 truncate"
          id="email"
          placeholder="Enter your email address..."
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="my-3">
        <label className="block text-xs font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          required
          className="w-full border border-emerald-200 dark:border-emerald-700 rounded-md py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-primary dark:focus:border-emerald-400 truncate"
          id="password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
  );
};

export const SignUpForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [errors, setErrors] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!(password === password2)) {
      setErrors("Passwords not the same!");

      return;
    }
    try {
      router.back();
    } catch (error) {
      handleAuthErrors(error, setErrors);
    }
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      {errors && (
        <p className="text-center font-semibold text-sm text-danger pb-3">
          {errors}
        </p>
      )}
      <div className="">
        <label className="block text-xs font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          required
          className="w-full border border-emerald-200 dark:border-emerald-700 rounded-md py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-primary dark:focus:border-emerald-400 truncate"
          id="email"
          placeholder="Enter your email address..."
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="my-3">
        <label className="block text-xs font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          required
          className="w-full border border-emerald-200 dark:border-emerald-700 rounded-md py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-primary dark:focus:border-emerald-400 truncate"
          id="password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="my-3">
        <label className="block text-xs font-bold mb-2" htmlFor="password2">
          Confirm password
        </label>
        <input
          required
          className="w-full border border-emerald-200 dark:border-emerald-700 rounded-md py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-primary dark:focus:border-emerald-400 truncate"
          id="password2"
          placeholder="Confirm password"
          type="password"
          value={password2}
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
  );
};

export const AuthComponentsMounter = () => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [authState, setAuthSate] = useState<"login" | "signup">("login");
  const [errors, setErrors] = useState<string>("");

  const handleGoogleAuth = async () => {
    try {
      router.forward();
    } catch (error) {
      handleAuthErrors(error, setErrors);
    }
  };

  const handleAnonymousAuth = async () => {
    try {
      router.back();
    } catch (error) {
      handleAuthErrors(error, setErrors);
    }
  };

  return (
    <>
      <Button
        color="primary"
        radius="sm"
        size="sm"
        variant="light"
        // endContent={<FiChevronsRight />}
        className="font-semibold text-sm text-primary"
        onPress={onOpen}
      >
        Login
      </Button>

      <Modal
        isDismissable={false}
        isOpen={isOpen}
        scrollBehavior="inside"
        size="xl"
        isKeyboardDismissDisabled={true}
        onOpenChange={onOpenChange}
        // hideCloseButton
      >
        <ModalContent className="border-1 border-emerald-600 h-screen">
          {(_onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center text-center">
                AUTHENTICATION
                <span className="text-center inline-block text-sm font-semibold mt-2">
                  Get Authenticated for a better experience with serenity bot
                </span>
              </ModalHeader>

              <ModalBody className="custom-scrollbar">
                <div className="w-full inline-flex flex-nowrap gap-x-4 justify-center">
                  <Button
                    className="border-1 font-semibold text-sx shadow-md"
                    color="primary"
                    size="sm"
                    startContent={<FcGoogle className="" size={16} />}
                    variant="ghost"
                    onClick={handleAnonymousAuth}
                  >
                    Anonymous
                  </Button>
                  <Button
                    className="border-1 font-semibold text-sx shadow-md"
                    color="primary"
                    size="sm"
                    startContent={<FcGoogle className="" size={16} />}
                    variant="ghost"
                    onClick={handleGoogleAuth}
                  >
                    Google
                  </Button>
                </div>
                {errors && (
                  <p className="text-center font-semibold text-sm text-danger mt-2">
                    {errors}
                  </p>
                )}

                <Divider className="my-0" textContent="or" />

                {authState === "login" ? (
                  <LoginForm />
                ) : authState === "signup" ? (
                  <SignUpForm />
                ) : null}
              </ModalBody>

              <ModalFooter className="justify-between">
                <Button
                  className={clsx(" rounded font-bold min-w-28", {
                    ["border-b-medium border-primary"]: authState === "login",
                  })}
                  color="primary"
                  size="sm"
                  variant={authState === "login" ? "flat" : "light"}
                  onClick={(_e) => setAuthSate("login")}
                >
                  Go to login
                </Button>
                <Button
                  className={clsx(" rounded font-bold min-w-28", {
                    ["border-b-medium border-primary"]: authState === "signup",
                  })}
                  color="primary"
                  size="sm"
                  variant={authState === "signup" ? "flat" : "light"}
                  onClick={(_e) => setAuthSate("signup")}
                >
                  Go to sign up
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
