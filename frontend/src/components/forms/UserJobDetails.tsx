import React, { useState, useEffect } from "react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  Control,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { DatePicker } from "@/components/ui/date-picker";

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

  const [selectedHiringDate, setSelectedHiringDate] =
    useState<string>(formHiringDate);
  const [selectedJoiningDate, setSelectedJoiningDate] =
    useState<string>(formJoiningDate);

  // Update state when form values change (for edit mode or when navigating steps)
  useEffect(() => {
    setSelectedHiringDate(formHiringDate);
  }, [formHiringDate]);

  useEffect(() => {
    setSelectedJoiningDate(formJoiningDate);
  }, [formJoiningDate]);

  const handleHiringDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setValue("job.hiringDate", dateString, { shouldValidate: true });
      setSelectedHiringDate(dateString);
    } else {
      setValue("job.hiringDate", "", { shouldValidate: true });
      setSelectedHiringDate("");
    }
  };

  const handleJoiningDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setValue("job.joiningDate", dateString, { shouldValidate: true });
      setSelectedJoiningDate(dateString);
    } else {
      setValue("job.joiningDate", "", { shouldValidate: true });
      setSelectedJoiningDate("");
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
            value={selectedHiringDate}
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
            value={selectedJoiningDate}
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

        <InputWithLabel
          id="job.designation"
          label="Designation"
          placeholder="Enter designation"
          register={register}
          error={jobErrors.designation?.message as string}
        />

        <InputWithLabel
          id="job.department"
          label="Department"
          placeholder="Enter department"
          register={register}
          error={jobErrors.department?.message as string}
        />

        <InputWithLabel
          id="job.employeeId"
          label="Employee ID"
          placeholder="Enter employee ID"
          register={register}
          error={jobErrors.employeeId?.message as string}
        />

        <InputWithLabel
          id="job.ctc"
          label="CTC (Annual)"
          type="number"
          placeholder="Enter CTC"
          register={register}
          error={jobErrors.ctc?.message as string}
        />

        <InputWithLabel
          id="job.reportingManagerId"
          label="Reporting Manager ID"
          type="number"
          placeholder="Enter reporting manager user ID"
          register={register}
          error={jobErrors.reportingManagerId?.message as string}
        />
      </div>
    </div>
  );
};
