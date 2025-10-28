import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Archive, Settings } from "lucide-react";
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import { lookupTypeKeys } from "@/utils/constants";
import { type Tenant } from "@/schemas/tenant";
import type { RootState } from "@/redux/store";

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const navigate = useNavigate();

  // Get tenant statuses from lookup
  const tenantStatuses = useSelector((state: RootState) =>
    selectLookupTypeByName(state, lookupTypeKeys.TENANT_STATUS)
  );

  // Find the status label for this tenant
  const statusLabel =
    tenantStatuses?.lookups?.find(
      (status: { id: number; label: string }) => status.id === tenant.statusId
    )?.label || "Unknown";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isPlatformTenant = tenant.name === "platform";

  const handleView = () => {
    // Navigate to tenant detail page
    navigate(`/platform/tenant/${tenant.id}`);
  };

  return (
    <Card
      key={tenant.id}
      className="relative cursor-pointer"
      onClick={handleView}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPlatformTenant ? (
              <Settings className="h-5 w-5 text-blue-600" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="text-lg">
              {isPlatformTenant ? (
                <span className="flex items-center gap-2">
                  {tenant.label}
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-600"
                  >
                    Platform
                  </Badge>
                </span>
              ) : (
                tenant.label
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusLabel === "Active" ? "default" : "secondary"}>
              {statusLabel}
            </Badge>
            {tenant.isArchived && (
              <Badge variant="secondary">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {tenant.name}
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {tenant.description && (
          <p className="text-sm text-muted-foreground">{tenant.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(tenant.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
