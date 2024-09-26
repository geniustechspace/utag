"use client";

import { Document } from "@/providers/models";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/badge";
import { Avatar } from "@nextui-org/avatar";
import { FaFilePdf, FaFileWord } from "react-icons/fa";

interface DocumentCardProps {
  document: Document;
  onDownload?: (filePath: string) => void; // Optional download function
  onDelete?: (document_id: string) => void; // Optional delet function
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onDelete,
}) => {
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

  const formattedDate =
    typeof document.upload_date === typeof Date
      ? document.upload_date.toDateString()
      : document.upload_date.toDate().toDateString();

  return (
    <Card radius="sm" className="w-full shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Icon based on document type */}
          <Button isIconOnly radius="sm" variant="bordered">
            {getFileIcon(document.document_type)}
          </Button>
          <div>
            <h4 className="font-bold">{document.document_title}</h4>
            <p className="text-xs text-gray-500">
              Uploaded on {formattedDate}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="py-1">
        <p className="text-sm">
          Uploaded by <span className="font-medium">{document.uploader}</span>
        </p>
      </CardBody>

      <CardFooter className="flex justify-between">
        {/* Download Button */}
        <Button
          color="primary"
          size="sm"
          radius="sm"
          onClick={() => onDownload && onDownload(document.file_path)}
        >
          Download
        </Button>
        <Button
          color="danger"
          variant="ghost"
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
