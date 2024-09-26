import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";

import { UserProfile } from "./user-profile";
import { NotificationDropdown } from "./notification";

import { siteConfig } from "@/config/site-config";
import { UTAGLogo } from "@/components/icons";

export const Navbar = () => {
  return (
    <NextUINavbar isBordered maxWidth="2xl" position="sticky">
      <NavbarContent className="" justify="start">
        <NavbarMenuToggle className="md:hidden" />
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <UTAGLogo />
            <p className="font-bold text-inherit text-xl">
              {siteConfig.name.toUpperCase()}
            </p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* <NavbarContent className="flex gap-4 justify-start ml-2">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href}>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              href={item.href}
            >
              {item.label}
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent> */}

      <NavbarContent className="" justify="end">
        <NotificationDropdown />
        <UserProfile />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
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
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
