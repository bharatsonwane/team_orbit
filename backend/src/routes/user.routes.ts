import { z } from "zod";
import {
  userLoginSchema,
  baseUserSchema,
  userUpdatePasswordSchema,
  createUserSchema,
  updateUserStatusAndRolesSchema,
  saveUserContactsSchema,
  saveUserJobDetailsSchema,
} from "../schemas/user.schema";
import {
  getUserOASSchema,
  getUserProfileOASSchema,
  updateUserPasswordOASSchema,
} from "../openApiSpecification/oasDoc/user.oas";
import { idValidation } from "../schemas/common.schema";
import {
  getUserById,
  getUserProfile,
  getUsers,
  userLogin,
  updateUserPassword,
  updateUserProfile,
  createUser,
  updateUserStatusAndRoles,
  saveUserContacts,
  saveUserJobDetails,
} from "../controllers/user.controller";
import RouteRegistrar from "../middleware/RouteRegistrar";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware";
import { userRoleKeys } from "../utils/constants";

// Query schema for user list filtering
const getUsersQuerySchema = z.object({
  userType: z.enum(["platform", "tenant"]).optional(),
  roleCategory: z.enum(["PLATFORM", "TENANT"]).optional(),
  tenantId: z.coerce.number().optional(),
  statusId: z.coerce.number().optional(),
});

const registrar = new RouteRegistrar({
  basePath: "/api/user",
  tags: ["User"],
});

// /**@description user login  */
registrar.post("/login", {
  requestSchema: { bodySchema: userLoginSchema },
  responseSchemas: [{ statusCode: 200, schema: baseUserSchema }],
  controller: userLogin,
});

/**@description Create User with Personal Information */
registrar.post("/personal", {
  requestSchema: { bodySchema: createUserSchema },
  responseSchemas: [{ statusCode: 201, schema: z.number() }],
  middleware: [authRoleMiddleware()],
  controller: createUser,
});

/**@description Update user personal information by id  */
registrar.put("/:id/personal", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: baseUserSchema.partial(),
  },
  responseSchemas: [{ statusCode: 200, schema: baseUserSchema }],
  middleware: [authRoleMiddleware()],
  controller: updateUserProfile,
});

/**@description update user password  */
registrar.put("/:id/update-password/", {
  oasSchema: updateUserPasswordOASSchema,
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: userUpdatePasswordSchema,
  },
  middleware: [authRoleMiddleware()],
  controller: updateUserPassword,
});

/**@description update user status and roles  */
registrar.put("/:id/update-status-roles/", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateUserStatusAndRolesSchema,
  },
  middleware: [authRoleMiddleware()],
  controller: updateUserStatusAndRoles,
});

/**@description Save/Update user contact information  */
registrar.post("/:id/contacts", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: saveUserContactsSchema,
  },
  middleware: [authRoleMiddleware()],
  controller: saveUserContacts,
});

/**@description Save/Update user job details  */
registrar.post("/:id/job-details", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: saveUserJobDetailsSchema,
  },
  middleware: [authRoleMiddleware()],
  controller: saveUserJobDetails,
});

// /api/user/profile
registrar.get("/profile", {
  middleware: [authRoleMiddleware()],
  controller: getUserProfile,
  oasSchema: getUserProfileOASSchema,
});

/**@description get all users with optional filtering */
registrar.get("/list", {
  oasSchema: getUserOASSchema,
  requestSchema: { querySchema: getUsersQuerySchema },
  middleware: [authRoleMiddleware()],
  controller: getUsers,
});

/**@description get user by id  */
registrar.get("/:id", {
  requestSchema: { paramsSchema: { id: idValidation } },
  middleware: [authRoleMiddleware()],
  controller: getUserById,
});

// registrar.get("/test-query", {
//   oasSchema: testQueryOASSchema,
//   requestSchema: { querySchema: TestQuerySchema },
//   controller: (req, res) => {
//     res.send("test query");
//   },
// });

export default registrar;
