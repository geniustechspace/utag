"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { usePathname, useRouter } from "next/navigation";
import { FaPaperclip, FaUserCircle } from "react-icons/fa";
import { Textarea } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";

import {
  Feedback,
  useFeedbackModel,
  User,
  useUserModel,
} from "@/providers/models";

export default function QnADetailsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { feedbackCache, getFeedback, deleteFeedback, addFeedbackResponse } =
    useFeedbackModel();
  const { getUser } = useUserModel();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [responseMessage, setResponseMessage] = useState("");

  // Get the last segment of the URL path
  const feedback_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!feedback_id) return;
      try {
        const _feedback = await getFeedback(feedback_id);

        setFeedback(_feedback);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      }
    };

    const fetchUser = async () => {
      if (!feedback?.user_id) return;
      try {
        const _user = await getUser(feedback?.user_id);

        setUser(_user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchFeedback();
    fetchUser();
  }, [feedbackCache, feedback_id, feedback?.user_id]);

  if (!feedback) return;

  const handleResponseSubmit = async () => {
    if (!responseMessage) return;
    try {
      await addFeedbackResponse(feedback._id, responseMessage);
      setResponseMessage("");
      onClose();
      router.refresh();
      // Optionally refetch the feedback to update the responses
    } catch (error) {
      console.error("Error adding response:", error);
    }
  };

  return (
    <Card radius="sm" className="p-6 shadow-lg">
      {/* Feedback Details */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Avatar icon={<FaUserCircle />} size="md" />
          <div>
            <h6 className="text-lg font-semibold">{user?.name}</h6>
            <h6 className="text-sm text-gray-500">
              Submitted: {feedback.submitted_date.toDate().toDateString()}
            </h6>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h6 className="text-sm text-gray-500">
            Type:{" "}
            {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
          </h6>
          <h6 className="text-sm text-gray-500">
            Target group: {feedback.target_group}
          </h6>
        </div>
      </div>

      <Divider />

      {/* Message Section */}
      <div className="my-4">
        <h6 className="font-semibold mb-2">Message:</h6>
        <p>{feedback.message}</p>
      </div>

      {/* Attachments */}
      {feedback.attachments && feedback.attachments.length > 0 && (
        <>
          <Divider />
          <div className="my-4">
            <h6 className="font-semibold mb-2">Attachments:</h6>
            <ul className="list-disc pl-5 space-y-1">
              {feedback.attachments.map((attachment, index) => (
                <li key={index}>
                  <a
                    href={attachment}
                    className="text-blue-600 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaPaperclip className="mr-2" />
                    Attachment {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Divider />

      {/* Responses */}
      {feedback.response && feedback.response.length > 0 && (
        <div className="my-4">
          <h6 className="font-semibold mb-2">Responses:</h6>
          <ul className="space-y-3">
            {feedback.response.map((response, index) => (
              <li key={index}>
                <p className="p-3 rounded-lg">{response}</p>
                <Divider />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-6 ms-auto">
        <Button
          size="sm"
          radius="sm"
          color="primary"
          className="capitalize"
          onPress={onOpen}
        >
          Respond
        </Button>
        {user?.user_id === feedback.user_id && (
          <Button
            size="sm"
            radius="sm"
            color="danger"
            className="capitalize"
            onClick={() => deleteFeedback(feedback._id)}
            onPress={router.refresh}
          >
            Delete Feedback
          </Button>
        )}
      </div>

      {/* Response Modal */}
      <Modal size="lg" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Add Response
          </ModalHeader>
          <ModalBody>
            <Textarea
              fullWidth
              label="Response"
              labelPlacement="outside"
              radius="sm"
              color="primary"
              variant="bordered"
              placeholder="Enter your response..."
              value={responseMessage}
              minRows={4}
              classNames={{
                mainWrapper: "w-full",
                label: "font-bold",
                inputWrapper:
                  "border-primary-500 data-[hover=true]:border-primary font-bold",
              }}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
            <Button
              radius="sm"
              color="primary"
              variant="solid"
              className="mt-4"
              onPress={handleResponseSubmit}
            >
              Submit Response
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}
