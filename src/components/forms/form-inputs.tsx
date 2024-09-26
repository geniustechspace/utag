import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";

interface EditableFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  isEditable: boolean;
  toggleEdit: () => void;
  placeholder?: string;
}

export const EditableField = ({
  label,
  value,
  onChange,
  isEditable,
  toggleEdit,
  placeholder = "Enter value...",
}: EditableFieldProps) => {
  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{label}</h2>
        <Button size="sm" variant="light" onClick={toggleEdit}>
          {isEditable ? "Cancel" : "Edit"}
        </Button>
      </div>
      <Input
        value={value || ""}
        disabled={!isEditable}
        placeholder={placeholder}
        size="md"
        radius="sm"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
