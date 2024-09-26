"use client";

import NextLink from "next/link";
import { internalUrls } from "@/config/site-config";
import { useAuth } from "@/providers/auth-provider";
import { Feedback, useFeedbackModel } from "@/providers/models";
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

const initialForm = {
  _id: "",
  user_id: "",
  type: "question",
  target_group: "Members",
  subject: "",
  message: "",
};

export const CreateFeedbackForm = () => {
  const pathname = usePathname();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { authUser } = useAuth();

  const { createFeedback } = useFeedbackModel();
  const [formData, setFormData] = useState<Feedback>(initialForm as Feedback);

  const [selectedTypeKeys, setSelectedTypeKeys] = useState<Iterable<Key>>(
    new Set([]),
  );
  const [selectedTargetKeys, setSelectedTargetKeys] = useState<Iterable<Key>>(
    new Set([]),
  );

  // Memoize selected values
  const selectedTypeValue = useMemo(
    () => Array.from(selectedTypeKeys).join(", "),
    [selectedTypeKeys],
  );
  const selectedTargetValue = useMemo(
    () => Array.from(selectedTargetKeys).join(", "),
    [selectedTargetKeys],
  );

  const { getFeedback } = useFeedbackModel();

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Correct way to get the last segment of the URL path
  const feedback_id = useMemo(() => pathname.split("/").pop(), [pathname]);
  console.log(feedback_id);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!feedback_id) return; // Ensure feedback_id is available
      try {
        const _feedback = await getFeedback(feedback_id);
        setFeedback(_feedback);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      }
    };

    fetchFeedback();
  }, [feedback_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) {
      return;
    }

    if (!formData.subject) {
      return;
    }

    formData.user_id = authUser.uid;
    try {
      await createFeedback({
        ...formData,
        _id: `${formData.subject}@${new Date().toISOString()}`
          .replace(/[\s:]/g, "-")
          .toLowerCase(),
        user_id: authUser.uid,
        type: selectedTypeValue.toLowerCase() as Feedback["type"],
        target_group: selectedTargetValue as Feedback["target_group"],
      });
      onClose();
      // alert("Feedback created successfully!");
      // Reset form
      setFormData(initialForm as Feedback);
      setSelectedTypeKeys(new Set()); // Reset to default
      setSelectedTargetKeys(new Set()); // Reset to default
    } catch (error) {
      console.error("Error creating feedback:", error);
      alert("Failed to create feedback.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between mb-6">
        {pathname === internalUrls.qna ? (
          <h6 className="font-bold">Questions and discussions</h6>
        ) : (
          <>
            <Button
              as={NextLink}
              href={internalUrls.qna}
              size="sm"
              radius="sm"
              color="primary"
              variant="flat"
              startContent={<FiArrowLeftCircle size={18} />}
              className="font-bold"
            >
              Back
            </Button>
            <h6 className="font-bold">{feedback?.subject}</h6>
          </>
        )}
        <Button
          size="sm"
          radius="sm"
          color="primary"
          variant="ghost"
          startContent={<FiPlus />}
          className=""
          onPress={onOpen}
        >
          New
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
                Discussion || Question || Complaints
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col space-y-4 p-4 rounded-lg shadow-md"
                >
                  <div className="flex justify-between">
                    {/* Feedback Type Dropdown */}
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          radius="sm"
                          color="primary"
                          variant="bordered"
                          className="capitalize"
                        >
                          {selectedTypeValue || "Select Feedback Type"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Feedback Type Selection"
                        variant="flat"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedTypeKeys as unknown as undefined}
                        onSelectionChange={(keys) =>
                          setSelectedTypeKeys(new Set(keys))
                        }
                      >
                        <DropdownItem key="question" value={"question"}>
                          Question
                        </DropdownItem>
                        <DropdownItem key="discussion" value={"discussion"}>
                          Discussion
                        </DropdownItem>
                        <DropdownItem key="complaint" value={"complaint"}>
                          Complaint
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>

                    {/* Target Group Dropdown */}
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          radius="sm"
                          color="primary"
                          variant="bordered"
                          className="capitalize"
                        >
                          {selectedTargetValue || "Select Target Group"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Target Group Selection"
                        variant="flat"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={
                          selectedTargetKeys as unknown as undefined
                        }
                        onSelectionChange={(keys) =>
                          setSelectedTargetKeys(new Set(keys))
                        }
                      >
                        <DropdownItem key="Members" value={"Members"}>
                          Members
                        </DropdownItem>
                        <DropdownItem key="Secretary" value={"Secretary"}>
                          Secretary
                        </DropdownItem>
                        <DropdownItem key="President" value={"President"}>
                          President
                        </DropdownItem>
                        <DropdownItem key="Treasurer" value={"Treasurer"}>
                          Treasurer
                        </DropdownItem>
                        <DropdownItem
                          key="Vice President"
                          value={"Vice President"}
                        >
                          Vice President
                        </DropdownItem>
                        <DropdownItem
                          key="Electoral Commissioner"
                          value={"Electoral Commissioner"}
                        >
                          Electoral Commissioner
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <Input
                    required
                    label="Subject"
                    labelPlacement="outside"
                    type="text"
                    value={formData.subject ?? ""}
                    name="subject"
                    onChange={handleInputChange}
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    className=""
                    classNames={{
                      mainWrapper: "w-full mt-6",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                  />

                  <Textarea
                    required
                    label="Message"
                    labelPlacement="outside"
                    placeholder="Enter your message"
                    name="message"
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    value={formData.message ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="mb-12"
                    classNames={{
                      mainWrapper: "w-full",
                      label: "font-bold",
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                  />

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
