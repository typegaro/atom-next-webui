import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({ children, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button type={type} className={`icon-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
