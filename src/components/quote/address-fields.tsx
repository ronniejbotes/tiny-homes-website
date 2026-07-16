import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  FieldError,
  RequiredMark,
  TextField,
  inputClasses,
  labelClasses,
} from "./fields";
import type { AddressField, AddressValues } from "./quote-form";

/** The nine South African provinces, in the official order. */
export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

export function AddressFields({
  values,
  errors,
  onChange,
  onBlur,
}: {
  values: AddressValues;
  errors: Partial<Record<AddressField, string | null>>;
  onChange: (field: AddressField, value: string) => void;
  onBlur: (field: AddressField) => void;
}) {
  return (
    <div className="space-y-5">
      <TextField
        id="quote-street"
        label="Street address"
        value={values.street}
        onValueChange={(v) => onChange("street", v)}
        onBlur={() => onBlur("street")}
        error={errors.street}
        required
        autoComplete="address-line1"
        placeholder="12 Acacia Road"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="quote-suburb"
          label="Suburb"
          value={values.suburb}
          onValueChange={(v) => onChange("suburb", v)}
          onBlur={() => onBlur("suburb")}
          error={errors.suburb}
          required
          autoComplete="address-line2"
          placeholder="Raslouw"
        />
        <TextField
          id="quote-city"
          label="City / town"
          value={values.city}
          onValueChange={(v) => onChange("city", v)}
          onBlur={() => onBlur("city")}
          error={errors.city}
          required
          autoComplete="address-level2"
          placeholder="Centurion"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-province" className={labelClasses}>
            Province
            <RequiredMark />
          </label>
          <div className="relative">
            <select
              id="quote-province"
              name="quote-province"
              required
              value={values.province}
              onChange={(e) => onChange("province", e.target.value)}
              onBlur={() => onBlur("province")}
              aria-invalid={errors.province ? true : undefined}
              aria-describedby={errors.province ? "quote-province-error" : undefined}
              className={cn(
                inputClasses,
                "appearance-none pr-12",
                !values.province && "text-stone",
                errors.province && "border-clay-dark",
              )}
            >
              <option value="" disabled>
                Select a province
              </option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
              aria-hidden="true"
            />
          </div>
          <FieldError id="quote-province-error" message={errors.province} />
        </div>

        <TextField
          id="quote-postal"
          label="Postal code"
          value={values.postal}
          onValueChange={(v) => onChange("postal", v)}
          onBlur={() => onBlur("postal")}
          error={errors.postal}
          required
          inputMode="numeric"
          maxLength={4}
          autoComplete="postal-code"
          placeholder="0157"
        />
      </div>

      <p className="text-sm leading-relaxed text-stone">
        We use your delivery address to calculate an accurate delivery and shipping quote to the
        site — nationwide.
      </p>
    </div>
  );
}
