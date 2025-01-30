type UnknownObject = "object";

type Path<T, K extends keyof T = keyof T> = K extends string // Ensure keys are strings
  ? T[K] extends (...args: never[]) => never // Check if the property is a function
    ? `${K}()` | `${K}().${string}` // Append () and handle unknown return types
    : T[K] extends UnknownObject // Special handling for UnknownObject
      ? `${K}.${string}` // Produce `parent.${string}` for UnknownObject
      : T[K] extends object // If it's an object, recurse
        ? `${K}` | `${K}.${Path<T[K]>}` // Combine current key with sub-paths
        : `${K}` // For primitives or other types, just return the key
  : never;

// refer to https://github.dev/keycloak/keycloak/tree/main/services/src/main/java/org/keycloak/email/freemarker

/**
 * org.keycloak.models.OrganizationModel
 */
export interface OrganizationModel {
  name: string;
  alias: string;
  enabled: boolean;
  description: string;
  redirectUrl: string;
  attributes: Record<string, string[]>;
}

export interface BrokeredIdentityContext {
  username: string;
}

export interface ProfileBean {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  attributes: () => Record<string, string>;
}

/**
 * org.keycloak.forms.login.freemarker.model.UrlBean;
 */
export interface UrlBean {
  loginAction: string;
  loginUrl: string;
  loginRestartFlowUrl: string;
  ssoLoginInOtherTabsUrl: string;
  hasAction: boolean;
  registrationAction: string;
  registrationUrl: string;
  loginResetCredentialsUrl: string;
  loginUsernameReminderUrl: string;
  firstBrokerLoginUrl: string;
  logoutConfirmAction: string;
  resourcesUrl: string;
  oauthAction: string;
  oauth2DeviceVerificationAction: string;
  resourcesPath: string;
  resourcesCommonPath: string;
}

export interface EventBean {
  date: string;
  ipAddress: string;
  details: UnknownObject;
}

export interface BaseVars {
  locale: string;
  /**
   * org.keycloak.theme.Theme.getProperties()
   */
  properties: UnknownObject;
  realmName: string;
  user: ProfileBean;
  url: UrlBean;
}

export type LinkVars = {
  link: string;
  /** minutes */
  linkExpiration: number;
  "linkExpirationFormatter(linkExpiration)": string;
};

export type EmailTest = {
  emailId: "email-test.ftl";
  vars: Path<BaseVars>;
};

export type EmailUpdateConfirmation = {
  emailId: "email-update-confirmation.ftl";
  vars: Path<
    BaseVars &
      LinkVars & {
        newEmail: string;
      }
  >;
  // ${kcSanitize(msg("emailUpdateConfirmationBodyHtml",link, newEmail, realmName, linkExpirationFormatter(linkExpiration)))?no_esc}
};

export type EmailVerification = {
  emailId: "email-verification.ftl";
  vars: Path<BaseVars & LinkVars>;
  // ${kcSanitize(msg("emailVerificationBodyHtml",link, linkExpiration, realmName, linkExpirationFormatter(linkExpiration)))?no_esc}
};

// i didn't find this one in the keycloack code
// export type EmailVerificationWithCode = {
//   emailId: 'email-verification-with-code.ftl'
//   vars:
//     | 'code'
//     | 'realmName'
//     | 'linkExpiration'
//     | 'linkExpirationFormatter(linkExpiration))'
//   // ${kcSanitize(msg("emailVerificationBodyCodeHtml",code))?no_esc}
// }

// event: EventBean
export type EventLoginError = {
  emailId: "event-login_error.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventLoginErrorBodyHtml",event.date,event.ipAddress))?no_esc}
};

export type EventRemoveCredential = {
  emailId: "event-remove_credential.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventRemoveCredentialBodyHtml", event.details.credential_type!"unknown", event.date, event.ipAddress))?no_esc}
};

export type EventRemoveTotp = {
  emailId: "event-remove_totp.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventRemoveTotpBodyHtml",event.date, event.ipAddress))?no_esc}
};

export type EventUpdateCredential = {
  emailId: "event-update_credential.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventUpdateCredentialBodyHtml", event.details.credential_type!"unknown", event.date, event.ipAddress))?no_esc}
};

export type EventUpdatePassword = {
  emailId: "event-update_password.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventUpdatePasswordBodyHtml",event.date, event.ipAddress))?no_esc}
};

export type EventUpdateTotp = {
  emailId: "event-update_totp.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventUpdateTotpBodyHtml",event.date, event.ipAddress))?no_esc}
};

export type EventUserDisabledByPermanentLockout = {
  emailId: "event-user_disabled_by_permanent_lockout.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventUserDisabledByPermanentLockoutHtml", event.date))?no_esc}
};

export type EventUserDisabledByTemporaryLockout = {
  emailId: "event-user_disabled_by_temporary_lockout.ftl";
  vars: Path<BaseVars & { event: EventBean }>;
  // ${kcSanitize(msg("eventUserDisabledByTemporaryLockoutHtml", event.date))?no_esc}
};

export type ExecuteActions = {
  emailId: "executeActions.ftl";
  vars: Path<BaseVars & LinkVars>;
};

export type IdentityProviderLink = {
  emailId: "identity-provider-link.ftl";
  vars: Path<
    BaseVars &
      LinkVars & {
        identityProviderContext: BrokeredIdentityContext;
        identityProviderAlias: string;
        identityProviderDisplayName: string;
      }
  >;
  //  ${kcSanitize(msg("identityProviderLinkBodyHtml", identityProviderDisplayName, realmName, identityProviderContext.username, link, linkExpiration, linkExpirationFormatter(linkExpiration)))?no_esc}
};

export type OrgInvite = {
  emailId: "org-invite.ftl";
  vars: Path<
    BaseVars &
      LinkVars & {
        organization: OrganizationModel;
        firstName: string;
        lastName: string;
      }
  >;
  // ${kcSanitize(msg("orgInviteBodyPersonalizedHtml", link, linkExpiration, realmName, organization.name, linkExpirationFormatter(linkExpiration), firstName, lastName))?no_esc}
  // ${kcSanitize(msg("orgInviteBodyHtml", link, linkExpiration, realmName, organization.name, linkExpirationFormatter(linkExpiration)))?no_esc}
};

export type PasswordReset = {
  emailId: "password-reset.ftl";
  vars: Path<BaseVars & LinkVars>;
  // ${kcSanitize(msg("passwordResetBodyHtml",link, linkExpiration, realmName, linkExpirationFormatter(linkExpiration)))?no_esc}
};

export type KcEmailVars =
  | EmailTest
  | EmailUpdateConfirmation
  | EmailVerification
  | EventLoginError
  | EventRemoveCredential
  | EventRemoveTotp
  | EventUpdateCredential
  | EventUpdatePassword
  | EventUpdateTotp
  | EventUserDisabledByPermanentLockout
  | EventUserDisabledByTemporaryLockout
  | ExecuteActions
  | IdentityProviderLink
  | OrgInvite
  | PasswordReset;
