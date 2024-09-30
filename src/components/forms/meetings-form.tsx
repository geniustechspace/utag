"use client";

import NextLink from "next/link";
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
import { usePathname } from "next/navigation";
import { useState, useMemo, Key, useEffect } from "react";
import { FiArrowLeftCircle, FiPlus } from "react-icons/fi";

import { Meeting, useMeetingModel, useUserModel } from "@/providers/models";
import { useAuth } from "@/providers/auth-provider";
import { internalUrls } from "@/config/site-config";

const initialMeetingForm = {
  meeting_id: "",
  title: "",
  agenda: "",
};

export const CreateMeetingForm = () => {
  const pathname = usePathname();

  const { authUser } = useAuth();
  const { userCache } = useUserModel();
  const { createMeeting } = useMeetingModel(); // Meeting model

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [formData, setFormData] = useState<Meeting>(
    initialMeetingForm as Meeting,
  );

  const [selectedSpeakersKeys, setSelectedSpeakersKeys] = useState<
    Iterable<Key>
  >(new Set([]));

  const selectedSpeakersValue = useMemo(
    () => Array.from(selectedSpeakersKeys).join(", "),
    [selectedSpeakersKeys],
  );

  const { getMeeting } = useMeetingModel();

  const [meeting, setMeeting] = useState<Meeting | null>(null);

  // Correct way to get the last segment of the URL path
  const meeting_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!meeting_id) return; // Ensure meeting_id is available

      try {
        const _feedback = await getMeeting(meeting_id);

        setMeeting(_feedback);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      }
    };

    fetchFeedback();
  }, [meeting_id]);

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

    formData.date = new Date(formData.date);
    formData.time = new Date(formData.time!).toTimeString();

    try {
      await createMeeting({
        ...formData,
        meeting_id: `${formData.title}@${new Date().toISOString()}` // ISO string for precise timestamp
          .replace(/[\s:]/g, "-")
          .toLowerCase(),
        participants: selectedSpeakersValue.split(", "),
      });
      onClose();
      setFormData(initialMeetingForm as unknown as Meeting);
      setSelectedSpeakersKeys(new Set()); // Reset attendees
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Failed to create meeting.");
    }
  };

  return (
    <>
      <div className="flex justify-between mb-6">
        <Button
          as={NextLink}
          href={internalUrls.home}
          size="sm"
          radius="sm"
          color="primary"
          variant="flat"
          startContent={<FiArrowLeftCircle size={18} />}
          className="font-bold"
        >
          Back
        </Button>
        {pathname === internalUrls.meetings ? (
          <h6 className="font-bold">Meetings</h6>
        ) : (
          <h6 className="font-bold">{meeting?.title}</h6>
        )}
        <Button
          size="sm"
          radius="sm"
          color="primary"
          variant="ghost"
          startContent={<FiPlus />}
          onPress={onOpen}
        >
          New meeting
        </Button>
      </div>

      <Modal
        size="2xl"
        isOpen={isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="border-1 border-primary">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create a Meeting
              </ModalHeader>
              <ModalBody>
                <form
                  className="flex flex-col space-y-4 p-4 rounded-lg shadow-md"
                  onSubmit={handleSubmit}
                >
                  <Input
                    required
                    label="Meeting Title"
                    type="text"
                    value={formData.title}
                    name="title"
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    classNames={{
                      mainWrapper: "w-full mt-6",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                    onChange={handleInputChange}
                  />

                  <Textarea
                    label="Agenda"
                    placeholder="Enter meeting agenda"
                    name="agenda"
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    value={formData.agenda}
                    className="mb-6"
                    classNames={{
                      mainWrapper: "w-full",
                      label: "font-bold",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agenda: e.target.value,
                      }))
                    }
                  />

                  <Input
                    required
                    label="Meeting address"
                    type="text"
                    value={formData.location}
                    name="location"
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    classNames={{
                      mainWrapper: "w-full mt-6",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                    onChange={handleInputChange}
                  />

                  <div className="flex gap-2 items-center">
                    {/* Date input */}
                    <Input
                      required
                      label="Meeting Date"
                      type="date"
                      name="date"
                      value={formData.date}
                      radius="sm"
                      color="primary"
                      variant="bordered"
                      classNames={{
                        mainWrapper: "w-full",
                        inputWrapper:
                          "border-primary-500 data-[hover=true]:border-primary font-bold",
                      }}
                      onChange={handleInputChange}
                    />

                    {/* Time input */}
                    <Input
                      required
                      label="Meeting Time"
                      type="time"
                      name="time"
                      value={formData.time}
                      radius="sm"
                      color="primary"
                      variant="bordered"
                      classNames={{
                        mainWrapper: "w-full",
                        inputWrapper:
                          "border-primary-500 data-[hover=true]:border-primary font-bold",
                      }}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Speakerss Dropdown */}
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        radius="sm"
                        color="primary"
                        variant="bordered"
                        className="capitalize"
                      >
                        {selectedSpeakersValue || "Select Speakers"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Speakers Selection"
                      variant="flat"
                      // disallowEmptySelection
                      closeOnSelect={false}
                      selectionMode="multiple"
                      selectedKeys={
                        selectedSpeakersKeys as unknown as undefined
                      }
                      onSelectionChange={(keys) =>
                        setSelectedSpeakersKeys(new Set(keys))
                      }
                    >
                      {Object.values(userCache).map((user) => (
                        <DropdownItem key={user.name}>{user.name}</DropdownItem>
                      ))}
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
