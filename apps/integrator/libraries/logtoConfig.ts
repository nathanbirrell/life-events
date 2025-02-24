import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { organizationScopes } from "auth/authentication-context";
import { headers } from "next/headers";
import { AuthUserScope } from "auth/auth-session";

const integratorResource = process.env.INTEGRATOR_BACKEND_URL + "/";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_INTEGRATOR_APP_ID as string,
  appSecret: process.env.LOGTO_INTEGRATOR_APP_SECRET as string,
};

const publicServantExpectedRoles = ["Integrator Public Servant"];

const buildLoginUrlWithPostLoginRedirect = () => {
  const currentPath = headers().get("x-url");
  return `/preLogin?loginUrl=/login&postLoginRedirectUrl=${encodeURIComponent(currentPath ?? "")}`;
};

export const commonScopes = [AuthUserScope.Email];

const citizenScopes = [
  "integrator:journey.public:read",
  "integrator:run.self:read",
  "integrator:run.self:write",
];

export const integratorPublicServantScopes = [
  "integrator:journey:*",
  "integrator:step:*",
  "integrator:run:read",
];

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    citizenScopes: [...citizenScopes],
    publicServantExpectedRoles,
    publicServantScopes: [...integratorPublicServantScopes],
    loginUrl: buildLoginUrlWithPostLoginRedirect(),
    resourceUrl: integratorResource,
  });

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...baseConfig,
  resources: [integratorResource],
  scopes: [
    ...commonScopes,
    ...organizationScopes,
    ...integratorPublicServantScopes,
    ...citizenScopes,
  ],
});

export const postLoginRedirectUrlCookieName = "logtoPostLoginRedirectUrl";

export const logtoUserIdCookieName = "logtoUserId";

// Profile API
export const profileApiResource = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;

const profileApiScopes = ["profile:user:*"];

export const getProfileAuthenticationContextConfig = (
  organizationId,
): AuthenticationContextConfig => ({
  baseUrl: baseConfig.baseUrl,
  appId: baseConfig.appId,
  appSecret: baseConfig.appSecret,
  citizenScopes: [],
  organizationId,
  publicServantExpectedRoles,
  publicServantScopes: profileApiScopes,
  loginUrl: buildLoginUrlWithPostLoginRedirect(),
  resourceUrl: profileApiResource,
});
