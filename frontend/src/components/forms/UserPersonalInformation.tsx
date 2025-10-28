import React from "react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  Control,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/input-with-label";
import { DatePicker } from "@/components/ui/date-picker";

interface UserPersonalInformationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}

export const UserPersonalInformation: React.FC<
  UserPersonalInformationProps
> = ({ register, setValue, errors, control }) => {
  // Type-safe error access for nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personalErrors = (errors as any).personal || {};
  // Watch the form value for DOB
  const formDob = useWatch({ control, name: "personal.dob", defaultValue: "" });

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Format date as YYYY-MM-DD in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dobString = `${year}-${month}-${day}`;
      setValue("personal.dob", dobString, { shouldValidate: true });
    } else {
      setValue("personal.dob", "", { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectWithLabel
          id="personal.title"
          label="Title"
          register={register}
          error={personalErrors.title?.message as string}
        >
          <option value="">Select title</option>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Ms">Ms</option>
        </SelectWithLabel>

        <InputWithLabel
          id="personal.firstName"
          label="First Name"
          placeholder="Enter first name"
          required
          register={register}
          error={personalErrors.firstName?.message as string}
        />

        <InputWithLabel
          id="personal.lastName"
          label="Last Name"
          placeholder="Enter last name"
          required
          register={register}
          error={personalErrors.lastName?.message as string}
        />

        <InputWithLabel
          id="personal.middleName"
          label="Middle Name"
          placeholder="Enter middle name"
          register={register}
          error={personalErrors.middleName?.message as string}
        />

        <InputWithLabel
          id="personal.maidenName"
          label="Maiden Name"
          placeholder="Enter maiden name"
          register={register}
          error={personalErrors.maidenName?.message as string}
        />

        <SelectWithLabel
          id="personal.gender"
          label="Gender"
          register={register}
          error={personalErrors.gender?.message as string}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </SelectWithLabel>

        <div>
          <DatePicker
            id="personal.dob"
            label="Date of Birth"
            placeholder="Select date of birth"
            value={formDob}
            onChange={handleDateChange}
            error={personalErrors.dob?.message as string}
          />
          {/* Hidden input to register with react-hook-form */}
          <input type="hidden" {...register("personal.dob")} />
        </div>

        <SelectWithLabel
          id="personal.bloodGroup"
          label="Blood Group"
          register={register}
          error={personalErrors.bloodGroup?.message as string}
        >
          <option value="">Select blood group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </SelectWithLabel>

        <SelectWithLabel
          id="personal.marriedStatus"
          label="Marital Status"
          register={register}
          error={personalErrors.marriedStatus?.message as string}
        >
          <option value="">Select marital status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </SelectWithLabel>

        <InputWithLabel
          id="personal.bio"
          label="Bio"
          variant="textarea"
          placeholder="Enter bio"
          register={register}
          error={personalErrors.bio?.message as string}
        />
      </div>
    </div>
  );
};
