"use client";

import { Key, useEffect, useMemo, useState } from "react";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import {
  Document,
  Promotion,
  useDocumentModel,
  usePromotionModel,
} from "@/providers/models";
import { useAuth } from "@/providers/auth-provider";
import { PromotionAttachment } from "@/providers/models/promotion";
import { Divider } from "../utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { NewDocumentForm } from "./document-form";
import { FiTrash2 } from "react-icons/fi";
import { Select, SelectItem } from "@nextui-org/select";
import { SelectDocumentType } from "../inputs";

export const NewPromotionForm = () => {
  const router = useRouter();

  const { user } = useAuth();
  const { createPromotion } = usePromotionModel();
  const { filterDocuments, getDocument } = useDocumentModel();

  const [formData, setFormData] = useState<Partial<Promotion>>({
    user_id: user?.user_id,
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string>("");
  const [attachments, setAttachments] = useState<
    Partial<PromotionAttachment>[]
  >([]);
  const [selectedDocuments, setSelectedDocuments] = useState<
    Partial<PromotionAttachment>[]
  >([]);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Iterable<Key>>(
    new Set([]),
  );
  const [selectedDocumentNames, setSelectedDocumentNames] =
    useState<string>("");

  // fetch Selected Documents
  useEffect(() => {
    const fetchSelectedDocuments = async () => {
      const selectedDocs = await Promise.all(
        Array.from(selectedDocumentIds).map((id) => getDocument(id as string)),
      );
      const newAttachments = selectedDocs.map((doc) => ({
        document_title: doc?.document_title || "",
        document_type: doc?.document_type || "",
        fileUrl: doc?.fileUrl || "",
        purpose: "",
        awardable_score: "",
      }));
      const titles = selectedDocs.map((doc) => doc?.document_title);
      setSelectedDocuments(newAttachments);
      setSelectedDocumentNames(titles.join(", "));
    };

    if (Array.from(selectedDocumentIds).length > 0) {
      fetchSelectedDocuments();
    } else {
      setSelectedDocuments([]);
      setSelectedDocumentNames("");
    }
  }, [selectedDocumentIds, getDocument]);

  // fetch all User Documents
  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        const documents = await filterDocuments({ uploader_id: user?.user_id });
        setUserDocuments(documents);
      } catch (error) {
        console.error("Error fetching user documents:", error);
      }
    };
    if (user?.user_id) {
      fetchUserDocuments();
    }
  }, [user?.user_id, filterDocuments]);

  const handleAttachmentInputChange = (
    index: number,
    field: keyof PromotionAttachment,
    value: string | number,
  ) => {
    const updatedAttachments = [...attachments];
    updatedAttachments[index][field] = value;
    setAttachments(updatedAttachments);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.current_rank || !formData.desired_rank || !formData.user_id) {
      alert("All fields are required");
      setLoading(false);
      return;
    }

    try {
      // Create the promotion
      await createPromotion({
        ...(formData as Promotion),
        promotion_id:
          `${formData.current_rank}-${formData.desired_rank}@${new Date().toISOString()}`
            .replace(/[\s:]/g, "-")
            .toLowerCase(),
        attachments: selectedDocuments as PromotionAttachment[],
      });

      setFormData({
        user_id: user?.user_id,
        status: "pending",
      });

      router.refresh();
    } catch (error) {
      console.error("Error creating promotion:", error);
      setErrors("Failed to create promotion. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="sticky bottom-0">
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current rank */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-primary">
                Upload You CV / Resume
              </span>
              <NewDocumentForm
                size="md"
                buttonText="Upload You CV / Resume"
                // className="mt-6"
                onSubmit={(ids) =>
                  setSelectedDocumentIds((prev) => new Set([...prev, ...ids]))
                }
              />
            </div>
            <Input
              required
              label="Current rank"
              labelPlacement="outside"
              name="current_rank"
              placeholder="Enter your current rank"
              value={formData.current_rank}
              size="md"
              radius="sm"
              color="primary"
              variant="bordered"
              classNames={{
                inputWrapper:
                  "border-primary-500 data-[hover=true]:border-primary font-bold",
              }}
              onChange={handleInputChange}
            />

            <Input
              required
              label="Desired Rank"
              labelPlacement="outside"
              placeholder="Enter desired rank"
              name="desired_rank"
              value={formData.desired_rank}
              size="md"
              radius="sm"
              color="primary"
              variant="bordered"
              classNames={{
                inputWrapper:
                  "border-primary-500 data-[hover=true]:border-primary font-bold",
              }}
              onChange={handleInputChange}
            />
          </div>

          <Divider
            textContent={"Supporting documents (6 required)"}
            className="pt-8 uppercase pb-4"
          />

          {attachments.map((attachment, index) => (
            <Card
              key={attachment.document_title || index}
              className="border-1 border-primary-100 relative"
            >
              <CardHeader className="gap-4 flex-wrap sm:flex-nowrap pe-14">
                {/* Document Title */}
                <Input
                  required
                  name="document_title"
                  value={attachment.document_title}
                  radius="sm"
                  color="primary"
                  variant="bordered"
                  className="max-w-96"
                  classNames={{
                    inputWrapper:
                      "border-primary-500 data-[hover=true]:border-primary font-bold pe-0 overflow-hidden",
                  }}
                  // onChange={(e) =>
                  //   handleFileNameChange(index, e.target.value)
                  // }
                />

                <SelectDocumentType />

                <Button
                  isIconOnly
                  size="sm"
                  radius="sm"
                  color="danger"
                  variant="solid"
                  className="ms-auto absolute top-3 right-2"
                  // onPress={() => handleFileRemove(index)}
                >
                  <FiTrash2 />
                </Button>
              </CardHeader>
              <CardBody>
                <Textarea
                  label="Purpose and contributions"
                  // placeholder="Enter document purpose"
                  value={attachment.purpose}
                  size="sm"
                  radius="sm"
                  color="primary"
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "border-primary-500 data-[hover=true]:border-primary font-bold",
                  }}
                  onChange={(e) =>
                    handleAttachmentInputChange(
                      index,
                      "purpose",
                      e.target.value,
                    )
                  }
                />
              </CardBody>
            </Card>
          ))}
        </form>
      </CardBody>
      <CardFooter className="border-t-1 border-primary-100 gap-4">
        {errors && <p className="text-red-600">{errors}</p>}

        {/* Upload File */}
        <NewDocumentForm
          multiple
          buttonText="Upload documents"
          size="md"
          onSubmit={(ids) =>
            setSelectedDocumentIds((prev) => new Set([...prev, ...ids]))
          }
        />

        {/* Allow the user to select from existing documents uploaded by him/her from the promotion model */}
        <Dropdown>
          <DropdownTrigger className="">
            <Button
              size="md"
              radius="sm"
              color="primary"
              variant="solid"
              className="capitalize"
            >
              {selectedDocumentNames || "Select from documents"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Target Group Selection"
            variant="flat"
            selectionMode="multiple"
            closeOnSelect={false}
            selectedKeys={selectedDocumentIds as unknown as undefined}
            onSelectionChange={(keys) => setSelectedDocumentIds(new Set(keys))}
          >
            {userDocuments.map((document) => (
              <DropdownItem key={document.document_id}>
                {document.document_title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {/* Submit Button */}
        <Button
          isLoading={loading}
          isDisabled={attachments.length < 6}
          type="submit"
          color="primary"
          radius="sm"
          className="ms-auto"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
};
