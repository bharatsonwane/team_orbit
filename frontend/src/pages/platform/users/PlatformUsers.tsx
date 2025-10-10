import { useEffect, useState, useCallback, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Mail, Phone, Edit } from "lucide-react";
import { HeaderLayout } from "@/components/AppLayout";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AddUserModal } from "@/components/AddUserModal";
import { getPlatformUsersAction } from "@/redux/actions/userActions";
import type { AppDispatch } from "@/redux/store";
import type { DetailedUser } from "@/schemas/user";

export default function PlatformUsers() {
  const dispatch = useDispatch<AppDispatch>();

  // Local state management
  const [users, setUsers] = useState<DetailedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Fetch platform users
  const fetchPlatformUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dispatch(getPlatformUsersAction()).unwrap();
      setUsers(result);
    } catch (err: unknown) {
      setError((err as string) || "Failed to load platform users");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Fetch platform users on component mount
  useEffect(() => {
    fetchPlatformUsers();
  }, [fetchPlatformUsers]);

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleUserCreated = () => {
    // Refresh platform users list
    fetchPlatformUsers();
  };

  const handleEditUser = (userId: number) => {
    // Navigate to edit user modal or page
    console.log("Edit user:", userId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Fragment>
        <HeaderLayout
          breadcrumbs={[
            { label: "Dashboard", href: "/platform/dashboard" },
            { label: "Platform Users" },
          ]}
        />
        <LoadingIndicator message="Loading platform users..." />
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
            { label: "Platform Users" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Users</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => {}}>Try Again</Button>
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
          { label: "Platform Users" },
        ]}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Platform Users
            </h1>
            <p className="text-muted-foreground">
              Manage platform administrators and super administrators
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add Platform User
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
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
                {users.length > 0 ? (
                  users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
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
                          {user.roles?.map(role => (
                            <Badge
                              key={role.id}
                              variant={
                                role.name === "PLATFORM_SUPER_ADMIN"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {role.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Platform Users Found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by adding your first platform user.
                      </p>
                      <Button onClick={handleAddUser}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First User
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Platform User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </Fragment>
  );
}
