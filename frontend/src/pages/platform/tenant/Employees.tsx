import { useEffect, useState, useCallback, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { AppDispatch } from "@/redux/store";
import { getTenantUsersAction } from "@/redux/actions/userActions";
import type { DetailedUser } from "@/schemas/user";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWizard } from "@/components/UserWizard";
import { useAuthService } from "@/contexts/AuthContextProvider";
import { HeaderLayout } from "@/components/AppLayout";

export default function Employees() {
  const dispatch = useDispatch<AppDispatch>();
  const { tenantId } = useAuthService();

  const [employees, setEmployees] = useState<DetailedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );

  const fetchEmployees = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(getTenantUsersAction(tenantId));
      if (getTenantUsersAction.fulfilled.match(result)) {
        setEmployees(result.payload);
      } else {
        setError("Failed to load employees");
      }
    } catch {
      setError("An error occurred while loading employees");
    } finally {
      setLoading(false);
    }
  }, [dispatch, tenantId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleEditEmployee = (employee: DetailedUser) => {
    setEditingEmployeeId(employee.id);
  };

  const handleEmployeeCreated = () => {
    fetchEmployees();
    setIsAddModalOpen(false);
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
    setEditingEmployeeId(null);
  };

  const getStatusBadge = (statusName: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: "bg-green-500",
      PENDING: "bg-yellow-500",
      DEACTIVATED: "bg-red-500",
      ARCHIVED: "bg-gray-500",
    };

    return (
      <Badge
        className={`${statusColors[statusName] || "bg-gray-500"} text-white`}
      >
        {statusName}
      </Badge>
    );
  };

  if (!tenantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">
              No tenant selected
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Fragment>
      <HeaderLayout
        breadcrumbs={[
          { label: "Employees", href: "/platform/employees" },
          { label: "Employee Directory" },
        ]}
      />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground">
              Manage your organization's employees
            </p>
          </div>
          <Button onClick={handleAddEmployee}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">Loading employees...</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center">
                <p className="text-red-500">{error}</p>
                <Button
                  onClick={fetchEmployees}
                  variant="outline"
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : employees.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground mb-4">
                  No employees found. Add your first employee to get started.
                </p>
                <Button onClick={handleAddEmployee} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Employee
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(employee => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.title && `${employee.title}. `}
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {employee.roles?.map(role => (
                              <Badge key={role.id} variant="secondary">
                                {role.label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(employee.statusName || "UNKNOWN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              disabled
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Employee Wizard */}
        <UserWizard
          mode="create"
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          tenant={{
            id: tenantId,
            name: "Current Tenant",
            label: "Current Tenant",
            statusId: 1,
            isArchived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            archivedAt: null,
          }}
          onSuccess={handleEmployeeCreated}
        />

        {/* Edit Employee Wizard */}
        {editingEmployeeId && (
          <UserWizard
            mode="edit"
            isOpen={!!editingEmployeeId}
            onClose={() => setEditingEmployeeId(null)}
            tenant={{
              id: tenantId,
              name: "Current Tenant",
              label: "Current Tenant",
              statusId: 1,
              isArchived: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              archivedAt: null,
            }}
            userId={editingEmployeeId}
            onSuccess={handleEmployeeUpdated}
          />
        )}
      </div>
    </Fragment>
  );
}
