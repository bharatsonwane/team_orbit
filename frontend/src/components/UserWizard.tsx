import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  UserPersonalInformation,
  UserContactInformation,
  UserJobDetails,
} from "@/components/forms";
import {
  createUserPersonalAction,
  updateUserPersonalAction,
  getUserPersonalDataByIdAction,
  getUserContactsByIdAction,
  getUserJobDetailsAction,
  saveUserContactsAction,
  saveUserJobDetailsAction,
} from "@/redux/actions/userActions";
import type { AppDispatch } from "@/redux/store";
import type { Tenant } from "@/schemas/tenant";
import {
  userWizardSchema,
  createUserWizardSchema,
  userPersonalInformationSchema,
  userContactInformationSchema,
  userJobDetailsSchema,
  type UserWizardFormData,
} from "@/schemas/user";
import { toast } from "sonner";
import { XIcon, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const modeKeys = {
  CREATE: "CREATE",
  EDIT: "EDIT",
};

interface UserWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId?: number) => void; // Callback when user is created or updated, with optional userId
  tenant?: Tenant;
  userId?: number | null; // If provided, wizard is in edit mode; if null/undefined, wizard is in create mode
}

interface WizardStep {
  name: string;
  title: string;
  schema: z.ZodSchema;
  component: React.ReactNode;
}

