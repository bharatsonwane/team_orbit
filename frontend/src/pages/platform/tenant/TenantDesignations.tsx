import { useEffect, useState, Fragment, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
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
  Mail,
  Phone,
  User,
  MoreVertical,
  KeyRound,
  UserCog,
  AtSign,
} from "lucide-react";
import { HeaderLayout } from "@/components/AppLayout";
import { getTenantAction } from "@/redux/actions/tenantActions";
import { getTenantUsersAction } from "@/redux/actions/userActions";
import {
  selectCurrentTenant,
  selectTenantUsers,
  selectTenantLoading,
  selectTenantError,
} from "@/redux/slices/tenantSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { UserWizard } from "@/components/UserWizard";
import { UpdateUserPasswordModal } from "./components/UpdateUserPasswordModal";
import { UpdateUserStatusAndRolesModal } from "./components/UpdateUserStatusAndRolesModal";
import { UpdateUserAuthEmailModal } from "./components/UpdateUserAuthEmailModal";
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
  UPDATE_DESIGNATION: "update_designation",
  CREATE_DESIGNATION: "create_designation",
} as const;

type ModalKey = (typeof modalKeys)[keyof typeof modalKeys];
type ModalName = ModalKey | null;

export default function TenantDesignations() {
  const { tenantId } = useAuthService();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector(selectCurrentTenant);
  const lookupTypeList = useSelector(selectTenantLookupList);
  const tenantDesignations = lookupTypeList.find(
    item => item.label === "Designation"
  );
  console.log(tenantDesignations, "tenantDesignations");
  const designationId = tenantDesignations?.id;
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
    // Refresh department list
    if (tenantId) {
      dispatch(getTenantLookupListByTypeIdAction(tenantId));
    }
  }, [dispatch, tenantId]);

  useEffect(() => {
    if (tenantId) {
      // Fetch tenant details and departments
      dispatch(getTenantLookupListByTypeIdAction(tenantId));
      handleGetTenantDepartments();
    }
  }, [dispatch, tenantId, handleGetTenantDepartments]);

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
      const selectedDept = tenantDesignations?.lookups.find(
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
    openModal(modalKeys.CREATE_DESIGNATION);
  };

  const handleEditDepartment = (departmentId: number) => {
    openModal(modalKeys.UPDATE_DESIGNATION, departmentId);
  };

  const handleResetPassword = (departmentId: number) => {
    openModal(modalKeys.UPDATE_PASSWORD, departmentId);
  };

  const handleUpdateStatusOrRoles = (departmentId: number) => {
    openModal(modalKeys.UPDATE_STATUS_ROLES, departmentId);
  };

  const handleUpdateAuthEmail = (departmentId: number) => {
    openModal(modalKeys.UPDATE_AUTH_EMAIL, departmentId);
  };

  const handlePasswordUpdated = () => {
    // Password update doesn't require list refresh, just close modal
    closeModal();
  };

  const handleAuthEmailUpdated = () => {
    // Refresh user list to show updated auth email
    handleGetTenantDepartments();
    closeModal();
  };

  const handleStatusRolesUpdated = () => {
    handleGetTenantDepartments();
    closeModal();
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
              label: "Designations",
              href: `/platform/tenant/${tenantId}/designations`,
            },
            { label: "Error" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Error Loading Designations
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
          { label: "Designations" },
        ]}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                {tenant.label} - Designations
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage designations within this organization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
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
                  Tenant Designations ({tenantDesignations?.lookups?.length})
                </CardTitle>
                <CardDescription>
                  Manage designations within this organization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Description</TableHead>
                  {/* <TableHead>Phone</TableHead> */}
                  {/* <TableHead>Role</TableHead> */}
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantDesignations?.lookups.map(designation => (
                  <TableRow key={designation.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{designation.label}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* <Mail className="h-4 w-4 text-muted-foreground" /> */}
                        <span className="text-sm">
                          {designation.isSystem === true ? "Yes" : "No"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* <Phone className="h-4 w-4 text-muted-foreground" /> */}
                        <span className="text-sm">
                          {designation.description}
                        </span>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.userRoles.map(role => (
                          <Badge
                            key={role.id}
                            variant={
                              role.name === "TENANT_ADMIN"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {role.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell> */}
                    {/* <TableCell>
                      <Badge variant={getUserStatusVariant(user.statusName)}>
                        {user.statusLabel}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(tenantDesignations.createdAt)}
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
                            onClick={() => handleEditDepartment(designation.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Designation
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => handleResetPassword(department.id)}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Update Password
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem
                            onClick={() => handleUpdateAuthEmail(department.id)}
                          >
                            <AtSign className="h-4 w-4 mr-2" />
                            Update Login Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatusOrRoles(department.id)
                            }
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Update Status & Roles
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* Update Password Modal */}
      <UpdateUserPasswordModal
        isOpen={currentModal === modalKeys.UPDATE_PASSWORD}
        onClose={closeModal}
        userId={designationId || null}
        userName={selectedDepartmentName}
        onPasswordUpdated={handlePasswordUpdated}
      />

      {/* Update Status and Roles Modal */}
      <UpdateUserStatusAndRolesModal
        isOpen={currentModal === modalKeys.UPDATE_STATUS_ROLES}
        onClose={closeModal}
        userId={designationId || null}
        userName={selectedDepartmentName}
        onUpdated={handleStatusRolesUpdated}
      />

      {/* Update User Auth Email Modal */}
      <UpdateUserAuthEmailModal
        isOpen={currentModal === modalKeys.UPDATE_AUTH_EMAIL}
        onClose={closeModal}
        userId={designationId || null}
        userName={selectedDepartmentName}
        onEmailUpdated={handleAuthEmailUpdated}
      />

      <DepartmentModal
        mode="create"
        typeId={designationId}
        isOpen={currentModal === modalKeys.CREATE_DESIGNATION}
        onClose={closeModal}
        departmentId={selectedDepartmentId ?? null}
        departmentName={selectedDepartmentName}
        departmentData={tenantDesignations?.lookups.find(
          dept => dept.id === selectedDepartmentId
        )}
        onSuccess={handleGetTenantDepartments}
      />

      <DepartmentModal
        mode="update"
        typeId={designationId}
        isOpen={currentModal === modalKeys.UPDATE_DESIGNATION}
        onClose={closeModal}
        departmentId={selectedDepartmentId ?? null}
        departmentName={selectedDepartmentName}
        departmentData={tenantDesignations?.lookups.find(
          dept => dept.id === selectedDepartmentId
        )}
        onSuccess={handleGetTenantDepartments}
      />
    </Fragment>
  );
}
