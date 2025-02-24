import {
  LogtoContext,
  getAccessToken,
  getLogtoContext,
  getOrganizationToken,
  signIn,
  signOut,
} from "@logto/next/server-actions";
import {
  IAuthSession,
  GetSessionContextParameters,
  PartialAuthSessionContext,
  AuthSessionUserInfo,
  AuthSessionOrganizationInfo,
} from "./types";
import { redirect } from "next/navigation";
import { LogtoNextConfig, UserScope } from "@logto/next";
import { cookies } from "next/headers";

const INACTIVE_PUBLIC_SERVANT_ORG_ROLE =
  "inactive-ps-org:Inactive Public Servant";
const INACTIVE_PUBLIC_SERVANT_SCOPE = "bb:public-servant.inactive:*";

const DEFAULT_ORGANIZATION_ID = "ogcio";

const SELECTED_ORG_COOKIE = "bb-selected-org-id";

export const AuthUserScope = UserScope;

export const AuthSession: IAuthSession = {
  async login(config) {
    addInactivePublicServantScope(config);
    console.info(
      {
        baseUrl: config.baseUrl,
        endpoint: config.endpoint,
        resources: config.resources,
        scopes: config.scopes,
      },
      "Requesting login, redirecting to the Logto signIn page",
    );
    return signIn(config);
  },
  async logout(config, redirectUri) {
    addInactivePublicServantScope(config);
    cookies().delete(SELECTED_ORG_COOKIE);
    return signOut(config, redirectUri);
  },
  async get(
    config: LogtoNextConfig,
    getContextParameters: GetSessionContextParameters,
  ): Promise<PartialAuthSessionContext> {
    addInactivePublicServantScope(config);
    let context;
    try {
      context = await getLogtoContext(config, getContextParameters);
    } catch (err) {
      console.error(err);
      redirect(getContextParameters?.loginUrl ?? "/login");
    }

    if (!context.isAuthenticated) {
      redirect(getContextParameters?.loginUrl ?? "/login");
    }

    try {
      return parseContext(context, getContextParameters);
    } catch (err) {
      console.error(err);
      redirect(getContextParameters?.loginUrl ?? "/login");
    }
  },
  async isAuthenticated(config, getContextParameters) {
    addInactivePublicServantScope(config);
    const context = await getLogtoContext(config, getContextParameters);

    return context.isAuthenticated;
  },
  getSelectedOrganization(): string | undefined {
    return cookies().get(SELECTED_ORG_COOKIE)?.value;
  },
  setSelectedOrganization(organizationId: string): string {
    cookies().set(SELECTED_ORG_COOKIE, organizationId);
    return organizationId;
  },
  async getCitizenToken(
    config: LogtoNextConfig,
    resource?: string,
  ): Promise<string> {
    return await getAccessToken(config, resource);
  },
  async getOrgToken(
    config: LogtoNextConfig,
    organizationId?: string,
  ): Promise<string> {
    return await getOrganizationToken(config, organizationId);
  },
};

const addInactivePublicServantScope = (config) => {
  if (config.scopes && !config.scopes.includes(INACTIVE_PUBLIC_SERVANT_SCOPE)) {
    config.scopes.push(INACTIVE_PUBLIC_SERVANT_SCOPE);
  }
};

