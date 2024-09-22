"use client";

import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/dropdown";
import {Badge} from "@nextui-org/badge"
import { IoIosNotifications } from "react-icons/io";

import { internalUrls } from "@/config/site-config";
import { logOut, useAuth } from "@/providers/auth-provider";
import { Button } from "@nextui-org/button";

export const NotificationDropdown = () => {
  const router = useRouter();

  const { user } = useAuth();

  const handleLogOut = async () => {
    logOut();
    router.push(internalUrls.home);
  };

  return (
    <Dropdown
      showArrow
      radius="sm"
      placement="bottom-end"
      offset={18}
      shadow="md"
      closeOnSelect={false}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          radius="full"
          // color="primary"
          variant="ghost"
          type="button"
          aria-label="Notification"
          className="overflow-visible"
        >
          <Badge color="primary" content={5}><IoIosNotifications size={22} /></Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu variant="faded" aria-label="User profile">
        <DropdownItem
          key="settings"
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
