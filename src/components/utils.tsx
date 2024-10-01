import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

interface DividerProps {
  textContent: string;
  className?: string;
}

export function Divider({ textContent, className }: DividerProps) {
  return (
    <div
      className={twMerge("flex items-center justify-center my-2", className)}
    >
      <div className="border-t border-primary flex-grow mr-3" />
      <span className="text-primary font-normal">{textContent}</span>
      <div className="border-t border-primary flex-grow ml-3" />
    </div>
  );
}

// Helper function to get the correct file icon based on document type
export const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FaFilePdf className="text-red-500" size={24} />;
    case "docx":
      return <FaFileWord className="text-blue-500" size={24} />;
    default:
      return <FaFileWord size={24} />;
  }
};