const getUserInfo = (
  context: LogtoContext,
  getContextParameters: GetSessionContextParameters,
): AuthSessionUserInfo | undefined => {
  let name: string | null = null;
  let username: string | null = null;
  let id: string | null = null;
  let email: string | null = null;

  if (context.claims) {
    name = context.claims.name ?? null;
    username = context.claims.username ?? null;
    id = context.claims.sub;
    email = context.claims.email ?? null;
  }

  if (context.userInfo) {
    name = name ?? context.userInfo.name ?? null;
    username = username ?? context.userInfo.username ?? null;
    id = context.userInfo.sub;
    email = email ?? context.userInfo.email ?? null;
  }

  if (id === null || (name === null && username === null && email === null)) {
    return undefined;
  }

  const organizations = (context.userInfo?.organization_data ?? [])
    .sort((orgA, orgB) => {
      if (orgA.id === DEFAULT_ORGANIZATION_ID) {
        return -1;
      }

      if (orgB.id === DEFAULT_ORGANIZATION_ID) {
        return 1;
      }

      return orgA.name.localeCompare(orgB.name);
    })
    .filter((org) => {
      return getContextParameters.publicServantExpectedRoles.some((role) => {
        const orgPSRole = `${org.id}:${role}`;
        return context.userInfo?.organization_roles?.includes(orgPSRole);
      });
    });

  const organizationData = organizations.reduce((acc, current) => {
    acc[current.id] = current;
    return acc;
  }, {});

  return {
    name,
    username,
    id,
    email,
    organizationData,
  };
};

const getOrganizationInfo = (
  context: LogtoContext,
  getContextParameters: GetSessionContextParameters | undefined,
  organizationRoles: string[] | null,
): AuthSessionOrganizationInfo | undefined => {
  if (organizationRoles === null || organizationRoles.length === 0) {
    return undefined;
  }

  if (
    !getContextParameters?.organizationId ||
    !context.userInfo?.organization_data
  ) {
    return undefined;
  }

  if (
    !context.userInfo?.organizations?.includes(
      getContextParameters.organizationId,
    )
  ) {
    return undefined;
  }

  for (const currentOrg of context.userInfo.organization_data) {
    if (currentOrg.id === getContextParameters.organizationId) {
      return {
        id: currentOrg.id,
        name: currentOrg.name,
        roles: organizationRoles,
      };
    }
  }

  return undefined;
};

const getOrganizationRoles = (context: LogtoContext): string[] | null => {
  let organizationRoles: Set<string> | null = null;

  if (context.claims && Array.isArray(context.claims.organization_roles)) {
    organizationRoles = new Set<string>(context.claims.organization_roles);
  }

  if (context.userInfo && Array.isArray(context.userInfo.organization_roles)) {
    if (organizationRoles === null) {
      organizationRoles = new Set<string>();
    }

    organizationRoles = new Set<string>([
      ...Array.from(organizationRoles),
      ...context.userInfo.organization_roles,
    ]);
  }

  return organizationRoles ? Array.from(organizationRoles) : null;
};

const checkIfPublicServant = (
  orgRoles: string[] | null,
  getContextParameters: GetSessionContextParameters,
): boolean => {
  if (checkIfInactivePublicServant(orgRoles) || orgRoles === null) {
    return false;
  }

  return orgRoles.some((orgRole) => {
    const [_, role] = orgRole.split(":");
    return getContextParameters.publicServantExpectedRoles.includes(role);
  });
};

const checkIfInactivePublicServant = (orgRoles: string[] | null): boolean =>
  orgRoles !== null && orgRoles?.includes(INACTIVE_PUBLIC_SERVANT_ORG_ROLE);

const parseContext = (
  context: LogtoContext,
  getContextParameters: GetSessionContextParameters,
): PartialAuthSessionContext => {
  const userInfo = getUserInfo(context, getContextParameters);
  const orgRoles = getOrganizationRoles(context);
  const orgInfo = getOrganizationInfo(context, getContextParameters, orgRoles);
  const isPublicServant = checkIfPublicServant(orgRoles, getContextParameters);
  const isInactivePublicServant = checkIfInactivePublicServant(orgRoles);

  const outputContext: PartialAuthSessionContext = {
    isPublicServant,
    isInactivePublicServant,
  };

  if (userInfo) {
    outputContext.user = userInfo;
  }
  if (orgInfo) {
    outputContext.organization = orgInfo;
  }
  if (getContextParameters.includeOriginalContext) {
    outputContext.originalContext = context;
  }

  return outputContext;
};
