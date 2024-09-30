"use client";

import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FiArrowLeftCircle } from "react-icons/fi";

interface PageHeaderProps {
  title: string;
  children: ReactNode;
}

export const PageHeader = ({ children, title }: PageHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex justify-between gap-6 my-6">
      <Button
        size="sm"
        radius="sm"
        color="primary"
        variant="flat"
        startContent={<FiArrowLeftCircle size={18} />}
        className="font-bold"
        onPress={router.back}
      >
        Back
      </Button>
      <h6 className="font-bold">{title}</h6>
      {children}
    </div>
  );
};
