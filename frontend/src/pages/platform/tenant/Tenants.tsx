import { useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { HeaderLayout } from "@/components/AppLayout";
import { CreateTenantModal } from "./components/CreateTenantModal";
import { TenantCard } from "./components/TenantCard";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { getTenantsAction } from "@/redux/actions/tenantActions";
import {
  selectTenants,
  selectTenantLoading,
  selectTenantError,
} from "@/redux/slices/tenantSlice";
import type { AppDispatch } from "@/redux/store";

export default function Tenants() {
  const dispatch = useDispatch<AppDispatch>();
  const tenants = useSelector(selectTenants);
  const isLoading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);

  // Fetch tenants on component mount
  useEffect(() => {
    dispatch(getTenantsAction());
  }, [dispatch]);

  const handleTenantCreated = () => {
    dispatch(getTenantsAction());
  };

  // Show loading state
  if (isLoading) {
    return (
      <Fragment>
        <HeaderLayout
          breadcrumbs={[
            { label: "Dashboard", href: "/platform/dashboard" },
            { label: "Tenants" },
            { label: "List" },
          ]}
        />
        <LoadingIndicator message="Loading tenants..." />
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
            { label: "Tenants" },
            { label: "List" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Error Loading Tenants
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => dispatch(getTenantsAction())}>
              Try Again
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
          { label: "Tenants" },
          { label: "List" },
        ]}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground">
              Manage organizations and their administrative users
            </p>
          </div>

          <CreateTenantModal onTenantCreated={handleTenantCreated} />
        </div>

        {/* Tenants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>

        {tenants.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tenants Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first tenant organization.
              </p>
              <CreateTenantModal
                onTenantCreated={handleTenantCreated}
                triggerButton={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Tenant
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Fragment>
  );
}
