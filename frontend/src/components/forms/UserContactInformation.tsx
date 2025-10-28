import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { InputWithLabel } from "@/components/ui/input-with-label";

interface UserContactInformationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  emailRequired?: boolean; // Backward compatibility
  phoneRequired?: boolean; // Backward compatibility
}

export const UserContactInformation: React.FC<UserContactInformationProps> = ({
  register,
  errors,
  emailRequired = true,
  phoneRequired = true,
}) => {
  // Type-safe error access for nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contactErrors = (errors as any).contacts || {};
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel
          id="contacts.personalEmail"
          label="Personal Email"
          type="email"
          placeholder="Enter personal email"
          required={emailRequired}
          register={register}
          error={contactErrors.personalEmail?.message as string}
        />

        <InputWithLabel
          id="contacts.personalPhone"
          label="Personal Mobile"
          placeholder="Enter personal mobile number"
          required={phoneRequired}
          register={register}
          error={contactErrors.personalPhone?.message as string}
        />

        <InputWithLabel
          id="contacts.alternativePhone"
          label="Alternative Contact Number"
          placeholder="Enter alternative contact number"
          register={register}
          error={contactErrors.alternativePhone?.message as string}
        />

        <InputWithLabel
          id="contacts.emergencyPhone1"
          label="Emergency Contact Number 1"
          placeholder="Enter emergency contact number"
          register={register}
          error={contactErrors.emergencyPhone1?.message as string}
        />

        <InputWithLabel
          id="contacts.emergencyPhone2"
          label="Emergency Contact Number 2"
          placeholder="Enter emergency contact number"
          register={register}
          error={contactErrors.emergencyPhone2?.message as string}
        />
      </div>
    </div>
  );
};
