"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FiArrowLeftCircle, FiPlus } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";

import { Document, useDocumentModel } from "@/providers/models";
import { useAuth } from "@/providers/auth-provider";
import { storage } from "@/config/firebase-config";
import { internalUrls } from "@/config/site-config";

export const CreateDocumentForm = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();
  const { createDocument } = useDocumentModel(); // from your DocumentProvider
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [formData, setFormData] = useState<Partial<Document>>({
    uploader_id: user?.user_id,
  });
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string>("");
  const { getDocument } = useDocumentModel();

  const [document, setDocument] = useState<Document | null>(null);

  // Correct way to get the last segment of the URL path
  const document_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!document_id) return; // Ensure document_id is available
      try {
        const _document = await getDocument(document_id);

        setDocument(_document);
      } catch (err) {
        console.error("Error fetching document:", err);
      }
    };

    fetchDocument();
  }, [document_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _files = e.target.files;

    if (_files && _files[0]) {
      const fileName = _files[0].name;
      const fileType = fileName.split(".").pop() || ""; // Get file extension

      setFile(_files[0]);
      setFormData((prev) => ({
        ...prev,
        document_title: fileName,
        document_type: fileType,
      }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `Documemts/${file.name}`);
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
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.document_title ||
      !formData.document_type ||
      !formData.uploader_id
    ) {
      alert("All fields are required");

      return;
    }
    // return

    if (!file) {
      setErrors("No file selected");

      return;
    }

    try {
      const fileUrl = await uploadImage(file);

      await createDocument({
        ...(formData as Document),
        document_id: `${formData.document_title}@${new Date().toISOString()}`
          .replace(/[\s:]/g, "-")
          .toLowerCase(),
        file_path: fileUrl,
        upload_date: new Date(),
      });
      // alert("Document added successfully!");
      onClose(); // Close modal after submission
      setFormData({}); // Reset form
      router.refresh();
    } catch (error) {
      console.error("Error creating document:", error);
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
        {pathname === internalUrls.documents ? (
          <h6 className="font-bold">Documents</h6>
        ) : (
          <h6 className="font-bold">{document?.document_title}</h6>
        )}
        <Button
          size="sm"
          radius="sm"
          color="primary"
          variant="ghost"
          startContent={<FiPlus />}
          onPress={onOpen}
        >
          New Document
        </Button>
      </div>

      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-bold text-lg">
                Add Document
              </ModalHeader>
              <ModalBody>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Document Title */}
                  <Input
                    required
                    label="Document Title"
                    name="document_title"
                    placeholder="Enter document title"
                    value={formData.document_title}
                    radius="sm"
                    color="primary"
                    variant="underlined"
                    classNames={{
                      inputWrapper:
                        "border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                    onChange={handleInputChange}
                  />

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
                      mainWrapper: "mt-6",
                      inputWrapper:
                        "h-32 border-primary-500 data-[hover=true]:border-primary font-bold",
                    }}
                    onChange={handleFileChange}
                  />

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
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
