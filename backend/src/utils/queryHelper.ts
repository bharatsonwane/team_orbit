/**
 * Helper function to build SQL update fields from accepted keys and object values
 * @param acceptedKeys - Array of keys that are allowed to be updated
 * @param values - Object containing the values to update
 * @returns Object with column names as keys and properly formatted SQL values as values
 */
export function buildUpdateFields(
  acceptedKeys: string[],
  values: Record<string, any>
): Record<string, string> {
  const columnMapping: { [key: string]: string } = {
    firstName: '"firstName"',
    lastName: '"lastName"',
    middleName: '"middleName"',
    maidenName: '"maidenName"',
    bloodGroup: '"bloodGroup"',
    marriedStatus: '"marriedStatus"',
    hashPassword: '"hashPassword"',
    statusId: '"statusId"',
    tenantId: '"tenantId"',
    createdAt: '"createdAt"',
    updatedAt: '"updatedAt"',
  };

  const updateFields: Record<string, string> = {};

  // Filter and process only the accepted keys that have values
  Object.keys(values).forEach(key => {
    if (
      acceptedKeys.includes(key) &&
      values[key] !== undefined &&
      values[key] !== null
    ) {
      const columnName = columnMapping[key] || key;
      const value = values[key];

      if (typeof value === 'string') {
        updateFields[columnName] = `'${value}'`;
      } else if (typeof value === 'number') {
        updateFields[columnName] = `${value}`;
      } else {
        updateFields[columnName] = 'NULL';
      }
    }
  });

  return updateFields;
}