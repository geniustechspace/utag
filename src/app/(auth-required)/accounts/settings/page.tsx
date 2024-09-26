"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";

import { User, useUserModel } from "@/providers/models/user-profile";
import { useAuth } from "@/providers/auth-provider";
import { ElevatedLoading } from "@/components/loading";
import { EditableField } from "@/components/forms/form-inputs";

export default function SettingsPage() {
  const { updateUser } = useUserModel();
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
          isEditable={editMode["name"]}
          toggleEdit={() => handleEditToggle("name")}
          onChange={(value) => handleFieldChange("name", value)}
        />
      </div>

      {/* Non-editable fields */}
      <Input
        disabled
        label={<h2 className="font-semibold">Email</h2>}
        labelPlacement="outside"
        value={user.email}
        size="md"
        radius="sm"
        classNames={{ mainWrapper: "mt-2 " }}
      />

      <Input
        disabled
        label={<h2 className="font-semibold">Role</h2>}
        labelPlacement="outside"
        value={user.role}
        size="md"
        radius="sm"
      />

      <Input
        disabled
        label={<h2 className="font-semibold">Date Joined</h2>}
        labelPlacement="outside"
        value={user.dateJoined.toDate().toDateString() as unknown as string}
        size="md"
        radius="sm"
      />

      {/* More editable fields */}
      <EditableField
        label="Department"
        value={user.department}
        isEditable={editMode["department"]}
        toggleEdit={() => handleEditToggle("department")}
        onChange={(value) => handleFieldChange("department", value)}
      />

      <EditableField
        label="Contact"
        value={user.contact}
        isEditable={editMode["contact"]}
        toggleEdit={() => handleEditToggle("contact")}
        onChange={(value) => handleFieldChange("contact", value)}
      />

      <EditableField
        label="Address"
        value={user.address}
        isEditable={editMode["address"]}
        toggleEdit={() => handleEditToggle("address")}
        onChange={(value) => handleFieldChange("address", value)}
      />

      <EditableField
        label="Institution"
        value={user.institution}
        isEditable={editMode["institution"]}
        toggleEdit={() => handleEditToggle("institution")}
        onChange={(value) => handleFieldChange("institution", value)}
      />

      <Button
        isDisabled={!isModified}
        className="col-span-full mt-4"
        color="primary"
        size="md"
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </div>
  ) : (
    <ElevatedLoading />
  );
}
