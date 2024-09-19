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
      <div className="border-t border-emerald-400 flex-grow mr-3" />
      <span className="text-emerald-400 font-normal">{textContent}</span>
      <div className="border-t border-emerald-400 flex-grow ml-3" />
    </div>
  );
}
