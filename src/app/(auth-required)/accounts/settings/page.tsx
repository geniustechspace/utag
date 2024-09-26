"use client";

import { useState, useEffect } from "react";
import { User, useUserModel } from "@/providers/models/user-profile";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ElevatedLoading } from "@/components/loading";
import { EditableField } from "@/components/forms/form-inputs";


export default function SettingsPage() {
  const { getUser, updateUser } = useUserModel();
  const { user: currentUser } = useAuth();
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<User | null>(null); // Local user state
  const [isModified, setIsModified] = useState(false); // Track form changes

  // Sync currentUser with the local user state
  useEffect(() => {
    if (currentUser) {
      setUser({ ...currentUser });
    }
  }, [currentUser]);

  const handleEditToggle = (field: string) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldChange = (field: keyof User, value: string) => {
    setUser((prevUser) =>
      prevUser ? { ...prevUser, [field]: value } : prevUser,
    );
    setIsModified(true); // Enable save button on change
  };

  const handleSave = async () => {
    if (user) {
      await updateUser(user.user_id, user);
      alert("User updated successfully");
      setIsModified(false); // Reset save button after successful update
    }
  };

  return user ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Editable fields */}
      <div className="mb-2">
      <EditableField
        label="Name"
        value={user.name}
        onChange={(value) => handleFieldChange("name", value)}
        isEditable={editMode["name"]}
        toggleEdit={() => handleEditToggle("name")}
      /></div>

      {/* Non-editable fields */}
      <Input
        label={<h2 className="font-semibold">Email</h2>}
        labelPlacement="outside"
        value={user.email}
        disabled
        size="md"
        radius="sm"
        classNames={{mainWrapper:"mt-2 "}}
      />

      <Input
        label={<h2 className="font-semibold">Role</h2>}
        labelPlacement="outside"
        value={user.role}
        disabled
        size="md"
        radius="sm"
      />

      <Input
        label={<h2 className="font-semibold">Date Joined</h2>}
        labelPlacement="outside"
        value={user.dateJoined.toDate().toDateString() as unknown as string}
        disabled
        size="md"
        radius="sm"
      />

      {/* More editable fields */}
      <EditableField
        label="Department"
        value={user.department}
        onChange={(value) => handleFieldChange("department", value)}
        isEditable={editMode["department"]}
        toggleEdit={() => handleEditToggle("department")}
      />

      <EditableField
        label="Contact"
        value={user.contact}
        onChange={(value) => handleFieldChange("contact", value)}
        isEditable={editMode["contact"]}
        toggleEdit={() => handleEditToggle("contact")}
      />

      <EditableField
        label="Address"
        value={user.address}
        onChange={(value) => handleFieldChange("address", value)}
        isEditable={editMode["address"]}
        toggleEdit={() => handleEditToggle("address")}
      />

      <EditableField
        label="Institution"
        value={user.institution}
        onChange={(value) => handleFieldChange("institution", value)}
        isEditable={editMode["institution"]}
        toggleEdit={() => handleEditToggle("institution")}
      />

      <Button
        isDisabled={!isModified}
        onClick={handleSave}
        className="col-span-full mt-4"
        color="primary"
        size="md"
      >
        Save Changes
      </Button>
    </div>
  ) : (
    <ElevatedLoading />
  );
}
