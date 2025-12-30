/**
 * Helper function to build SQL SET clause from accepted keys and object values
 * @param acceptedKeys - Array of keys that are allowed to be updated
 * @param values - Object containing the values to update
 * @returns SQL SET clause string
 */
export function buildUpdateSetFields({
  acceptedKeys = [],
  values = {},
}: {
  acceptedKeys?: string[];
  values?: Record<string, any>;
} = {}): string {
  const updateFields: Record<string, string> = {};

  // Loop over acceptedKeys to only process allowed fields
  acceptedKeys.forEach(key => {
    const value = values[key];
    // Only process if value exists and is not null
    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        updateFields[key] = `'${value.replace(/'/g, "''")}'`;
      } else if (typeof value === "number") {
        updateFields[key] = `${value}`;
      } else if (typeof value === "boolean") {
        updateFields[key] = `${value}`;
      } else {
        updateFields[key] = "NULL";
      }
    }
  });

  if (Object.keys(updateFields).length > 0) {
    const setQueryString = Object.entries(updateFields)
      .map(([key, value]) => `"${key}" = ${value}`)
      .join(", ");

    return setQueryString;
  }

  return "";
}

/**
 * Helper function to build SQL search conditions from searchText and specific column searches
 * Uses PostgreSQL's ILIKE operator for case-insensitive pattern matching (more efficient than LOWER() + LIKE)
 * @param params - Object containing search parameters
 * @param params.searchText - General search text that will search across all specified columns (case-insensitive)
 * @param params.columnFilterValues - Object with column names as keys and filter values as values. Column names should include table alias if needed (e.g., { "up.\"firstName\"": "John", "ua.\"authEmail\"": "john@example.com" })
 * @param params.searchableColumns - Array of column definitions for general searchText. Also used as whitelist for columnFilterValues. Each item should be { column: "columnName", alias: "tableAlias" } or just "columnName" for direct column reference
 * @returns SQL WHERE condition string (without the "AND" prefix) or empty string if no search conditions
 * @example
 * buildSearchConditions({ searchText: "john", columnFilterValues: { "up.\"firstName\"": "John" }, searchableColumns: [{ column: "firstName", alias: "up" }, { column: "authEmail", alias: "ua" }] })
 * // Returns: "AND (up."firstName" ILIKE '%john%' OR ua."authEmail" ILIKE '%john%') AND up."firstName" ILIKE '%John%'"
 */
export function buildSearchConditions({
  searchText = "",
  columnFilterValues = {},
  searchableColumns = [],
}: {
  searchText?: string;
  columnFilterValues?: Record<string, string>;
  searchableColumns?: Array<{ column: string; alias?: string } | string>;
} = {}): string {
  const conditions: string[] = [];

  /**@description Build general searchText condition across all searchable columns */
  if (
    searchText &&
    searchText.trim().length > 0 &&
    searchableColumns &&
    searchableColumns.length > 0
  ) {
    const pattern = `%${searchText.trim()}%`;
    /**@description Safe SQL literal escaping for ILIKE pattern to avoid injection */
    const patternLiteral = `'${pattern.replace(/'/g, "''")}'`;

    const textConditions = searchableColumns.map(col => {
      if (typeof col === "string") {
        return `${col} ILIKE ${patternLiteral}`;
      } else {
        const columnRef = col.alias
          ? `${col.alias}."${col.column}"`
          : col.column;
        return `${columnRef} ILIKE ${patternLiteral}`;
      }
    });

    if (textConditions.length > 0) {
      conditions.push(`(${textConditions.join(" OR ")})`);
    }
  }

  /**
   * @description Build specific column search conditions
   * @param columnFilterValues - Object with column names as keys and filter values as values. Column names should include table alias if needed (e.g., { "up.\"firstName\"": "John", "ua.\"authEmail\"": "john@example.com" })
   * @param searchableColumns - Array of column definitions for general searchText. Also used as whitelist for columnFilterValues. Each item should be { column: "columnName", alias: "tableAlias" } or just "columnName" for direct column reference
   */
  if (columnFilterValues && searchableColumns && searchableColumns.length > 0) {
    searchableColumns.forEach(col => {
      const column =
        typeof col === "string"
          ? col
          : col.alias
            ? `${col.alias}."${col.column}"`
            : col.column;

      const value = columnFilterValues[column];
      if (value && value.trim().length > 0) {
        const pattern = `%${value.trim()}%`;
        /**@description Safe SQL literal escaping for ILIKE pattern to avoid injection */
        const patternLiteral = `'${pattern.replace(/'/g, "''")}'`;
        /**@description Use column as-is (caller should provide full column reference with table alias) */
        conditions.push(`${column} ILIKE ${patternLiteral}`);
      }
    });
  }

  if (conditions.length === 0) {
    return "";
  }

  return `${conditions.join(" AND ")}`;
}
