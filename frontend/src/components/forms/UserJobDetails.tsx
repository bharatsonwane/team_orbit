import React from "react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  Control,
} from "react-hook-form";
import { useSelector } from "react-redux";
import { useWatch } from "react-hook-form";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/input-with-label";
import { DatePicker } from "@/components/ui/date-picker";
import { tenantLookupTypeKeys } from "@/utils/constants";
import { selectTenantLookupTypeByName } from "@/redux/slices/tenantLookupSlice";
import type { RootState } from "@/redux/store";

interface UserJobDetailsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}

export const UserJobDetails: React.FC<UserJobDetailsProps> = ({
  register,
  setValue,
  errors,
  control,
}) => {
  // Type-safe error access for nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobErrors = (errors as any).job || {};
  // Watch the form values for dates
  const formHiringDate = useWatch({
    control,
    name: "job.hiringDate",
    defaultValue: "",
  });
  const formJoiningDate = useWatch({
    control,
    name: "job.joiningDate",
    defaultValue: "",
  });

  // Get designation and department lookup data
  const userDesignations = useSelector((state: RootState) =>
    selectTenantLookupTypeByName(state, tenantLookupTypeKeys.DESIGNATION)
  );

  const userDepartments = useSelector((state: RootState) =>
    selectTenantLookupTypeByName(state, tenantLookupTypeKeys.DEPARTMENT)
  );

  const handleHiringDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setValue("job.hiringDate", dateString, { shouldValidate: true });
    } else {
      setValue("job.hiringDate", "", { shouldValidate: true });
    }
  };

  const handleJoiningDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setValue("job.joiningDate", dateString, { shouldValidate: true });
    } else {
      setValue("job.joiningDate", "", { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Job Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <DatePicker
            id="job.hiringDate"
            label="Hiring Date"
            placeholder="Select hiring date"
            value={formHiringDate}
            onChange={handleHiringDateChange}
            error={jobErrors.hiringDate?.message as string}
          />
          <input type="hidden" {...register("job.hiringDate")} />
        </div>

        <div>
          <DatePicker
            id="job.joiningDate"
            label="Joining Date"
            placeholder="Select joining date"
            value={formJoiningDate}
            onChange={handleJoiningDateChange}
            error={jobErrors.joiningDate?.message as string}
          />
          <input type="hidden" {...register("job.joiningDate")} />
        </div>

        <InputWithLabel
          id="job.probationPeriodMonths"
          label="Probation Period (Months)"
          type="number"
          placeholder="Enter probation period in months"
          register={register}
          error={jobErrors.probationPeriodMonths?.message as string}
        />

        {/* Designation Dropdown */}
        <SelectWithLabel
          id="job.designation"
          label="Designation"
          register={register}
          error={jobErrors.designation?.message as string}
        >
          <option value="">Select designation</option>
          {userDesignations?.lookups?.map(designation => (
            <option key={designation.id} value={designation.name}>
              {designation.label}
            </option>
          ))}
        </SelectWithLabel>

        {/* Department Dropdown */}
        <SelectWithLabel
          id="job.department"
          label="Department"
          register={register}
          error={jobErrors.department?.message as string}
        >
          <option value="">Select department</option>
          {userDepartments?.lookups?.map(department => (
            <option key={department.id} value={department.name}>
              {department.label}
            </option>
          ))}
        </SelectWithLabel>

        <InputWithLabel
          id="job.ctc"
          label="CTC (Annual)"
          type="number"
          placeholder="Enter CTC"
          register={register}
          error={jobErrors.ctc?.message as string}
        />
      </div>
    </div>
  );
};
