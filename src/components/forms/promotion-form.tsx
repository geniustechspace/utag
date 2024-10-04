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
import { Divider, getFileIcon } from "../utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { NewDocumentForm } from "./document-form";
import { FiTrash2 } from "react-icons/fi";
import { FilePreviewInput, SelectDocumentType } from "../inputs";
import { uploadToStorage } from "@/providers/storage";

export const NewPromotionForm = () => {
  const router = useRouter();

  const { user } = useAuth();
  const { createPromotion } = usePromotionModel();
  const { filterDocuments, getDocument } = useDocumentModel();

  const [formData, setFormData] = useState<Partial<Promotion>>({
    user_id: user?.user_id,
    status: "pending",
  });
  const [cv, setCv] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string>("");
  const [attachments, setAttachments] = useState<
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
    const fetchSelectedAttachments = async () => {
      const selectedDocs = await Promise.all(
        Array.from(selectedDocumentIds).map((id) => getDocument(id as string)),
      );
      const newAttachments = selectedDocs.map((doc) => ({
        document_id: doc?.document_id || "",
        document_title: doc?.document_title || "",
        document_type: doc?.document_type || "",
        fileUrl: doc?.fileUrl || "",
        purpose: doc?.purpose || "",
        awardable_score: "",
      }));
      const titles = selectedDocs.map((doc) => doc?.document_title);
      setAttachments(newAttachments);
      setSelectedDocumentNames(titles.join(", "));
    };

    if (Array.from(selectedDocumentIds).length > 0) {
      fetchSelectedAttachments();
    } else {
      setAttachments([]);
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

  const handleFileNameChange = (index: number, newName: string) => {
    setAttachments((prev) => {
      const updatedFiles = [...prev];
      updatedFiles[index].document_title = newName;
      return updatedFiles;
    });
  };

  const handleSppCountChange = (index: number, newCount: string) => {
    setAttachments((prev) => {
      const updatedFiles = [...prev];
      updatedFiles[index].sppCount = newCount;
      return updatedFiles;
    });
  };

  const handleAttachmentRemove = (document_id: string) => {
    setSelectedDocumentIds((prev) =>
      Array.from(prev).filter((id, _) => id !== document_id),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      setErrors("Login to proceed");
      setLoading(false);
      return;
    }

    formData.user_id = user.user_id;

    if (!cv) {
      alert("CV / Resume required");
      setLoading(false);
      return;
    }

    if (attachments.length < 6) {
      setErrors("At least 6 attachments are required.");
      setLoading(false);
      return;
    }

    if (!formData.current_rank) {
      alert("Current rank required");
      setLoading(false);
      return;
    }

    if (!formData.desired_rank) {
      alert("Desired rank required");
      setLoading(false);
      return;
    }

    try {
      const cvUrl = await uploadToStorage(
        cv,
        (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          setErrors(error.message);
        },
      );

      // Create the promotion
      await createPromotion({
        ...(formData as Promotion),
        cvUrl: cvUrl,
        promotion_id:
          `${formData.current_rank}-${formData.desired_rank}@${new Date().toISOString()}`
            .replace(/[\s:]/g, "-")
            .toLowerCase(),
        attachments: attachments as PromotionAttachment[],
      });

      setFormData({
        user_id: user?.user_id,
        status: "pending",
      });
      setAttachments([]);

      router.back();
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

              {/* Document Title */}
              {cv ? (
                <FilePreviewInput
                  value={cv.name}
                  endContentOnPress={() => setCv(null)}
                />
              ) : (
                <Input
                  required
                  name="document_files"
                  accept=".pdf,.docx,.doc"
                  type="file"
                  size="md"
                  radius="sm"
                  color="primary"
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "border-primary-500 data-[hover=true]:border-primary font-bold",
                  }}
                  onChange={(e) =>
                    setCv((_) => {
                      const _files = e.target.files;
                      if (!_files) return null;
                      return _files[0];
                    })
                  }
                />
              )}
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
                  onChange={(e) => handleFileNameChange(index, e.target.value)}
                />

                <SelectDocumentType
                  selection={[attachment.document_type] as Iterable<string>}
                  onSelectionChange={(selection) =>
                    handleAttachmentInputChange(
                      index,
                      "document_type",
                      selection.currentKey || "",
                    )
                  }
                />

                <Input
                  required
                  name="sppCount"
                  value={attachment.sppCount}
                  radius="sm"
                  color="primary"
                  variant="bordered"
                  className="max-w-32"
                  startContent={
                    <span className="font-semibold text-xs">SPP: </span>
                  }
                  classNames={{
                    inputWrapper:
                      "border-primary-500 data-[hover=true]:border-primary font-bold pe-0 overflow-hidden",
                  }}
                  onChange={(e) => handleSppCountChange(index, e.target.value)}
                />

                <Button
                  isIconOnly
                  size="sm"
                  radius="sm"
                  color="danger"
                  variant="solid"
                  className="ms-auto absolute top-3 right-2"
                  onPress={() =>
                    handleAttachmentRemove(attachment.document_id!)
                  }
                >
                  <FiTrash2 />
                </Button>
              </CardHeader>
              <CardBody className="gap-2">
                <Textarea
                  minRows={1}
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
                <Textarea
                  minRows={1}
                  label="Reference"
                  // placeholder="Enter document purpose"
                  value={attachment.reference}
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
                      "reference",
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
          {loading ? `Saving ${progress - 1}%` : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
};
