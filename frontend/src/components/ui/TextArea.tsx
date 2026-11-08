import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  petunjuk?: string;
  galat?: string;
}

export function TextArea({ label, petunjuk, galat, id, ...props }: TextAreaProps) {
  const idOtomatis = useId();
  const idInput = id ?? idOtomatis;
  const idPetunjuk = `${idInput}-petunjuk`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={idInput} className="block text-sm font-medium text-navy-200">
        {label}
      </label>

      <textarea
        id={idInput}
        aria-invalid={galat ? true : undefined}
        aria-describedby={petunjuk ? idPetunjuk : undefined}
        className={["pl-input", galat ? "border-danger focus:border-danger" : ""].join(" ")}
        {...props}
      />

      {petunjuk && !galat ? (
        <p id={idPetunjuk} className="text-xs text-navy-400">
          {petunjuk}
        </p>
      ) : null}

      {galat ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {galat}
        </p>
      ) : null}
    </div>
  );
}
