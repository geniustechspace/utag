"use client";

import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Badge } from "@nextui-org/badge";
import { IoIosNotifications } from "react-icons/io";
import { Button } from "@nextui-org/button";

import { internalUrls } from "@/config/site-config";
import { logOut, useAuth } from "@/providers/auth-provider";

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
      offset={19}
      shadow="md"
      closeOnSelect={true}
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
          <Badge color="primary" content={5}>
            <IoIosNotifications size={22} />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu variant="faded" aria-label="Notifications">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((notification, idx) => (
          <DropdownItem
            key={`Notification ${idx + 1}`}
            //   startContent={}
            description="Notifications for your account info"
            classNames={{ title: "font-semibold" }}
          >
            {`Notification ${idx + 1}`}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
