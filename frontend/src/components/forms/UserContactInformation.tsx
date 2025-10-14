import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { InputWithLabel } from "@/components/ui/input-with-label";

interface UserContactInformationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  showExtendedContacts?: boolean;
  emailRequired?: boolean; // Backward compatibility
  phoneRequired?: boolean; // Backward compatibility
}

export const UserContactInformation: React.FC<UserContactInformationProps> = ({
  register,
  errors,
  showExtendedContacts = false,
  emailRequired = true,
  phoneRequired = false,
}) => {
  // Type-safe error access for nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contactErrors = (errors as any).contacts || {};
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Contact - for simple forms */}
        {!showExtendedContacts && (
          <>
            <InputWithLabel
              id="email"
              label="Email"
              type="email"
              placeholder="Enter email address"
              required={emailRequired}
              register={register}
              error={errors.email?.message as string}
            />

            <InputWithLabel
              id="phone"
              label="Phone"
              placeholder="Enter phone number"
              required={phoneRequired}
              register={register}
              error={errors.phone?.message as string}
            />
          </>
        )}

        {/* Extended Contacts - for wizard flow */}
        {showExtendedContacts && (
          <>
            <InputWithLabel
              id="contacts.officeEmail"
              label="Office Email"
              type="email"
              placeholder="Enter office email"
              required
              register={register}
              error={contactErrors.officeEmail?.message as string}
            />

            <InputWithLabel
              id="contacts.personalEmail"
              label="Personal Email"
              type="email"
              placeholder="Enter personal email"
              register={register}
              error={contactErrors.personalEmail?.message as string}
            />

            <InputWithLabel
              id="contacts.officialPhone"
              label="Official Phone"
              placeholder="Enter official phone number"
              register={register}
              error={contactErrors.officialPhone?.message as string}
            />

            <InputWithLabel
              id="contacts.personalPhone"
              label="Personal Phone"
              placeholder="Enter personal phone number"
              register={register}
              error={contactErrors.personalPhone?.message as string}
            />

            <InputWithLabel
              id="contacts.emergencyContactName1"
              label="Emergency Contact Name 1"
              placeholder="Enter emergency contact name"
              register={register}
              error={contactErrors.emergencyContactName1?.message as string}
            />

            <InputWithLabel
              id="contacts.emergencyContactPhone1"
              label="Emergency Contact Phone 1"
              placeholder="Enter emergency contact phone"
              register={register}
              error={contactErrors.emergencyContactPhone1?.message as string}
            />

            <InputWithLabel
              id="contacts.emergencyContactName2"
              label="Emergency Contact Name 2"
              placeholder="Enter emergency contact name"
              register={register}
              error={contactErrors.emergencyContactName2?.message as string}
            />

            <InputWithLabel
              id="contacts.emergencyContactPhone2"
              label="Emergency Contact Phone 2"
              placeholder="Enter emergency contact phone"
              register={register}
              error={contactErrors.emergencyContactPhone2?.message as string}
            />
          </>
        )}
      </div>
    </div>
  );
};
