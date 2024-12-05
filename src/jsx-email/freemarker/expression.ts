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
export const exp = <T = never>(name: T) => "${" + name + "}";
