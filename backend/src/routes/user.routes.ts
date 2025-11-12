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
} from "@src/schemas/user.schema";
import {
  getUserOASSchema,
  getUserProfileOASSchema,
  getUsersQuerySchema,
  updateUserPasswordOASSchema,
} from "@src/openApiSpecification/oasDoc/user.oas";
import { idValidation } from "@src/schemas/common.schema";
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
import { tenantHeaderMiddleware } from "@src/middleware/tenantHeaderMiddleware";

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
  controller: getUserProfile,
  oasSchema: getUserProfileOASSchema,
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
  middlewares: [authRoleMiddleware()],
  controller: updateUserAuthEmail,
});

/**@description get all users with optional filtering */
registrar.get("/user/list", {
  oasSchema: getUserOASSchema,
  requestSchema: { querySchema: getUsersQuerySchema },
  middlewares: [tenantHeaderMiddleware(), authRoleMiddleware()],
  controller: getUsers,
});

/**@description get users count with optional search filtering */
registrar.get("/count", {
  requestSchema: {
    querySchema: getUsersCountQuerySchema,
  },
  responseSchemas: [
    {
      statusCode: 200,
      schema: getUsersCountResponseSchema,
    },
  ],
  middlewares: [tenantHeaderMiddleware(), authRoleMiddleware()],
  controller: getUsersCount,
});

/**@description get user authentication email  */
registrar.get("/user/:id/auth-email/", {
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
  middlewares: [authRoleMiddleware()],
  controller: getUserAuthEmail,
});

/**@description update user status and roles  */
registrar.put("/user/:id/status-roles/", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateUserStatusAndRolesSchema,
  },
  middlewares: [authRoleMiddleware()],
  controller: updateUserStatusAndRoles,
});

/**@description Create User with Personal Information */
registrar.post("/user/personal", {
  requestSchema: { bodySchema: createUserSchema },
  responseSchemas: [{ statusCode: 201, schema: z.object({ id: z.number() }) }],
  middlewares: [authRoleMiddleware()],
  controller: createUser,
});

/**@description Update user personal information by id  */
registrar.put("/user/:id/personal", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: baseUserSchema.partial(),
  },
  responseSchemas: [{ statusCode: 200, schema: z.object({ id: z.number() }) }],
  middlewares: [authRoleMiddleware()],
  controller: updateUserProfile,
});

/**@description get user by id  */
registrar.get("/user/:id/personal", {
  requestSchema: { paramsSchema: { id: idValidation } },
  middlewares: [authRoleMiddleware()],
  controller: getUserById,
});

/**@description get user contacts by id  */
registrar.get("/user/:id/contacts", {
  requestSchema: { paramsSchema: { id: idValidation } },
  middlewares: [authRoleMiddleware(), tenantHeaderMiddleware()],
  controller: getUserContacts,
});

/**@description Save/Update user contact information  */
registrar.put("/user/:id/contacts", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: saveUserContactsSchema,
  },
  middlewares: [authRoleMiddleware(), tenantHeaderMiddleware()],
  controller: saveUserContacts,
});

/**@description Save/Update user job details  */
registrar.post("/user/:id/job-details", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: saveUserJobDetailsSchema,
  },
  middlewares: [authRoleMiddleware(), tenantHeaderMiddleware()],
  controller: saveUserJobDetails,
});

/**@description Get user job details  */
registrar.get("/user/:id/job-details", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  middlewares: [authRoleMiddleware(), tenantHeaderMiddleware()],
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
