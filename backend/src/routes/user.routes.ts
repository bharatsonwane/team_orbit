import { z } from "zod";
import {
  userLoginSchema,
  baseUserSchema,
  userUpdatePasswordSchema,
  createUserSchema,
  updateUserStatusAndRolesSchema,
  saveUserContactsSchema,
  saveUserJobDetailsSchema,
  updateUserAuthEmailSchema,
  getUsersCountQuerySchema,
  getUsersCountResponseSchema,
} from "@src/schemaTypes/user.schemaTypes";
import {
  getUserOASSchema,
  getUserProfileOASSchema,
  getUsersQuerySchema,
  updateUserPasswordOASSchema,
} from "@src/openApiSpecification/oasDoc/user.oas";
import { idValidation } from "@src/schemaTypes/common.schemaTypes";
import {
  getUserById,
  getUserProfile,
  getUserContacts,
  getUsers,
  getUsersCount,
  userLogin,
  getUserAuthEmail,
  updateUserAuthEmail,
  updateUserPassword,
  updateUserProfile,
  createUser,
  updateUserStatusAndRoles,
  saveUserContacts,
  saveUserJobDetails,
  getUserJobDetails,
} from "@src/controllers/user.controller";
import RouteRegistrar from "@src/middleware/RouteRegistrar";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { userRoleKeys } from "@src/utils/constants";
import { ensureTenantMiddleware } from "@src/middleware/ensureTenantMiddleware";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["User"],
});

/**@description user login  */
registrar.post("/user/login", {
  requestSchema: { bodySchema: userLoginSchema },
  responseSchemas: [{ statusCode: 200, schema: baseUserSchema }],
  controller: userLogin,
});

/**@description get user profile  */
registrar.get("/user/profile", {
  middlewares: [authRoleMiddleware()],
  oasSchema: getUserProfileOASSchema,
  controller: getUserProfile,
});

/**@description update user password  */
registrar.put("/user/:id/password/", {
  oasSchema: updateUserPasswordOASSchema,
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: userUpdatePasswordSchema,
  },
  middlewares: [authRoleMiddleware()],
  controller: updateUserPassword,
});

/**@description update user authentication email  */
registrar.put("/user/:id/auth-email/", {
  middlewares: [authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateUserAuthEmailSchema,
  },
  responseSchemas: [
    {
      statusCode: 200,
      schema: z.object({
        message: z.string(),
        userId: z.number(),
      }),
    },
  ],
  controller: updateUserAuthEmail,
});

/**@description get all users with optional filtering */
registrar.get("/user/list", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  oasSchema: getUserOASSchema,
  requestSchema: { querySchema: getUsersQuerySchema },
  controller: getUsers,
});

/**@description get users count with optional search filtering */
registrar.get("/count", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    querySchema: getUsersCountQuerySchema,
  },
  responseSchemas: [
    {
      statusCode: 200,
      schema: getUsersCountResponseSchema,
    },
  ],
  controller: getUsersCount,
});

/**@description get user authentication email  */
registrar.get("/user/:id/auth-email/", {
  middlewares: [authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [
    {
      statusCode: 200,
      schema: z.object({
        authEmail: z.string().nullable(),
      }),
    },
  ],
  controller: getUserAuthEmail,
});

/**@description update user status and roles  */
registrar.put("/user/:id/status-roles/", {
  middlewares: [authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateUserStatusAndRolesSchema,
  },
  controller: updateUserStatusAndRoles,
});

/**@description Create User with Personal Information */
registrar.post("/user/personal", {
  middlewares: [authRoleMiddleware()],
  requestSchema: { bodySchema: createUserSchema },
  responseSchemas: [{ statusCode: 201, schema: z.object({ id: z.number() }) }],
  controller: createUser,
});

/**@description Update user personal information by id  */
registrar.put("/user/:id/personal", {
  middlewares: [authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: baseUserSchema.partial(),
  },
  responseSchemas: [{ statusCode: 200, schema: z.object({ id: z.number() }) }],
  controller: updateUserProfile,
});

/**@description get user by id  */
registrar.get("/user/:id/personal", {
  middlewares: [authRoleMiddleware()],
  requestSchema: { paramsSchema: { id: idValidation } },
  controller: getUserById,
});

/**@description get user contacts by id  */
registrar.get("/user/:id/contacts", {
  middlewares: [authRoleMiddleware(), ensureTenantMiddleware()],
  requestSchema: { paramsSchema: { id: idValidation } },
  controller: getUserContacts,
});

/**@description Save/Update user contact information  */
registrar.put("/user/:id/contacts", {
  middlewares: [authRoleMiddleware(), ensureTenantMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: saveUserContactsSchema,
  },
  controller: saveUserContacts,
});

/**@description Save/Update user job details  */
registrar.post("/user/:id/job-details", {
  middlewares: [authRoleMiddleware(), ensureTenantMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: saveUserJobDetailsSchema,
  },
  controller: saveUserJobDetails,
});

/**@description Get user job details  */
registrar.get("/user/:id/job-details", {
  middlewares: [authRoleMiddleware(), ensureTenantMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  controller: getUserJobDetails,
});

// registrar.get("/user/test-query", {
//   oasSchema: testQueryOASSchema,
//   requestSchema: { querySchema: TestQuerySchema },
//   controller: (req, res) => {
//     res.send("test query");
//   },
// });

export default registrar;
