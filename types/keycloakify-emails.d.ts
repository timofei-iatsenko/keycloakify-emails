// Extend keycloakify-emails variables with our custom template typing
declare module "keycloakify-emails/variables" {
  import type * as K from "keycloakify-emails/variables";

  // Reuse the existing helper’s inference to avoid shadowing internal Path types
  type PasswordResetVars = Parameters<
    ReturnType<typeof K.createVariablesHelper<"password-reset.ftl">>["v"]
  >[0];


  // Add additional types here
  export type CustomPasswordReset = {
    emailId: "custom-password-reset.ftl";
    vars: PasswordResetVars;
  };

  // Extend type here
  type AugmentedEmail = K.KcEmailVars | CustomPasswordReset;

  export function createVariablesHelper<EmailId extends AugmentedEmail["emailId"]>(
    emailId: EmailId,
  ): {
    exp: (name: Extract<AugmentedEmail, { emailId: EmailId }>["vars"]) => string;
    v: (name: Extract<AugmentedEmail, { emailId: EmailId }>["vars"]) => Extract<
      AugmentedEmail,
      { emailId: EmailId }
    >["vars"];
  };
}
