"use client";

import "@/styles/globals.css";
import NextLink from "next/link";
import { Link } from "@nextui-org/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site-config";
// import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Button } from "@nextui-org/button";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";

const AuthPagesLayout = ({
  children,
}: {
  children: React.ReactNode;
  }) => {

  return (
    <>
      <Navbar />
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <aside className="hidden md:inline w-64 h-fit sticky sticky-top top-[4.1rem] border-r border-default">
          <div className="mx-3 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <Button
                key={`${item}-${index}`}
                as={NextLink}
                href={item.href}
                radius="sm"
                color="primary"
                variant="light"
                className="font-semibold justify-start"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </aside>
        <section className="w-full px-3 py-6">{children}</section>
      </main>
    </>
  );
}

export default withLoginRequired(AuthPagesLayout);