import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  getUserByIdAction,
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

interface UserWizardProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tenant?: Tenant;
  userId?: number | null; // Required for edit mode
}

export const UserWizard: React.FC<UserWizardProps> = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  tenant,
  userId: initialUserId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);

  const isPlatformUser = !tenant;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  // Use initialUserId for edit mode, createdUserId for create mode after step 1
  const userId = isEditMode ? initialUserId : createdUserId;

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
      isCreateMode ? createUserWizardSchema : userWizardSchema
    ),
    defaultValues: {
      personal: {
        tenantId: tenant?.id || 1,
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
        officeEmail: "",
        personalEmail: "",
        officialPhone: "",
        personalPhone: "",
        emergencyContactName1: "",
        emergencyContactPhone1: "",
        emergencyContactName2: "",
        emergencyContactPhone2: "",
      },
      job: {
        hiringDate: "",
        joiningDate: "",
        probationPeriodMonths: "",
        designation: "",
        department: "",
        employeeId: "",
        ctc: "",
        reportingManagerId: "",
      },
    },
    mode: "onBlur",
  });

  // Wizard steps configuration
  const wizardSteps = [
    {
      id: 1,
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
      id: 2,
      title: "Contact Information",
      schema: userContactInformationSchema,
      component: (
        <UserContactInformation
          register={register}
          errors={errors}
          showExtendedContacts={true}
        />
      ),
    },
    {
      id: 3,
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
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen && isEditMode && initialUserId) {
        setIsFetching(true);
        try {
          const result = await dispatch(
            getUserByIdAction(initialUserId)
          ).unwrap();

          // Populate form with user data
          reset({
            personal: {
              title: (result.title || "") as
                | ""
                | "Mr"
                | "Mrs"
                | "Ms"
                | undefined,
              firstName: result.firstName,
              lastName: result.lastName,
              middleName: result.middleName || "",
              maidenName: result.maidenName || "",
              gender: (result.gender || "") as
                | ""
                | "Male"
                | "Female"
                | "Other"
                | undefined,
              dob: result.dob || "",
              bloodGroup: (result.bloodGroup || "") as
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
              marriedStatus: (result.marriedStatus || "") as
                | ""
                | "Single"
                | "Married"
                | "Divorced"
                | "Widowed"
                | undefined,
              bio: result.bio || "",
              tenantId: tenant?.id || 1,
            },
            contacts: {
              // Extended contact fields (will be populated from backend)
              officeEmail: result.email || "",
              personalEmail: "",
              officialPhone: result.phone || "",
              personalPhone: "",
              emergencyContactName1: "",
              emergencyContactPhone1: "",
              emergencyContactName2: "",
              emergencyContactPhone2: "",
            },
            job: {
              // Job details (will be populated from backend)
              hiringDate: "",
              joiningDate: "",
              probationPeriodMonths: "",
              designation: "",
              department: "",
              employeeId: "",
              ctc: "",
              reportingManagerId: "",
            },
          });
        } catch (error) {
          console.error("Failed to fetch user:", error);
          toast.error("Failed to load user data");
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, initialUserId, dispatch]);

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
      tenantId: tenant?.id || 1,
    };

    if (isCreateMode) {
      const newUserId = await dispatch(
        createUserPersonalAction(personalData)
      ).unwrap();
      setCreatedUserId(newUserId);
      toast.success("Step 1 Complete", {
        description: "Personal information saved successfully",
      });
    } else if (userId) {
      await dispatch(
        updateUserPersonalAction({ userId, userData: personalData })
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
      officeEmail: formData.contacts.officeEmail,
      personalEmail: formData.contacts.personalEmail,
      officialPhone: formData.contacts.officialPhone,
      personalPhone: formData.contacts.personalPhone,
      emergencyContactName1: formData.contacts.emergencyContactName1,
      emergencyContactPhone1: formData.contacts.emergencyContactPhone1,
      emergencyContactName2: formData.contacts.emergencyContactName2,
      emergencyContactPhone2: formData.contacts.emergencyContactPhone2,
    };

    await dispatch(saveUserContactsAction({ userId, contactData })).unwrap();

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
      employeeId: formData.job.employeeId || undefined,
      ctc: formData.job.ctc ? Number(formData.job.ctc) : undefined,
      reportingManagerId: formData.job.reportingManagerId
        ? Number(formData.job.reportingManagerId)
        : undefined,
    };

    await dispatch(saveUserJobDetailsAction({ userId, jobData })).unwrap();

    toast.success(
      isCreateMode ? "User Created Successfully" : "User Updated Successfully",
      {
        description: isCreateMode
          ? "All details saved. Set password, status, and roles next."
          : "All user details have been updated.",
      }
    );
  };

  const handleNext = async () => {
    // Get validation fields for current step from schema (with nested path)
    const currentStepConfig = wizardSteps[currentStep - 1];
    const stepKey =
      currentStep === 1 ? "personal" : currentStep === 2 ? "contacts" : "job";
    const fieldsToValidate = Object.keys(currentStepConfig.schema.shape).map(
      field => `${stepKey}.${field}`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = await trigger(fieldsToValidate as any);
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Save data based on current step
      if (currentStep === 1) {
        await savePersonalInformation();
      } else if (currentStep === 2) {
        await saveContactInformation();
      } else if (currentStep === 3) {
        await saveJobInformation();
      }

      // Move to next step or complete wizard
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Final step completed - close wizard
        resetForm();
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error(`Failed to save step ${currentStep}:`, error);
      toast.error(
        `Failed to save ${wizardSteps[currentStep - 1].title}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetForm = () => {
    reset();
    setCurrentStep(1);
    setCreatedUserId(null);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getModalTitle = () => {
    if (isCreateMode) {
      return isPlatformUser
        ? "Add New Platform User"
        : `Add New User to ${tenant?.name}`;
    }
    return "Edit User";
  };

  const getLoadingMessage = () => {
    return isCreateMode ? "Creating user..." : "Updating user...";
  };

  const getSubmitButtonText = () => {
    return isCreateMode ? "Create User" : "Update User";
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
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
                  const status = getStepStatus(step.id);
                  return (
                    <React.Fragment key={step.id}>
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
                            step.id
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
                {wizardSteps[currentStep - 1]?.component}
              </div>

              <DrawerFooter className="flex-shrink-0 p-6 pt-4 border-t">
                <div className="flex gap-2">
                  {currentStep > 1 && (
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
                    {currentStep < totalSteps ? (
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
