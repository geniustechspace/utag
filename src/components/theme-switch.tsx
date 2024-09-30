"use client";

import { FC } from "react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { MdBedtime, MdContrast, MdLightMode } from "react-icons/md";
import { Button } from "@nextui-org/button";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = () => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  return (
    <div
      className="flex justify-between"
      aria-label={`Switch to ${theme === "light" || isSSR ? "dark" : "light"} mode`}
    >
      <h3 className="font-semibold font-mono">Theme: </h3>
      <MdLightMode
        size={18}
        color={theme === "light" ? "#3b82f6" : undefined}
        className="cursor-pointer"
        onClick={() => setTheme("light")}
      />
      <MdContrast
        size={18}
        color={theme === "system" ? "#3b82f6" : undefined}
        className="cursor-pointer"
        onClick={() => setTheme("system")}
      />
      <MdBedtime
        size={18}
        color={theme === "dark" ? "#3b82f6" : undefined}
        className="cursor-pointer"
        onClick={() => setTheme("dark")}
      />
    </div>
  );
};

export const SingleThemeSwitch: FC<ThemeSwitchProps> = () => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const title = `Switch to ${theme === "light" || isSSR ? "dark" : "light"} mode`;

  return (
    <Button
      isIconOnly
      title={title}
      aria-label={title}
      size="sm"
      radius="full"
      variant="ghost"
      className="mx-3"
      onClick={() => theme === "light" ? setTheme("dark"): setTheme("light")}
    >
      {theme === "light" ? (
        <MdBedtime
          size={20}
          className="cursor-pointer"
        />
      ) : (
        <MdLightMode
          size={20}
          className="cursor-pointer"
        />
      )}
    </Button>
  );
};
