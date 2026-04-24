import type { ActionVariant } from "../types/site-ui";

export type ButtonVariant = ActionVariant;
export type ButtonState = "default" | "loading" | "disabled";

interface ButtonClassOptions {
  className?: string;
  current?: boolean;
  fullWidth?: boolean;
  state?: ButtonState;
  variant?: ButtonVariant;
}

export function buildButtonClassName({
  className = "",
  current = false,
  fullWidth = false,
  state = "default",
  variant = "primary"
}: ButtonClassOptions) {
  return [
    "button",
    `button--${variant}`,
    fullWidth ? "button--full" : "",
    current ? "is-current" : "",
    state === "loading" ? "is-loading" : "",
    state === "disabled" ? "is-disabled" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");
}
