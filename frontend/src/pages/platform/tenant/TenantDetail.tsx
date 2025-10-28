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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, ArrowLeft, Edit, ArrowRight } from "lucide-react";
import { HeaderLayout } from "@/components/AppLayout";
import { getTenantAction } from "@/redux/actions/tenantActions";
import {
  selectCurrentTenant,
  selectTenantLoading,
  selectTenantError,
} from "@/redux/slices/tenantSlice";
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import { lookupTypeKeys } from "@/utils/constants";
import type { AppDispatch, RootState } from "@/redux/store";
import { EditTenantModal } from "./components/EditTenantModal";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

// Modal keys for this page
const modalKeys = {
  EDIT_TENANT: "edit_tenant",
} as const;

type ModalKey = (typeof modalKeys)[keyof typeof modalKeys];
type ModalName = ModalKey | null;

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector(selectCurrentTenant);
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

  // Single modal state management
  const [currentModal, setCurrentModal] = useState<ModalName>(null);

  useEffect(() => {
    if (id) {
      const tenantId = parseInt(id);
      // Fetch tenant details only
      dispatch(getTenantAction(tenantId));
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

  const openModal = (modalName: ModalName) => {
    setCurrentModal(modalName);
  };

  const closeModal = () => {
    setCurrentModal(null);
  };

  const handleEditTenant = () => {
    openModal(modalKeys.EDIT_TENANT);
  };

  const handleTenantUpdated = () => {
    // Refresh tenant data after update
    if (id) {
      dispatch(getTenantAction(parseInt(id)));
    }
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
            <Button
              onClick={() => navigate(`/tenant/${id}/home`)}
              variant="outline"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Tenant View
            </Button>
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
      </div>

      {/* Edit Tenant Modal */}
      <EditTenantModal
        tenant={tenant}
        isOpen={currentModal === modalKeys.EDIT_TENANT}
        onClose={closeModal}
        onTenantUpdated={handleTenantUpdated}
      />
    </Fragment>
  );
}
