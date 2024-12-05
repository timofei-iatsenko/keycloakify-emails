import { KcEmailVars } from "./kc-email-vars.js";

export function createVariablesHelper<EmailId extends KcEmailVars["emailId"]>(
  _emailId: EmailId,
) {
  type MatchingEmail = Extract<KcEmailVars, { emailId: EmailId }>;
  type ValidPaths = MatchingEmail["vars"];

  return {
    /**
     * Help to produce a correct freemarker expression, example:
     *
     * ```jsx
     *   <p>
     *     Someone has created a {exp("user.firstName")} account with this email address. If
     *     this was you, click the link below to verify your email address
     *   </p>
     * ```
     */
    exp: (name: ValidPaths) => "${" + name + "}",
    /**
     * Print just a variable name, useful in a complex expressions
     */
    v: (name: ValidPaths) => name,
  };
}
