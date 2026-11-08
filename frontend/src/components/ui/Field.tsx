import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  petunjuk?: string;
  galat?: string;
}

export function Field({ label, petunjuk, galat, id, ...props }: FieldProps) {
  const idOtomatis = useId();
  const idInput = id ?? idOtomatis;
  const idPetunjuk = `${idInput}-petunjuk`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={idInput} className="block text-sm font-medium text-navy-200">
        {label}
      </label>

      <input
        id={idInput}
        aria-invalid={galat ? true : undefined}
        aria-describedby={petunjuk ? idPetunjuk : undefined}
        className={[
          "pl-input",
          galat ? "border-danger focus:border-danger" : "",
        ].join(" ")}
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
