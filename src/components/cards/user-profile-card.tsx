import { User } from "@/providers/models";
import { Avatar } from "@nextui-org/avatar";
import { Card, CardBody } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";

interface UserProfileCardProps {
  user: User;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  return (
    <Card radius="sm" className=" min-w-44 max-w-sm md:basis-2/12">
      <CardBody className="items-center gap-1">
        <Avatar
          src={user.photoURL || "/images/placeholder.png"}
          size="lg"
          className="mb-3"
        />
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm">{user.email}</p>
        {user.contact && (
          <p className="text-sm">Contact: {user.contact}</p>
        )}

        {user.institution && (
          <p className="">Institution: {user.institution}</p>
        )}

        {user.department && <p className="">Department: {user.department}</p>}

        <Chip
          size="md"
          radius="sm"
          color="primary"
          variant="dot"
          className="mt-auto"
        >
          {user.role}
        </Chip>
      </CardBody>
    </Card>
  );
};
