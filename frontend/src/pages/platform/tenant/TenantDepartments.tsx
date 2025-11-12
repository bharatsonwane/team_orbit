import { useEffect, useState, Fragment, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Calendar,
  ArrowLeft,
  Edit,
  Plus,
  User,
  MoreVertical,
} from "lucide-react";
import { HeaderLayout } from "@/components/AppLayout";

import {
  selectCurrentTenant,
  selectTenantLoading,
  selectTenantError,
} from "@/redux/slices/tenantSlice";
import type { AppDispatch } from "@/redux/store";
import { UserWizard } from "@/components/UserWizard";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useAuthService } from "@/contexts/AuthContextProvider";
import { getTenantLookupListByTypeIdAction } from "@/redux/actions/tenantLookupActions";
import { selectTenantLookupList } from "@/redux/slices/tenantLookupSlice";
import {
  DepartmentModal,
  //   UpdateDepartmentModal,
} from "./components/UpdateTenantDepartmentModal";

// Modal keys for this page
const modalKeys = {
  USER_WIZARD: "user_wizard",
  UPDATE_PASSWORD: "update_password",
  UPDATE_AUTH_EMAIL: "update_auth_email",
  UPDATE_STATUS_ROLES: "update_status_roles",
  UPDATE_DEPARTMENT: "update_department",
  CREATE_DEPARTMENT: "create_department",
} as const;

type ModalKey = (typeof modalKeys)[keyof typeof modalKeys];
type ModalName = ModalKey | null;

export default function TenantDepartments() {
  const { tenantId } = useAuthService();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector(selectCurrentTenant);
  const lookupTypeList = useSelector(selectTenantLookupList);
  const tenantDepartments = lookupTypeList.find(
    item => item.label === "Department"
  );
  const lookupType = tenantDepartments?.label;
  const departmentId = tenantDepartments?.id;
  const isLoading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);

  // Single modal state management
  const [currentModal, setCurrentModal] = useState<ModalName>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<
    string | undefined
  >(undefined);

  const handleGetTenantDepartments = useCallback(() => {
    if (departmentId) {
      dispatch(getTenantLookupListByTypeIdAction(departmentId));
    }
  }, [dispatch, departmentId]); // ✅ include departmentId, remove tenantId

  useEffect(() => {
    handleGetTenantDepartments();
  }, [handleGetTenantDepartments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get user status badge variant
  const getUserStatusVariant = (statusName: string) => {
    if (statusName === "ACTIVE") return "default";
    if (statusName === "PENDING") return "secondary";
    if (statusName === "DEACTIVATED") return "destructive";
    return "secondary";
  };

  const openModal = (modalName: ModalName, departmentId?: number) => {
    setCurrentModal(modalName);

    if (departmentId !== undefined) {
      setSelectedDepartmentId(departmentId);
      const selectedDept = tenantDepartments?.lookups.find(
        dept => dept.id === departmentId
      );
      setSelectedDepartmentName(selectedDept?.label);
    }
  };

  const closeModal = () => {
    setCurrentModal(null);
    setSelectedDepartmentId(null);
    setSelectedDepartmentName(undefined);
  };

  const handleAddUser = () => {
    openModal(modalKeys.CREATE_DEPARTMENT);
  };

  const handleEditDepartment = (departmentId: number) => {
    openModal(modalKeys.UPDATE_DEPARTMENT, departmentId);
  };

  if (isLoading) {
    return (
      <Fragment>
        <HeaderLayout
          breadcrumbs={[
            { label: "Dashboard", href: "/platform/dashboard" },
            { label: "Tenants", href: "/platform/tenant-list" },
            {
              label: tenant?.label || "Loading...",
              href: `/platform/tenant/${tenantId}`,
            },
            { label: "Users", href: `/platform/tenant/${tenantId}/users` },
            { label: "Loading..." },
          ]}
        />
        <LoadingIndicator message="Loading tenant users..." />
      </Fragment>
    );
  }

  // Show error state
  if (error) {
    return (
      <Fragment>
        <HeaderLayout
          breadcrumbs={[
            { label: "Dashboard", href: "/platform/dashboard" },
            { label: "Tenants", href: "/platform/tenant-list" },
            {
              label: tenant?.label || "Tenant",
              href: `/platform/tenant/${tenantId}`,
            },
            {
              label: "Departments",
              href: `/platform/tenant/${tenantId}/departments`,
            },
            { label: "Error" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Error Loading Departments
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate(`/platform/tenant/${tenantId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenant
            </Button>
          </div>
        </div>
      </Fragment>
    );
  }

  if (!tenant) {
    return (
      <Fragment>
        <HeaderLayout
          breadcrumbs={[
            { label: "Dashboard", href: "/platform/dashboard" },
            { label: "Tenants", href: "/platform/tenant-list" },
            { label: "Not Found" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Tenant Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested tenant could not be found.
            </p>
            <Button onClick={() => navigate("/platform/tenant-list")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenants
            </Button>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <HeaderLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/platform/dashboard" },
          { label: "Tenants", href: "/platform/tenant-list" },
          { label: tenant.label, href: `/platform/tenant/${tenantId}` },
          { label: "Departments" },
        ]}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                {tenant.label} - Departments
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage departments within this organization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tenant Departments ({tenantDepartments?.lookups?.length})
                </CardTitle>
                <CardDescription>
                  Manage departments within this organization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Scrollable table body container */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              <Table className="w-full">
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantDepartments?.lookups.map(department => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{department.label}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{department.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* <Mail className="h-4 w-4 text-muted-foreground" /> */}
                          <span className="text-sm">
                            {department.isSystem === true ? "Yes" : "No"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* <Phone className="h-4 w-4 text-muted-foreground" /> */}
                          <span className="text-sm">
                            {department.description}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(tenantDepartments.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditDepartment(department.id)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Wizard (handles both create and edit modes) */}
      {tenant?.id && currentModal === modalKeys.USER_WIZARD && (
        <UserWizard
          isOpen={true}
          onClose={() => {
            closeModal();
            handleGetTenantDepartments();
          }}
          tenant={tenant}
          userId={selectedDepartmentId || undefined}
          onSuccess={newUserId => {
            if (newUserId) {
              // User was created - update selectedDepartmentId
              setSelectedDepartmentId(newUserId);
            }
          }}
        />
      )}

      <DepartmentModal
        mode="create"
        lookupTypeId={departmentId}
        lookupType={lookupType}
        isOpen={currentModal === modalKeys.CREATE_DEPARTMENT}
        onClose={closeModal}
        departmentId={selectedDepartmentId ?? null}
        departmentName={selectedDepartmentName}
        departmentData={tenantDepartments?.lookups.find(
          dept => dept.id === selectedDepartmentId
        )}
        onSuccess={handleGetTenantDepartments}
      />

      <DepartmentModal
        mode="update"
        lookupTypeId={departmentId}
        lookupType={lookupType}
        isOpen={currentModal === modalKeys.UPDATE_DEPARTMENT}
        onClose={closeModal}
        departmentId={selectedDepartmentId ?? null}
        departmentName={selectedDepartmentName}
        departmentData={tenantDepartments?.lookups.find(
          dept => dept.id === selectedDepartmentId
        )}
        onSuccess={handleGetTenantDepartments}
      />
    </Fragment>
  );
}
