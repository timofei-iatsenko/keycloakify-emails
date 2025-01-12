[![License][badge-license]][license] [![Version][badge-version]][package] [![Downloads][badge-downloads]][package]

# keycloakify-emails

> The extension for [keycloakify](https://keycloakify.dev) to build your email theme using JS.

## Description

This extension allows you to build email themes using modern JavaScript tooling.

### Features:

- Support theme variants. You can produce different templates using the same sourcecode.
- Support i18n. You can use i18n solution of your choice. The extension simply pass a `locale` to your template function.
- Support override for `messages.properties` using javascript and i18n solution of your choice.
- Provide type-safe helpers for available template variables, as well helpers to create Freemarker expressions.
- Produce both plain text and html version of email

Framework-agnostic, the extension works with any JS email library. [jsx-email](https://jsx.email/) is recommended, with dedicated bindings and helpers provided.

### How it works

This library generates Freemarker templates using JavaScript, leaving expression placeholders in place.
The JavaScript code is executed ahead of time during static generation, not by Keycloak.
Therefore, JavaScript functions do not have access to Keycloak variables like `userName` or `realmName` during rendering.

Keycloak replaces the Freemarker expressions with their actual values during email rendering

The library includes a set of React components and utilities designed to simplify the process of writing these expressions.

## Installation

Requires keycloakify v11.8.1 or higher.

```bash
npm install --save-dev keycloakify-emails
# yarn add --dev keycloakify-emails
```

## Usage

### Configuration in Vite

Add the extension to your `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import themes from "./themes";
import { buildEmailTheme } from "keycloakify-emails";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    keycloakify({
      themeName: ["vanilla", "chocolate"],
      accountThemeImplementation: "none",
      postBuild: async (buildContext) => {
        await buildEmailTheme({
          templatesSrcDirPath: path.join(
            import.meta.dirname,
            "src",
            "email",
            "templates",
          ),
          themeNames: buildContext.themeNames,
          keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
          locales: ["en", "pl"],
          cwd: import.meta.dirname,
          esbuild: {}, // optional esbuild options
        });
      },
    }),
  ],
});
```

### Excluding `src/email` from TypeScript compilation

Add this line to your `tsconfig.json`:

```json
{
  "exclude": ["src/email"]
}
```

### Creating a Template

To create a custom template, place the template files in the directory specified by `templatesSrcDirPath` (usually `src/email/templates`).  
Any templates you do not define will fall back to the default Keycloak theme.

Example Template:

```tsx
// src/email/templates/templates/email-test.tsx
import { GetSubject, GetTemplate } from "keycloakify-emails";

export const getTemplate: GetTemplate = async (props) => {
  return "<p>This is a test message</p>";
};

export const getSubject: GetSubject = async (props) => {
  return "[KEYCLOAK] - SMTP test message";
};
```

For more details on the parameters and return types, refer to the `GetTemplate` and `GetSubject` type definitions.

#### Producing Plain Text and HTML version of template

Keycloak sends multipart emails containing both HTML and plain text versions to ensure compatibility with a wide range of email clients. Your theme must provide both versions for every template.

To do so `keycloakify-emails` will call `getTemplate` function 2 times, with `{plainText: true}` and `{plainText: false}`. You need to return corresponding version accordingly.

When using the `jsx-email` integration, the plain text version is automatically derived from the JSX component used for the HTML version. This eliminates the need to maintain two separate versions manually. However, ensure that the plain text version is tested and finalized before release.

Check full example in the `./example` folder in this repo.

### Overriding Messages in the Message Bundle

You can skip this step if you are satisfied with the default translations for `requiredAction` or `linkExpirationFormatter`.

However, if you want to customize these messages or implement additional integrations based on a message bundle (`messages_x.properties`, you can define your own translations by creating an `/emails/i18n.ts` file with the following content:

```ts
import { GetMessages } from "keycloakify-emails";

export const getMessages: GetMessages = (props) => {
  // All properties are optional. If you omit them, they will fall back to the base theme defaults.
  if (props.locale === "en") {
    return {
      "requiredAction.CONFIGURE_TOTP": "Configure OTP",
      "requiredAction.TERMS_AND_CONDITIONS": "Terms and Conditions",
      "linkExpirationFormatter.timePeriodUnit.minutes":
        "{0,choice,0#minutes|1#minute|1<minutes}",
    };
  } else {
    return {};
  }
};
```

Once you have defined your translations, include the file in the configuration:

```js
await buildEmailTheme({
  // Other configurations
  i18nSourceFile: import.meta.dirname + "/emails/i18n.ts",
});
```

### Reference Implementation

Below is a reference implementation showcasing all available messages that can be customized.

<details>
<summary>Click to expand</summary>

```ts
import { GetMessages } from "keycloakify-emails";

export const getMessages: GetMessages = (props) => {
  // Default properties are optional. If omitted, they will fall back to the base theme defaults.
  return {
    "requiredAction.CONFIGURE_TOTP": "Configure OTP",
    "requiredAction.TERMS_AND_CONDITIONS": "Terms and Conditions",
    "requiredAction.UPDATE_PASSWORD": "Update Password",
    "requiredAction.UPDATE_PROFILE": "Update Profile",
    "requiredAction.VERIFY_EMAIL": "Verify Email",
    "requiredAction.CONFIGURE_RECOVERY_AUTHN_CODES": "Generate Recovery Codes",

    // Units for link expiration timeout formatting
    // For languages with plural forms based on the value (e.g., Czech), use the Java choice format.
    // Documentation:
    // https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/MessageFormat.html
    // https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/ChoiceFormat.html
    "linkExpirationFormatter.timePeriodUnit.seconds":
      "{0,choice,0#seconds|1#second|1<seconds}",
    "linkExpirationFormatter.timePeriodUnit.minutes":
      "{0,choice,0#minutes|1#minute|1<minutes}",
    "linkExpirationFormatter.timePeriodUnit.hours":
      "{0,choice,0#hours|1#hour|1<hours}",
    "linkExpirationFormatter.timePeriodUnit.days":
      "{0,choice,0#days|1#day|1<days}",
  };
};
```

</details>

The library will use this file to generate resource message bundle for specified locales.

## Integrating with jsx-email

Follow their [quick-start guide](https://jsx.email/docs/quick-start) to set up jsx-email in your project.

Then you will be able to create templates using `jsx-email` components:

```tsx
import {
  GetSubject,
  GetTemplate,
  GetTemplateProps,
  createVariablesHelper,
} from "keycloakify-emails";
import {
  Text,
  Body,
  Container,
  Section,
  Preview,
  Html,
  Head,
  render,
} from "jsx-email";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> {}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  padding: "20px 0 48px",
};

const box = {
  padding: "0 48px",
};
const paragraph = {
  color: "#777",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

// used by Preview App of jsx-email
export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "vanilla",
};

export const templateName = "Email Verification";

const { exp } = createVariablesHelper("email-verification.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <Html lang={locale}>
    <Head />
    <Preview>Verification link from {exp("realmName")}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={paragraph}>
            Someone has created a {exp("realmName")} account with this email
            address. If this was you, click the link below to verify your email
            address
          </Text>
          <Text style={paragraph}>
            <a href={exp("link")}>Link to e-mail address verification</a>
          </Text>
          <Text style={paragraph}>
            This link will expire within{" "}
            {exp("linkExpirationFormatter(linkExpiration)")}.
          </Text>
          <Text style={paragraph}>
            If you didn't create this account, just ignore this message.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (props) => {
  return "Verify email";
};
```

## Adding an Image to an Email Theme

The ideal approach for managing assets in an email theme is to store them externally, such as in an S3 bucket or a CDN. This setup ensures assets are globally accessible and independent of the Keycloak instance. However, if external storage is not an option, assets can be stored within Keycloak itself.

It’s important to remember that email assets must remain unchanged once the email is sent. These assets should never be deleted or altered, except to replace them with files of identical dimensions. Emails can reside in a recipient’s mailbox indefinitely, and links to assets within these emails need to remain functional. Deleting or modifying these assets could render the email broken, as it is impossible to retroactively update the links or resend the email with corrected references.

To store assets in the Keycloak instance, configure the directory where these files will reside. The recommended directory is `/emails/templates/assets`, as this location is compatible with the JSX-Email preview server. Here's an example configuration:

```js
await buildEmailTheme({
  // Other configurations
  assetsDirPath: import.meta.dirname + "/emails/templates/assets",
});
```

Once the directory is set up, add your assets to this location. For instance, if you place an image at `emails/templates/assets/kc-logo.png`, you can reference it in your email template using the following snippet:

```tsx
const baseUrl = import.meta.isJsxEmailPreview
  ? "/assets"
  : "${url.resourcesUrl}";

<Img src={`${baseUrl}/kc-logo.png`} width="83" height="75" />;
```

This approach ensures compatibility with both Keycloak and the JSX-Email preview server.

## Freemarker helpers

### `createVariablesHelper("email-verification.ftl")`

This function provides a type-safe way to write expressions for templates.

```tsx
import { createVariablesHelper } from "keycloakify-emails";
const { exp } = createVariablesHelper("email-verification.ftl");

<Text style={paragraph}>
  Someone has created a {exp("realmName")} account with this email address. If
  this was you, click the link below to verify your email address.
</Text>;
```

The `exp("realmName")` argument is type-checked, ensuring that only valid template variables are available and accessible for the specified template.

### Condition

Facilitates writing `if/elseif/else` expressions for Freemarker templates.

```tsx
import * as Fm from "keycloakify-emails/jsx-email";

<Fm.If condition="firstName?? && lastName??">
  <Fm.Then>
    Hello {exp("firstName")} {exp("lastName")}
  </Fm.Then>
  <Fm.ElseIf condition="firstName??">Hello {exp("firstName")}</Fm.ElseIf>
  <Fm.Else>Hello Guest!</Fm.Else>
</Fm.If>;
```

For simpler cases, you can use `If` without the `Then` case:

```tsx
<Fm.If condition="firstName?? && lastName??">
  Hello {exp("firstName")} {exp("lastName")}
</Fm.If>
```

## Keycloak email templates reference

| Template name                                | Description                     |
| -------------------------------------------- | ------------------------------- |
| email-test.ftl                               | Test email template             |
| email-update-confirmation.ftl                | Email update confirmation       |
| email-verification.ftl                       | Email verification              |
| event-login_error.ftl                        | Login error event notification  |
| event-remove_credential.ftl                  | Credential removal notification |
| event-remove_totp.ftl                        | TOTP removal notification       |
| event-update_credential.ftl                  | Credential update notification  |
| event-update_password.ftl                    | Password update notification    |
| event-update_totp.ftl                        | TOTP update notification        |
| event-user_disabled_by_permanent_lockout.ftl | Permanent lockout notification  |
| event-user_disabled_by_temporary_lockout.ftl | Temporary lockout notification  |
| executeActions.ftl                           | Execute actions email           |
| identity-provider-link.ftl                   | Identity provider link email    |
| org-invite.ftl                               | Organization invitation         |
| password-reset.ftl                           | Password reset email            |

## License

This package is licensed under [MIT][license].

[license]: https://github.com/timofei-iatsenko/keycloakify-emails/blob/main/LICENSE
[package]: https://www.npmjs.com/package/keycloakify-emails
[badge-downloads]: https://img.shields.io/npm/dw/keycloakify-emails.svg
[badge-version]: https://img.shields.io/npm/v/keycloakify-emails.svg
[badge-license]: https://img.shields.io/npm/l/keycloakify-emails.svg
