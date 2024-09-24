"use client";

import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Avatar } from "@nextui-org/avatar";
import { User } from "@nextui-org/user";

import { internalUrls } from "@/config/site-config";
import { logOut, useAuth } from "@/providers/auth-provider";
import { Button } from "@nextui-org/button";

export const UserProfile = () => {
  const router = useRouter();

  const { user } = useAuth();

  const handleLogOut = async () => {
    logOut();
    router.push(internalUrls.signin);
  };

  return (
    <Dropdown
      showArrow
      placement="bottom-end"
      offset={14}
      shadow="md"
      closeOnSelect={true}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="full"
          // color="primary"
          variant="light"
          className="flex gap-4 items-center mx-2"
          type="button"
          aria-label="Profile"
        >
          <Avatar
            isBordered
            showFallback
            className="bg-transparent w-6 h-6 text-tiny"
            src={
              user && user.photoURL
                ? user.photoURL
                : "images/avatar-placeholder.jpg"
            }
          />
        </Button>
      </DropdownTrigger>

      <DropdownMenu variant="faded" aria-label="User profile">
        <DropdownItem
          key="profile"
          showDivider
          className="border-default cursor-default data-[hover=true]:bg-transparent data-[selectable=true]:focus:bg-transparent"
          classNames={{ base: "bg-emerald" }}
        >
          <User
            name={user && user.name}
            description={
              user && user.email ? user.email : `${user?.name}@utag.gh.org`
            }
            classNames={{
              // base: "bg-danger p-4",
              name: "font-semibold",
              description: "text-default-500",
            }}
            avatarProps={{
              size: "sm",
              src:
                user && user.photoURL
                  ? user.photoURL
                  : "images/avatar-placeholder.jpg",
            }}
          />
        </DropdownItem>

        <DropdownItem
          key="settings"
          href={internalUrls.settings}
          shortcut="⌘S"
          description="Update your account info"
          //   startContent={}
          classNames={{ title: "font-semibold" }}
        >
          Settings
        </DropdownItem>

        <DropdownItem
          key="copy"
          shortcut="⌘C"
          //   description="Copy the file link"
          // startContent={<CopyDocumentIcon className={iconClasses} />}
          classNames={{ title: "font-semibold" }}
        >
          Activities
        </DropdownItem>

        <DropdownItem
          key="notifications"
          showDivider
          shortcut="⌘N"
          // startContent={<EditDocumentIcon className={iconClasses} />}
          classNames={{ title: "font-semibold" }}
        >
          Notifications
        </DropdownItem>

        <DropdownSection className="mb-0">
          <DropdownItem
            key="logout"
            color="danger"
            variant="solid"
            classNames={{
              base: "bg-danger text-white",
              title: "text-center font-semibold",
            }}
            onClick={handleLogOut}
          >
            Log out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
