import { Button } from "@nextui-org/button";
import NextLink from "next/link";

export const Sidebar = ({
  items,
}: {
  items: { label: string; href: string }[];
}) => {
  if (!items || items.length < 1) return null;

  return (
    <aside className="hidden md:inline w-64 h-fit sticky sticky-top top-[4.1rem] border-r border-default">
      <div className="mx-3 mt-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <Button
            key={`${item}-${index}`}
            as={NextLink}
            href={item.href}
            radius="sm"
            color="primary"
            variant="light"
            className="font-semibold justify-start"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </aside>
  );
};
