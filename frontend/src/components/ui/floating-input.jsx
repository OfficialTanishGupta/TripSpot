import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

export function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  required,
  icon: Icon,
  accentBorder = "focus:border-violet",
  className,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;
  const floated =
    focused || (value !== undefined && value !== null && value !== "");

  return (
    <div className={cn("relative", className)}>
      {Icon && (
        <Icon
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-soft pointer-events-none"
        />
      )}
      <input
        type={resolvedType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        placeholder=" "
        className={cn(
          "peer w-full rounded-xl border border-line bg-canvas text-ink text-sm outline-none transition-colors",
          Icon ? "pl-10" : "pl-3.5",
          isPassword ? "pr-10" : "pr-3",
          floated ? "pt-5 pb-2" : "py-3.5",
          accentBorder,
        )}
        {...rest}
      />
      <label
        className={cn(
          "absolute pointer-events-none transition-all duration-150",
          Icon ? "left-10" : "left-3.5",
          floated
            ? "top-2 text-[0.68rem] font-semibold"
            : "top-1/2 -translate-y-1/2 text-sm",
          focused ? "text-violet" : floated ? "text-mist" : "text-mist-soft",
        )}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setRevealed((r) => !r)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-soft hover:text-ink"
          aria-label={revealed ? "Hide password" : "Show password"}
        >
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}
