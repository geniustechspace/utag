"use client";

import NextLink from "next/link";
import { internalUrls } from "@/config/site-config";
import { useAuth } from "@/providers/auth-provider";
import { Meeting, useMeetingModel } from "@/providers/models";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Input, Textarea } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, Key, useEffect } from "react";
import { FiArrowLeftCircle, FiPlus } from "react-icons/fi";

const initialMeetingForm = {
  meeting_id: "",
  title: "",
  agenda: "",
};

export const CreateMeetingForm = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { authUser } = useAuth();
  const { createMeeting } = useMeetingModel(); // Meeting model

  const [formData, setFormData] = useState<Meeting>(
    initialMeetingForm as Meeting,
  );

  const [selectedAttendeeKeys, setSelectedAttendeeKeys] = useState<
    Iterable<Key>
  >(new Set([]));

  const selectedAttendeeValue = useMemo(
    () => Array.from(selectedAttendeeKeys).join(", "),
    [selectedAttendeeKeys],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) {
      return;
    }

    if (!formData.title || !formData.date) {
      return;
    }

    // formData.organizer_id = authUser.uid;
    try {
      await createMeeting({
        ...formData,
        meeting_id: Date.now().toString(),
        // organizer_id: authUser.uid,
        participants: selectedAttendeeValue.split(", "),
      });
      onClose();
      alert("Meeting created successfully!");
      setFormData(initialMeetingForm as unknown as Meeting);
      setSelectedAttendeeKeys(new Set()); // Reset attendees
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Failed to create meeting.");
    }
  };

  return (
    <>
      <div className="flex justify-between mb-6">
        <Button
          size="sm"
          radius="sm"
          color="primary"
          variant="ghost"
          startContent={<FiPlus />}
          onPress={onOpen}
        >
          New Meeting
        </Button>
      </div>

      <Modal
        size="2xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent className="border-1 border-primary">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create a Meeting
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col space-y-4 p-4 rounded-lg shadow-md"
                >
                  <Input
                    required
                    label="Meeting Title"
                    type="text"
                    value={formData.title}
                    name="title"
                    onChange={handleInputChange}
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    classNames={{
                      mainWrapper: "w-full mt-6",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                  />

                  <Textarea
                    label="Agenda"
                    placeholder="Enter meeting agenda"
                    name="agenda"
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    value={formData.agenda}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agenda: e.target.value,
                      }))
                    }
                    className="mb-6"
                    classNames={{
                      mainWrapper: "w-full",
                      label: "font-bold",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                  />

                  {/* Date input */}
                  <Input
                    required
                    label="Meeting Date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    classNames={{
                      mainWrapper: "w-full",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                  />

                  {/* Attendees Dropdown */}
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        radius="sm"
                        color="primary"
                        variant="bordered"
                        className="capitalize"
                      >
                        {selectedAttendeeValue || "Select Attendees"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Attendee Selection"
                      variant="flat"
                      disallowEmptySelection
                      selectionMode="multiple"
                      selectedKeys={selectedAttendeeKeys as unknown as undefined}
                      onSelectionChange={(keys) =>
                        setSelectedAttendeeKeys(new Set(keys))
                      }
                    >
                      <DropdownItem key="Member 1">Member 1</DropdownItem>
                      <DropdownItem key="Member 2">Member 2</DropdownItem>
                      <DropdownItem key="Member 3">Member 3</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Button
                    type="submit"
                    radius="sm"
                    color="primary"
                    variant="solid"
                  >
                    Submit
                  </Button>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
