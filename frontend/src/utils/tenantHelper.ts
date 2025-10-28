/**
 * Extracts tenant ID from the current URL path
 * @returns The tenant ID as string, or empty string if not found
 * @example
 * // URL: http://localhost:5173/tenant/1/home
 * // Returns: "1"
 *
 * // URL: http://localhost:5173/platform/dashboard
 * // Returns: ""
 */
export const getTenantIdFromUrl = (): number | null => {
  const currentPath = window.location.pathname;
  const tenantMatch = currentPath.match(/\/tenant\/(\d+)/);
  return tenantMatch ? parseInt(tenantMatch[1], 10) : null;
};
