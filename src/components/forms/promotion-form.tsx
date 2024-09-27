"use client";

import NextLink from "next/link";
import { Key, useEffect, useMemo, useState } from "react";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  ModalFooter,
} from "@nextui-org/modal";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeftCircle, FiPlus } from "react-icons/fi";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/config/firebase-config";
import { internalUrls } from "@/config/site-config";
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
import { Card, CardBody, CardFooter } from "@nextui-org/card";

export const CreatePromotionForm = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();
  const { createPromotion, getPromotion } = usePromotionModel();
  const { filterDocuments, getDocument } = useDocumentModel();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [formData, setFormData] = useState<Partial<Promotion>>({
    user_id: user?.user_id,
    status: "pending",
  });

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string>("");
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [attachments, setAttachments] = useState<
    Partial<PromotionAttachment>[]
  >([]);
  const [selectedDocuments, setSelectedDocuments] = useState<
    Partial<PromotionAttachment>[]
  >([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Partial<PromotionAttachment>[]
  >([]);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Iterable<Key>>(
    new Set([]),
  );
  const [selectedDocumentNames, setSelectedDocumentNames] =
    useState<string>("");

  // get the last segment of the URL path
  const promotion_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  // fetch Selected Documents
  useEffect(() => {
    const fetchSelectedDocuments = async () => {
      const selectedDocs = await Promise.all(
        Array.from(selectedDocumentIds).map((id) => getDocument(id as string)),
      );

      const newAttachments = selectedDocs.map((doc) => ({
        document_title: doc?.document_title || "",
        document_type: doc?.document_type || "",
        file_path: doc?.file_path || "",
        type: "",
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
  }, [selectedDocumentIds]);

  // fetch all User Documents
  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        // Assuming you have a function to fetch documents by user_id
        const documents = await filterDocuments({ uploader_id: user?.user_id });
        setUserDocuments(documents);
      } catch (error) {
        console.error("Error fetching user documents:", error);
      }
    };

    if (user?.user_id) {
      fetchUserDocuments();
    }
  }, [user?.user_id]);

  // fetch Promotion for details
  useEffect(() => {
    const fetchPromotion = async () => {
      if (!promotion_id) return; // Ensure promotion_id is available
      try {
        const _promotion = await getPromotion(promotion_id);

        setPromotion(_promotion);
      } catch (err) {
        console.error("Error fetching promotion:", err);
      }
    };

    fetchPromotion();
  }, [promotion_id]);

  useMemo(
    () => setAttachments([...selectedDocuments, ...uploadedDocuments]),
    [selectedDocuments, uploadedDocuments],
  );

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        document_title: file.name,
        document_type: file.name.split(".").pop() || "",
        file_path: URL.createObjectURL(file), // Temporary URL for preview
        type: "",
        purpose: "",
        awardable_score: "",
      }));
      setUploadedDocuments(newAttachments);
    }
  };

  const handleAttachmentChange = (
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

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `Promotions/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          setErrors(error.message);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
            resolve(downloadURL),
          );
        },
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.current_rank || !formData.desired_rank || !formData.user_id) {
      alert("All fields are required");
      return;
    }

    if (!file) {
      setErrors("No file selected");

      return;
    }

    try {
      const fileUrl = await uploadFile(file);

      await createPromotion({
        ...(formData as Promotion),
        promotion_id:
          `${formData.current_rank}-${formData.desired_rank}@${new Date().toISOString()}`
            .replace(/[\s:]/g, "-")
            .toLowerCase(),
      });

      onClose(); // Close modal after submission
      setFormData({
        user_id: user?.user_id,
        status: "pending",
      });
      setFile(null); // Reset file input after submission
      router.refresh();
    } catch (error) {
      console.error("Error creating promotion:", error);
      setErrors("Failed to create promotion. Try again.");
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
        {pathname === internalUrls.promotions ? (
          <h6 className="font-bold">Promotions</h6>
        ) : (
          <h6 className="font-bold">
            {promotion?.current_rank} - {promotion?.desired_rank}
          </h6>
        )}
        <Button
          size="sm"
          radius="sm"
          color="primary"
          variant="ghost"
          startContent={<FiPlus />}
          onPress={onOpen}
        >
          New Promotion
        </Button>
      </div>

      <Modal
        size="4xl"
        // placement="bottom"
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>Create Promotion</ModalHeader>
          <ModalBody className="custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current rank */}
              <Input
                required
                label="Current rank"
                name="current_rank"
                placeholder="Enter your current rank"
                value={formData.current_rank}
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
                placeholder="Enter desired rank"
                name="desired_rank"
                value={formData.desired_rank}
                radius="sm"
                color="primary"
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "border-primary-500 data-[hover=true]:border-primary font-bold",
                }}
                onChange={handleInputChange}
              />

              {/* Allow the user to select from existing documents uploaded by him/her from the promotion model */}

              {attachments.map((attachment, index) => (
                <>
                  <Divider
                    textContent={attachment.document_title!}
                    className="pt-4"
                  />
                  <Card className="border-1 border-primary-100">
                    <CardBody>
                      <Textarea
                        label="Purpose"
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
                          handleAttachmentChange(
                            index,
                            "purpose",
                            e.target.value,
                          )
                        }
                      />
                      <div key={index} className="grid grid-cols-3 gap-4">
                        <Input
                          label="Document type"
                          // placeholder="Enter document type)"
                          value={attachment.type}
                          size="sm"
                          radius="sm"
                          color="primary"
                          variant="underlined"
                          classNames={{
                            inputWrapper:
                              "border-primary-500 data-[hover=true]:border-primary font-bold",
                          }}
                          onChange={(e) =>
                            handleAttachmentChange(
                              index,
                              "type",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="Awardable Score"
                          // placeholder="Enter awardable score"
                          value={attachment.awardable_score}
                          size="sm"
                          radius="sm"
                          color="primary"
                          variant="underlined"
                          classNames={{
                            inputWrapper:
                              "border-primary-500 data-[hover=true]:border-primary font-bold",
                          }}
                          onChange={(e) =>
                            handleAttachmentChange(
                              index,
                              "awardable_score",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="Pages"
                          // placeholder="Enter number of pages"
                          value={attachment.pages?.toString()}
                          size="sm"
                          radius="sm"
                          color="primary"
                          variant="underlined"
                          classNames={{
                            inputWrapper:
                              "border-primary-500 data-[hover=true]:border-primary font-bold",
                          }}
                          onChange={(e) =>
                            handleAttachmentChange(
                              index,
                              "pages",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>
                    </CardBody>
                    <CardFooter></CardFooter>
                  </Card>
                </>
              ))}

              <Divider
                textContent={"Upload or select from your uploaded documents"}
                className="pt-4"
              />
              <div className="grid grid-cols-2 gap-2 pb-4">
                {/* Upload File */}
                <Input
                  required
                  name="document_title"
                  accept=".pdf,.docx"
                  type="file"
                  size="lg"
                  radius="sm"
                  color="primary"
                  variant="bordered"
                  className="file"
                  classNames={{
                    // mainWrapper: "mt-6",
                    inputWrapper:
                      "border-primary-500 data-[hover=true]:border-primary font-bold",
                  }}
                  onChange={handleFilesChange}
                />

                {/* Target Group Dropdown */}
                <Dropdown>
                  <DropdownTrigger className="w-full">
                    <Button
                      size="lg"
                      radius="sm"
                      color="primary"
                      variant="bordered"
                      className="capitalize"
                    >
                      {selectedDocumentNames ||
                        "Select from your existing documents"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Target Group Selection"
                    variant="flat"
                    selectionMode="multiple"
                    selectedKeys={selectedDocumentIds as unknown as undefined}
                    onSelectionChange={(keys) =>
                      setSelectedDocumentIds(new Set(keys))
                    }
                  >
                    {userDocuments.map((document) => (
                      <DropdownItem key={document.document_id}>
                        {document.document_title}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              {errors && <p className="text-red-600">{errors}</p>}
              {/* Submit Button */}
              <Button
                isLoading={progress > 0 && progress < 100}
                type="submit"
                color="primary"
                radius="sm"
                className="w-full"
              >
                Submit
              </Button>
            </form>
          </ModalBody>
          <ModalFooter className="py-2"></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
