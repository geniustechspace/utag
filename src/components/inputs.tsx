import { Select, SelectItem } from "@nextui-org/select";

export const SelectDocumentType = () => {

  const docsType = ["Article", "Book", "Review", "Others"]

  return (
    <Select
      placeholder="Select type"
      label="Document type"
      labelPlacement="outside"
      size="md"
      radius="sm"
      color="primary"
      variant="bordered"
      className="basis-2/5 max-w-40"
      disallowEmptySelection
      multiple={true}
      classNames={{
        trigger:
          "border-primary-500 data-[hover=true]:border-primary font-semibold text-xs",
        label: "text-sm",
      }}
    >
      {docsType.map((type) => (
        <SelectItem key={type} className="">
          {type}
        </SelectItem>
      ))}
    </Select>
  );
};
