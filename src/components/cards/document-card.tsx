"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Button } from "@nextui-org/button";
import { FaFilePdf, FaFileWord } from "react-icons/fa";

import { Document, useUserModel } from "@/providers/models";
import { getFormattedDate } from "@/utils";

interface DocumentCardProps {
  document: Document;
  onDownload?: (filePath: string) => void; // Optional download function
  onDelete?: (document_id: string) => void; // Optional delete function
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onDelete,
}) => {
  const { getUser } = useUserModel();
  const [uploader, setUploader] = useState<string>("");

  // Fetch the uploader's details when component mounts
  useEffect(() => {
    const fetchUploader = async () => {
      try {
        const _user = await getUser(document.uploader_id);

        setUploader(_user?.name || "Unknown");
      } catch (error) {
        console.error("Error fetching uploader:", error);
        setUploader("Unknown");
      }
    };

    fetchUploader();
  }, [document.uploader_id, getUser]);

  // Helper function to get the correct file icon based on document type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FaFilePdf className="text-red-500" size={24} />;
      case "docx":
        return <FaFileWord className="text-blue-500" size={24} />;
      default:
        return <FaFileWord size={24} />;
    }
  };

  return (
    <Card radius="sm" className="w-full shadow-lg">
      <CardHeader className="flex items-center justify-between gap-3">
        {/* Icon based on document type */}
        <Button disabled isIconOnly radius="sm" variant="bordered">
          {getFileIcon(document.document_title.split(".").pop() || "")}
        </Button>
        <div className="w-full">
          <h6 className="font-bold text-wrap">{document.document_title}</h6>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Uploaded on {getFormattedDate(document.upload_date)}
            </p>
            <Chip
              size="sm"
              radius="sm"
              color="primary"
              variant="dot"
              className="text-xs text-gray-500"
            >
              {document.document_type}
            </Chip>
          </div>
        </div>
      </CardHeader>

      <CardBody className="py-0">
        <p className="text-sm">
          Uploaded by <span className="font-medium">{uploader}</span>
        </p>
      </CardBody>

      <CardFooter className="flex justify-between">
        {/* Download Button */}
        <Button
          color="primary"
          size="sm"
          radius="sm"
          onClick={() => onDownload && onDownload(document.fileUrl)}
        >
          Download
        </Button>
        <Button
          color="danger"
          variant="solid"
          size="sm"
          radius="sm"
          onClick={() => onDelete && onDelete(document.document_id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
