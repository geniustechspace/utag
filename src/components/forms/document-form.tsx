"use client";

import { ReactNode, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";
import { FiTrash2 } from "react-icons/fi";
import { uploadToStorage } from "@/providers/storage"; // Ensure this handles multiple file uploads
import { useDocumentModel } from "@/providers/models";
import { useAuth } from "@/providers/auth-provider";
import { SelectDocumentType } from "../inputs";

interface FilePreview {
  file: File;
  filename: string;
  error?: string;
  fileUrl?: string;
}

interface NewDocumentFormProps {
  multiple?: boolean;
  buttonText?: string;
  onSubmit?: (documnentIds: string[]) => void;
  size?: "sm" | "md" | "lg";
  startContent?: ReactNode;
  className?: string;
}

export const NewDocumentForm = ({
  buttonText,
  onSubmit,
  className,
  multiple = false,
  size = "sm",
  startContent,
}: NewDocumentFormProps) => {
  const { user } = useAuth();
  const { createDocument } = useDocumentModel();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [filesPreview, setFilesPreview] = useState<FilePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string>("");

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _files = e.target.files;
    if (!_files) return;

    const newFiles = Array.from(_files).map((file) => ({
      file,
      filename: file.name,
    }));

    setFilesPreview((prev) => [...prev, ...newFiles]);
  };

  const handleFileNameChange = (index: number, newName: string) => {
    setFilesPreview((prev) => {
      const updatedFiles = [...prev];
      updatedFiles[index].filename = newName;
      return updatedFiles;
    });
  };

  const handleFileRemove = (index: number) => {
    setFilesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const uploaderId = user?.user_id;

    if (!uploaderId) {
      alert("No user found, Login to upload a file");
      setLoading(false);
      return;
    }

    if (!filesPreview.length) {
      setErrors("No files selected");
      setLoading(false);
      return;
    }

    try {
      // const uploadedUrls = [];
      const uploadedIds = [];

      for (let i = 0; i < filesPreview.length; i++) {
        const { file, filename } = filesPreview[i];

        try {
          const fileUrl = await uploadToStorage(
            file,
            (snapshot) => {
              setProgress(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              );
            },
            (error) => {
              setErrors(error.message);
              setFilesPreview((prev) => {
                const updatedFiles = [...prev];
                updatedFiles[i].error = error.message;
                return updatedFiles;
              });
            },
          );

          // uploadedUrls.push(fileUrl);

          const documentId = `${filename}@${new Date().toISOString()}`
            .replace(/[\s:]/g, "-")
            .toLowerCase();

          await createDocument({
            document_id: documentId,
            uploader_id: uploaderId,
            document_title: filename,
            document_type: "",
            fileUrl: fileUrl,
            upload_date: new Date(),
          });

          uploadedIds.push(documentId);

          setFilesPreview((prev) => {
            const updatedFiles = [...prev];
            updatedFiles[i].fileUrl = fileUrl;
            updatedFiles[i].error = undefined;
            return updatedFiles;
          });
        } catch (error) {
          console.error("Upload failed for file:", error);
        }
      }

      onSubmit && onSubmit(uploadedIds); // Return uploaded file URLs
      // setFormData({ uploader_id: user?.user_id }); // Reset form
      setFilesPreview([]);
      setLoading(false);
      onClose(); // Close modal after submission
    } catch (error) {
      setErrors(String(error));
    }
  };

  return (
    <>
      <Button
        size={size}
        radius="sm"
        color="primary"
        variant="ghost"
        startContent={startContent}
        onPress={onOpen}
        className={className}
      >
        {buttonText ? buttonText : "New Document"}
      </Button>

      <Modal size="5xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-bold text-lg">
                Add Document
              </ModalHeader>
              <ModalBody>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Upload Files */}
                  <Input
                    required
                    multiple={multiple}
                    name="document_files"
                    accept=".pdf,.docx,.doc"
                    type="file"
                    size="lg"
                    radius="sm"
                    color="primary"
                    variant="bordered"
                    classNames={{
                      inputWrapper:
                        "h-16 border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                    onChange={handleFilesChange}
                  />

                  {/* File Previews with Editable File Names */}
                  <div className="mt-2 grid lg:grid-cols-2 items-start gap-3">
                    {filesPreview.map((filePreview, index) => (
                      <div
                        key={index}
                        className="flex flex-nowrap items-center justify-between gap-2"
                      >
                        
                        <SelectDocumentType />

                        {/* Document Title */}
                        <Input
                          required
                          label="Document name"
                          labelPlacement="outside"
                          name="document_title"
                          value={filePreview.filename}
                          radius="sm"
                          color="primary"
                          variant="bordered"
                          classNames={{
                            inputWrapper:
                              "border-primary-500 data-[hover=true]:border-primary font-bold pe-0 overflow-hidden",
                            label: "text-sm text-primary",
                          }}
                          onChange={(e) =>
                            handleFileNameChange(index, e.target.value)
                          }
                          endContent={
                            <Button
                              isIconOnly
                              size="md"
                              radius="none"
                              color="danger"
                              variant="solid"
                              onPress={() => handleFileRemove(index)}
                            >
                              <FiTrash2 />
                            </Button>
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <Button
                    isLoading={loading}
                    type="submit"
                    color="primary"
                    radius="sm"
                    className="w-full"
                  >
                    {loading ? `Saving ....${progress.toFixed(0)}` : "Submit"}
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
