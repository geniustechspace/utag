import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { ChangeEvent } from "react";
import { FiTrash2 } from "react-icons/fi";
import { getFileIcon } from "./utils";
import { SharedSelection } from "@nextui-org/system";

interface SelectDocumentTypeProps {
  selection?: "all" | Iterable<string>;
  onSelectionChange?: (keys: SharedSelection) => void;
}

export const SelectDocumentType = ({ selection, onSelectionChange }: SelectDocumentTypeProps) => {
  const docsType = [
    "Original article",
    "Article review",
    "Book chapter",
    "Book review",
    "Other documents",
  ];

  return (
    <Select
      placeholder="Select type"
      // label="Document type"
      // labelPlacement="outside"
      size="md"
      radius="sm"
      color="primary"
      variant="bordered"
      className="basis-2/5 max-w-40"
      disallowEmptySelection
      selectedKeys={selection}
      classNames={{
        trigger:
          "border-primary-500 data-[hover=true]:border-primary font-semibold text-xs",
        label: "text-sx",
      }}
      onSelectionChange={onSelectionChange}
    >
      {docsType.map((type) => (
        <SelectItem key={type} className="">
          {type}
        </SelectItem>
      ))}
    </Select>
  );
};

interface FilePreviewInputProps {
  value?: string;
  endContentOnPress?: (e: any) => void;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FilePreviewInput = ({
  value,
  onInputChange,
  endContentOnPress,
}: FilePreviewInputProps) => {
  return (
    // <div className="flex flex-col gap-1">
    //   <span className="text-sm font-bold text-primary">
    //     Upload You CV / Resume
    //   </span>
    <Input
      required
      // label="Label"
      // labelPlacement="outside"
      name="document_title"
      value={value}
      radius="sm"
      color="primary"
      variant="bordered"
      classNames={{
        inputWrapper:
          "border-primary-500 data-[hover=true]:border-primary font-bold px-0 overflow-hidden text-xs",
        label: "text-xs text-primary",
      }}
      startContent={
        <Button
          disabled
          isIconOnly
          size="md"
          radius="none"
          color="primary"
          variant="bordered"
          className="border-s-0"
        >
          {getFileIcon((value && value.split(".").pop()) || "")}
        </Button>
      }
      endContent={
        <Button
          isIconOnly
          size="md"
          radius="none"
          color="danger"
          variant="solid"
          onClick={endContentOnPress && endContentOnPress}
        >
          <FiTrash2 />
        </Button>
      }
      onChange={onInputChange}
    />
    // </div>
  );
};
