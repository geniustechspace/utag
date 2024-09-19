"use client";

import { FC } from "react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { MdBedtime, MdContrast, MdLightMode } from "react-icons/md";

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
    <div className="flex justify-between" title={title} aria-label={title}>
      {theme === "light" ? (
        <MdBedtime
          size={22}
          className="cursor-pointer"
          onClick={() => setTheme("dark")}
        />
      ) : (
        <MdLightMode
          size={22}
          className="cursor-pointer"
          onClick={() => setTheme("light")}
        />
      )}
    </div>
  );
};
