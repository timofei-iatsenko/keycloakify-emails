import { FreemarkerExpression, KcEmailVars } from "./kc-email-vars.js";

export function createVariablesHelper<EmailId extends KcEmailVars["emailId"]>(
  _emailId: EmailId,
) {
  type MatchingEmail = Extract<KcEmailVars, { emailId: EmailId }>;
  type ValidPaths = MatchingEmail["vars"];

  /**
   * Expression type that accepts either:
   * - Valid property paths for the email template (type-safe)
   * - FreeMarker expressions with validated paths (array access, fallbacks, null-safe)
   */
  type Expression = ValidPaths | FreemarkerExpression<ValidPaths>;

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
     *
     * Also supports FreeMarker syntax like fallbacks and array access:
     * ```jsx
     *   <p>
     *     Organization: {exp("(organization.attributes.displayName[0])!organization.name")}
     *   </p>
     * ```
     */
    exp: (name: Expression) => "${" + name + "}",
    /**
     * Print just a variable name, useful in a complex expressions.
     * Also supports FreeMarker syntax patterns.
     */
    v: (name: Expression) => name,
  };
}
