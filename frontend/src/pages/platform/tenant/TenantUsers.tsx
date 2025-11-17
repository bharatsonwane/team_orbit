import { useState, Fragment, useEffect, useRef } from "react";
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
  Search,
} from "lucide-react";
import { HeaderLayout } from "@/components/AppLayout";
import {
  getUsersAction,
  getUsersCountAction,
} from "@/redux/actions/userActions";
import {
  selectCurrentTenant,
  selectTenantLoading,
  selectTenantError,
} from "@/redux/slices/tenantSlice";
import type { AppDispatch } from "@/redux/store";
import { UserWizard } from "@/components/UserWizard";
import { UpdateUserPasswordModal } from "./components/UpdateUserPasswordModal";
import { UpdateUserStatusAndRolesModal } from "./components/UpdateUserStatusAndRolesModal";
import { UpdateUserAuthEmailModal } from "./components/UpdateUserAuthEmailModal";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useAuthService } from "@/contexts/AuthContextProvider";
import type { TenantUser, TenantUsersResponse } from "@/schemas/userSchema";

// Modal keys for this page
const modalKeys = {
  USER_WIZARD: "user_wizard",
  UPDATE_PASSWORD: "update_password",
  UPDATE_AUTH_EMAIL: "update_auth_email",
  UPDATE_STATUS_ROLES: "update_status_roles",
} as const;

type ModalKey = (typeof modalKeys)[keyof typeof modalKeys];
type ModalName = ModalKey | null;

export default function TenantUsers() {
  const { tenantId } = useAuthService();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector(selectCurrentTenant);
  const isLoading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  // Single modal state management
  const [currentModal, setCurrentModal] = useState<ModalName>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchText, setSearchText] = useState("");

  // Pagination calculation
  const pagination = {
    page,
    limit,
    totalPages: Math.ceil(totalUsersCount / limit),
  };

  // Debounce timer via ref (no re-renders)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load tenant once when tenantId appears
  useEffect(() => {
    // Initial user load at page 1 with current search
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Fetch helpers use explicit params to avoid stale state
  const fetchUsers = async ({
    pageNum = page,
    searchTextValue = searchText,
  }: { pageNum?: number; searchTextValue?: string } = {}) => {
    try {
      const userList: TenantUsersResponse = await dispatch(
        getUsersAction({
          page: pageNum,
          limit,
          searchText: searchTextValue.trim(), // backend expects 'search'
        })
      ).unwrap();
      setUsers(userList);

      // Fetch total users count for pagination
      // const countResult = await dispatch(
      //   getUsersCountAction({
      //     searchText: searchTextValue.trim(),
      //   })
      // ).unwrap();
      // setTotalUsersCount(countResult.count);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers({ pageNum: 1, searchTextValue: value.trim() });
    }, 600);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers({ pageNum: newPage, searchTextValue: searchText });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserStatusVariant = (statusName: string) => {
    if (statusName === "ACTIVE") return "default";
    if (statusName === "PENDING") return "secondary";
    if (statusName === "DEACTIVATED") return "destructive";
    return "secondary";
  };

  const openModal = (modalName: ModalName, userId?: number) => {
    setCurrentModal(modalName);
    if (userId !== undefined) {
      setSelectedUserId(userId);
      const user = users.find(u => u.id === userId);
      setSelectedUserName(
        user ? `${user.firstName} ${user.lastName}` : undefined
      );
    }
  };

  const closeModal = () => {
    setCurrentModal(null);
    setSelectedUserId(null);
    setSelectedUserName(undefined);
  };

  const handlePasswordUpdated = () => closeModal();
  const handleAuthEmailUpdated = () => {
    fetchUsers();
    closeModal();
  };
  const handleStatusRolesUpdated = () => {
    fetchUsers();
    closeModal();
  };

  if (isLoading && users.length === 0) {
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
            { label: "Users", href: `/platform/tenant/${tenantId}/users` },
            { label: "Error" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Users</h2>
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
          { label: "Users" },
        ]}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                {tenant.label} - Users
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage users within this organization
              </p>
            </div>
          </div>
          <Button onClick={() => openModal(modalKeys.USER_WIZARD)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tenant Users
                </CardTitle>
                <CardDescription>
                  Manage users within this organization
                </CardDescription>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchText}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="border rounded-md pl-9 pr-3 py-1.5 text-sm w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchText.trim()
                            ? "No users found matching your search"
                            : "No users found"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
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
                            <span className="text-sm">{user.phone || "-"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(role => (
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
                          <Badge
                            variant={getUserStatusVariant(user.statusName)}
                          >
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
                                onClick={() =>
                                  openModal(modalKeys.USER_WIZARD, user.id)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  openModal(modalKeys.UPDATE_PASSWORD, user.id)
                                }
                              >
                                <KeyRound className="h-4 w-4 mr-2" />
                                Update Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  openModal(
                                    modalKeys.UPDATE_AUTH_EMAIL,
                                    user.id
                                  )
                                }
                              >
                                <AtSign className="h-4 w-4 mr-2" />
                                Update Login Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  openModal(
                                    modalKeys.UPDATE_STATUS_ROLES,
                                    user.id
                                  )
                                }
                              >
                                <UserCog className="h-4 w-4 mr-2" />
                                Update Status & Roles
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && (
              <div className="flex justify-between items-center p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Wizard (handles both create and edit modes) */}
      {tenant?.id && currentModal === modalKeys.USER_WIZARD && (
        <UserWizard
          isOpen={true}
          onClose={() => {
            closeModal();
            fetchUsers();
          }}
          tenant={tenant}
          userId={selectedUserId}
          onSuccess={newUserId => {
            if (newUserId) {
              setSelectedUserId(newUserId);
            }
          }}
        />
      )}

      {/* Update Password Modal */}
      <UpdateUserPasswordModal
        isOpen={currentModal === modalKeys.UPDATE_PASSWORD}
        onClose={closeModal}
        userId={selectedUserId}
        userName={selectedUserName}
        onPasswordUpdated={handlePasswordUpdated}
      />

      {/* Update Status and Roles Modal */}
      <UpdateUserStatusAndRolesModal
        isOpen={currentModal === modalKeys.UPDATE_STATUS_ROLES}
        onClose={closeModal}
        userId={selectedUserId}
        userName={selectedUserName}
        onUpdated={handleStatusRolesUpdated}
      />

      {/* Update User Auth Email Modal */}
      <UpdateUserAuthEmailModal
        isOpen={currentModal === modalKeys.UPDATE_AUTH_EMAIL}
        onClose={closeModal}
        userId={selectedUserId}
        userName={selectedUserName}
        onEmailUpdated={handleAuthEmailUpdated}
      />
    </Fragment>
  );
}
