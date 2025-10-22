import { useEffect, useState, Fragment } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
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
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import { lookupTypeKeys } from "@/utils/constants";
import type { AppDispatch, RootState } from "@/redux/store";
import { EditTenantModal } from "./components/EditTenantModal";
import { UserWizard } from "@/components/UserWizard";
import { UpdateUserPasswordModal } from "./components/UpdateUserPasswordModal";
import { UpdateUserStatusAndRolesModal } from "./components/UpdateUserStatusAndRolesModal";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector(selectCurrentTenant);
  const users = useSelector(selectTenantUsers);
  const isLoading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);

  // Get tenant statuses from lookup
  const tenantStatuses = useSelector((state: RootState) =>
    selectLookupTypeByName(state, lookupTypeKeys.TENANT_STATUS)
  );

  // Find the status label for this tenant
  const statusLabel = tenant
    ? tenantStatuses?.lookups?.find(
        (status: { id: number; label: string }) => status.id === tenant.statusId
      )?.label || "Unknown"
    : "";

  // Helper function to get user status badge variant
  const getUserStatusVariant = (statusName: string) => {
    if (statusName === "ACTIVE") return "default";
    if (statusName === "PENDING") return "secondary";
    if (statusName === "DEACTIVATED") return "destructive";
    return "secondary";
  };

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // User wizard state (handles both create and edit modes)
  const [isUserWizardOpen, setIsUserWizardOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Update password modal state
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);
  const [updatePasswordUserId, setUpdatePasswordUserId] = useState<
    number | null
  >(null);
  const [updatePasswordUserName, setUpdatePasswordUserName] = useState<
    string | undefined
  >(undefined);

  // Update status and roles modal state
  const [isUpdateStatusAndRolesModalOpen, setIsUpdateStatusAndRolesModalOpen] =
    useState(false);
  const [updateStatusAndRolesUserId, setUpdateStatusAndRolesUserId] = useState<
    number | null
  >(null);
  const [updateStatusAndRolesUserName, setUpdateStatusAndRolesUserName] =
    useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const tenantId = parseInt(id);
      // Fetch tenant details and users
      dispatch(getTenantAction(tenantId));
      handleGetTenantUsers();
    }
  }, [dispatch, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditTenant = () => {
    setIsEditModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUserId(null);
    setIsUserWizardOpen(true);
  };

  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsUserWizardOpen(true);
  };

  const handleResetPassword = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setUpdatePasswordUserId(userId);
    setUpdatePasswordUserName(
      user ? `${user.firstName} ${user.lastName}` : undefined
    );
    setIsUpdatePasswordModalOpen(true);
  };

  const handleUpdateStatusOrRoles = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setUpdateStatusAndRolesUserId(userId);
    setUpdateStatusAndRolesUserName(
      user ? `${user.firstName} ${user.lastName}` : undefined
    );
    setIsUpdateStatusAndRolesModalOpen(true);
  };

  const handleTenantUpdated = () => {
    // Refresh tenant data after update
    if (id) {
      dispatch(getTenantAction(parseInt(id)));
    }
  };

  const handleGetTenantUsers = () => {
    // Refresh user list
    if (id) {
      dispatch(getTenantUsersAction(parseInt(id)));
    }
  };

  const handlePasswordUpdated = () => {
    // Password update doesn't require list refresh, just close modal
    setIsUpdatePasswordModalOpen(false);
  };

  if (isLoading) {
    return (
      <Fragment>
        <HeaderLayout
          breadcrumbs={[
            { label: "Dashboard", href: "/platform/dashboard" },
            { label: "Tenants", href: "/platform/tenant-list" },
            { label: "Loading..." },
          ]}
        />
        <LoadingIndicator message="Loading tenant details..." />
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
            { label: "Error" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Error Loading Tenant
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/platform/tenant-list")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenants
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
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
          { label: "Tenants", href: "/tenant-list" },
          { label: tenant.label },
        ]}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                {tenant.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleEditTenant}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Tenant
            </Button>
          </div>
        </div>

        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>
              Basic information about this organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Organization Name</h4>
                <p className="text-sm text-muted-foreground">{tenant.label}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Tenant ID</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {tenant.name}
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Status</h4>
                <Badge
                  variant={statusLabel === "Active" ? "default" : "secondary"}
                  className="w-fit"
                >
                  {statusLabel}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Archived</h4>
                <Badge
                  variant={tenant.isArchived ? "secondary" : "outline"}
                  className="w-fit"
                >
                  {tenant.isArchived ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(tenant.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(tenant.updatedAt)}
                </p>
              </div>
            </div>
            {tenant.description && (
              <Fragment>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {tenant.description}
                  </p>
                </div>
              </Fragment>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tenant Users ({users.length})
                </CardTitle>
                <CardDescription>
                  Manage users within this organization
                </CardDescription>
              </div>
              <Button onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUserStatusVariant(user.statusName)}>
                        {user.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(user.createdAt)}
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
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Update Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatusOrRoles(user.id)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Update Status & Roles
                          </DropdownMenuItem>
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

      {/* Edit Tenant Modal */}
      <EditTenantModal
        tenant={tenant}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTenantUpdated={handleTenantUpdated}
      />

      {/* User Wizard (handles both create and edit modes) */}
      {tenant?.id && isUserWizardOpen && (
        <UserWizard
          isOpen={isUserWizardOpen}
          onClose={() => {
            setIsUserWizardOpen(false);
            setSelectedUserId(null);
            handleGetTenantUsers();
          }}
          tenant={tenant}
          userId={selectedUserId}
          onSuccess={newUserId => {
            if (newUserId) {
              // User was created - update selectedUserId
              setSelectedUserId(newUserId);
            }
          }}
        />
      )}

      {/* Update Password Modal */}
      <UpdateUserPasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => setIsUpdatePasswordModalOpen(false)}
        userId={updatePasswordUserId}
        userName={updatePasswordUserName}
        onPasswordUpdated={handlePasswordUpdated}
      />

      {/* Update Status and Roles Modal */}
      <UpdateUserStatusAndRolesModal
        isOpen={isUpdateStatusAndRolesModalOpen}
        onClose={() => setIsUpdateStatusAndRolesModalOpen(false)}
        userId={updateStatusAndRolesUserId}
        userName={updateStatusAndRolesUserName}
        onUpdated={handleGetTenantUsers}
      />
    </Fragment>
  );
}