export const UserWizard: React.FC<UserWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tenant,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStepName, setCurrentStepName] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  // Automatically detect mode based on userId
  const mode = userId ? modeKeys.EDIT : modeKeys.CREATE;

  const isPlatformUser = !tenant;

  const {
    register,
    reset,
    setValue,
    trigger,
    getValues,
    control,
    formState: { errors },
  } = useForm<UserWizardFormData>({
    resolver: zodResolver(
      mode === modeKeys.CREATE ? createUserWizardSchema : userWizardSchema
    ),
    defaultValues: {
      personal: {
        tenantId: tenant?.id,
        dob: "",
        title: "",
        firstName: "",
        lastName: "",
        middleName: "",
        maidenName: "",
        gender: "",
        bloodGroup: "",
        marriedStatus: "",
        bio: "",
      },
      contacts: {
        personalEmail: "",
        personalPhone: "",
        alternativePhone: "",
        emergencyPhone1: "",
        emergencyPhone2: "",
      },
      job: {
        hiringDate: "",
        joiningDate: "",
        probationPeriodMonths: "",
        designation: "",
        department: "",
        userId: "",
        ctc: "",
        reportingManagerId: "",
      },
    },
    mode: "onBlur",
  });

  // Wizard steps configuration
  const wizardSteps: WizardStep[] = [
    {
      name: "personal",
      title: "Personal Information",
      schema: userPersonalInformationSchema,
      component: (
        <UserPersonalInformation
          register={register}
          setValue={setValue}
          errors={errors}
          control={control}
        />
      ),
    },
    {
      name: "contacts",
      title: "Contact Information",
      schema: userContactInformationSchema,
      component: <UserContactInformation register={register} errors={errors} />,
    },
    {
      name: "job",
      title: "Job Details",
      schema: userJobDetailsSchema,
      component: (
        <UserJobDetails
          register={register}
          setValue={setValue}
          errors={errors}
          control={control}
        />
      ),
    },
  ];

  const totalSteps = wizardSteps.length;

  // Fetch user data for edit mode
  const fetchUserData = useCallback(
    async (userId: number) => {
      setIsFetching(true);
      try {
        const [personalData, contactsData, jobData] = await Promise.all([
          dispatch(getUserPersonalDataByIdAction(userId)).unwrap(),
          dispatch(getUserContactsByIdAction(userId)).unwrap(),
          dispatch(getUserJobDetailsAction(userId)).unwrap(),
        ]);

        // Populate form with user data
        reset({
          personal: {
            title: (personalData.title || "") as
              | ""
              | "Mr"
              | "Mrs"
              | "Ms"
              | undefined,
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            middleName: personalData.middleName || "",
            maidenName: personalData.maidenName || "",
            gender: (personalData.gender || "") as
              | ""
              | "Male"
              | "Female"
              | "Other"
              | undefined,
            dob: personalData.dob || "",
            bloodGroup: (personalData.bloodGroup || "") as
              | ""
              | "A+"
              | "A-"
              | "B+"
              | "B-"
              | "AB+"
              | "AB-"
              | "O+"
              | "O-"
              | undefined,
            marriedStatus: (personalData.marriedStatus || "") as
              | ""
              | "Single"
              | "Married"
              | "Divorced"
              | "Widowed"
              | undefined,
            bio: personalData.bio || "",
            tenantId: tenant?.id,
          },
          contacts: {
            // Contact fields populated from backend
            personalEmail: contactsData.personalEmail || "",
            personalPhone: contactsData.personalPhone || "",
            alternativePhone: contactsData.alternativePhone || "",
            emergencyPhone1: contactsData.emergencyPhone1 || "",
            emergencyPhone2: contactsData.emergencyPhone2 || "",
          },
          job: {
            // Job details populated from backend
            hiringDate: jobData?.hiringDate || "",
            joiningDate: jobData?.joiningDate || "",
            probationPeriodMonths: jobData?.probationPeriodMonths || "",
            designation: jobData?.designation || "",
            department: jobData?.department || "",
            ctc: jobData?.ctc || "",
          },
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsFetching(false);
      }
    },
    [dispatch, reset, tenant?.id]
  );

  // Fetch user data for edit mode
  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId, fetchUserData]);

  // Helper function to save personal information (Step 1)
  const savePersonalInformation = async () => {
    const formData = getValues();

    const personalData = {
      title: formData.personal.title,
      firstName: formData.personal.firstName,
      lastName: formData.personal.lastName,
      middleName: formData.personal.middleName,
      maidenName: formData.personal.maidenName,
      gender: (formData.personal.gender === ""
        ? undefined
        : formData.personal.gender) as "Male" | "Female" | "Other" | undefined,
      dob: formData.personal.dob,
      bloodGroup: (formData.personal.bloodGroup === ""
        ? undefined
        : formData.personal.bloodGroup) as
        | "A+"
        | "A-"
        | "B+"
        | "B-"
        | "AB+"
        | "AB-"
        | "O+"
        | "O-"
        | undefined,
      marriedStatus: (formData.personal.marriedStatus === ""
        ? undefined
        : formData.personal.marriedStatus) as
        | "Single"
        | "Married"
        | "Divorced"
        | "Widowed"
        | undefined,
      bio: formData.personal.bio,
      tenantId: tenant?.id || 0,
    };

    if (mode === modeKeys.CREATE) {
      const { id: newUserId } = (await dispatch(
        createUserPersonalAction(personalData)
      ).unwrap()) as { id: number };
      toast.success("Step 1 Complete", {
        description: "Personal information saved successfully",
      });
      fetchUserData(newUserId);
      // Notify parent component with the new user ID and refresh list
      onSuccess?.(newUserId);
    } else if (userId) {
      await dispatch(
        updateUserPersonalAction({
          userId: userId,
          userData: personalData,
        })
      ).unwrap();
      toast.success("Step 1 Complete", {
        description: "Personal information updated successfully",
      });
    }
  };

  // Helper function to save contact information (Step 2)
  const saveContactInformation = async () => {
    if (!userId) {
      toast.error("User ID not found. Please complete Step 1 first.");
      throw new Error("User ID not found");
    }

    const formData = getValues();
    const contactData = {
      personalEmail: formData.contacts.personalEmail,
      personalPhone: formData.contacts.personalPhone,
      alternativePhone: formData.contacts.alternativePhone,
      emergencyPhone1: formData.contacts.emergencyPhone1,
      emergencyPhone2: formData.contacts.emergencyPhone2,
    };

    await dispatch(
      saveUserContactsAction({ userId: userId, contactData })
    ).unwrap();

    toast.success("Step 2 Complete", {
      description: "Contact information saved successfully",
    });
  };

  // Helper function to save job details (Step 3)
  const saveJobInformation = async () => {
    if (!userId) {
      toast.error("User ID not found. Please complete previous steps first.");
      throw new Error("User ID not found");
    }

    const formData = getValues();
    const jobData = {
      hiringDate: formData.job.hiringDate || undefined,
      joiningDate: formData.job.joiningDate || undefined,
      probationPeriodMonths: formData.job.probationPeriodMonths
        ? Number(formData.job.probationPeriodMonths)
        : undefined,
      designation: formData.job.designation || undefined,
      department: formData.job.department || undefined,
      userId: formData.job.userId || undefined,
      ctc: formData.job.ctc ? Number(formData.job.ctc) : undefined,
      reportingManagerId: formData.job.reportingManagerId
        ? Number(formData.job.reportingManagerId)
        : undefined,
    };

    await dispatch(
      saveUserJobDetailsAction({ userId: userId, jobData })
    ).unwrap();

    toast.success(
      mode === modeKeys.CREATE
        ? "User Created Successfully"
        : "User Updated Successfully",
      {
        description:
          mode === modeKeys.CREATE
            ? "All details saved. Set password, status, and roles next."
            : "All user details have been updated.",
      }
    );
  };

  const handleNext = async () => {
    // Get validation fields for current step from schema (with nested path)
    const currentStepConfig = wizardSteps.find(
      step => step.name === currentStepName
    );
    if (!currentStepConfig) return;

    const stepKey = currentStepConfig.name;

    // Define field mappings for each step
    const fieldMappings: Record<string, string[]> = {
      personal: [
        "firstName",
        "lastName",
        "dateOfBirth",
        "gender",
        "maritalStatus",
      ],
      contacts: [
        "personalEmail",
        "personalPhone",
        "alternativePhone",
        "emergencyPhone1",
        "emergencyPhone2",
      ],
      job: ["hiringDate", "designation", "department", "reportingManager"],
    };

    const fieldsToValidate =
      fieldMappings[stepKey]?.map((field: string) => `${stepKey}.${field}`) ||
      [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = await trigger(fieldsToValidate as any);
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Save data based on current step name
      if (currentStepConfig.name === "personal") {
        await savePersonalInformation();
      } else if (currentStepConfig.name === "contacts") {
        await saveContactInformation();
      } else if (currentStepConfig.name === "job") {
        await saveJobInformation();
      }

      // Move to next step or complete wizard
      const currentIndex = wizardSteps.findIndex(
        step => step.name === currentStepName
      );
      if (currentIndex < totalSteps - 1) {
        setCurrentStepName(wizardSteps[currentIndex + 1].name);
      } else {
        // Final step completed - close wizard
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error(`Failed to save step ${currentStepName}:`, error);
      toast.error(
        `Failed to save ${currentStepConfig?.title}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    const currentIndex = wizardSteps.findIndex(
      step => step.name === currentStepName
    );
    if (currentIndex > 0) {
      setCurrentStepName(wizardSteps[currentIndex - 1].name);
    }
  };

  const resetForm = () => {
    reset();
    setCurrentStepName("personal");
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getModalTitle = () => {
    if (mode === modeKeys.CREATE) {
      return isPlatformUser
        ? "Add New Platform User"
        : `Add New User to ${tenant?.name}`;
    }
    return "Edit User";
  };

  const getLoadingMessage = () => {
    return mode === modeKeys.CREATE ? "Creating user..." : "Updating user...";
  };

  const getSubmitButtonText = () => {
    return mode === modeKeys.CREATE ? "Create User" : "Update User";
  };

  const getStepStatus = (stepName: string) => {
    const currentIndex = wizardSteps.findIndex(
      step => step.name === currentStepName
    );
    const stepIndex = wizardSteps.findIndex(step => step.name === stepName);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative border-b">
          <DrawerTitle>{getModalTitle()}</DrawerTitle>
          <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>

        {/* Show loading state only for edit mode while fetching */}
        {isFetching ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <LoadingIndicator message="Loading user data..." />
          </div>
        ) : (
          <>
            {/* Progress Indicator */}
            <div className="flex-shrink-0 px-6 pt-4 pb-2">
              <div className="flex items-center justify-between">
                {wizardSteps.map((step, index) => {
                  const status = getStepStatus(step.name);
                  return (
                    <React.Fragment key={step.name}>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            status === "completed"
                              ? "bg-primary border-primary text-primary-foreground"
                              : status === "current"
                                ? "border-primary text-primary"
                                : "border-muted-foreground text-muted-foreground"
                          }`}
                        >
                          {status === "completed" ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="text-center mt-2">
                          <div
                            className={`text-sm font-medium ${
                              status === "current"
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.title}
                          </div>
                        </div>
                      </div>
                      {index < wizardSteps.length - 1 && (
                        <div
                          className={`h-[2px] w-full flex-1 mx-4 mt-[-45px] transition-colors ${
                            status === "completed"
                              ? "bg-primary"
                              : "bg-muted-foreground"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {isLoading && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">{getLoadingMessage()}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
                {/* Render current step component */}
                {
                  wizardSteps.find(step => step.name === currentStepName)
                    ?.component
                }
              </div>

              <DrawerFooter className="flex-shrink-0 p-6 pt-4 border-t">
                <div className="flex gap-2">
                  {wizardSteps.findIndex(
                    step => step.name === currentStepName
                  ) > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {wizardSteps.findIndex(
                      step => step.name === currentStepName
                    ) <
                    totalSteps - 1 ? (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {getSubmitButtonText()}
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DrawerFooter>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
