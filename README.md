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

Framework-agnostic, the extension works with any JS email library. [jsx-email](https://jsx.email/) is recommended, with dedicated bindings and helpers provided.

### How it works

This library generates Freemarker templates using JavaScript, leaving expression placeholders in place.
The JavaScript code is executed ahead of time during static generation, not by Keycloak.
Therefore, JavaScript functions do not have access to Keycloak variables like `userName` or `realmName` during rendering.

Keycloak replaces the Freemarker expressions with their actual values during email rendering

The library includes a set of React components and utilities designed to simplify the process of writing these expressions.

## Installation

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

export default defineConfig({
  plugins: [
    react(),
    keycloakify({
      themeName: ["vanilla", "chocolate"],
      accountThemeImplementation: "none",
      postBuild: async (buildContext) => {
        await buildEmailTheme({
          templatesSrcDirPath: import.meta.dirname + "/emails/templates",
          i18nSourceFile: import.meta.dirname + "/emails/i18n.ts",
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

### Enable email theme in Keycloakify

Create empty `./src/emails` folder with command:

```bash
mkdir -p ./src/emails && touch ./src/emails/.gitkeep
```

This will turn on default email theme support in the Keycloakify.

### Creating a Template

Place template files in `templatesSrcDirPath`. Templates not defined will fall back to the default Keycloak theme.

Example:

```tsx
// emails/templates/email-test.tsx
import { GetSubject, GetTemplate } from "keycloakify-emails";

export const getTemplate: GetTemplate = async (props) => {
  return "<p>This is a test message</p>";
};

export const getSubject: GetSubject = async (props) => {
  return "[KEYCLOAK] - SMTP test message";
};
```

Use the `GetTemplate` and `GetSubject` types for parameter details and return types.

Check full example in the `./example` folder in this repo.

### Creating an i18n.ts file

There are some messages which are used by Keycloak methods and could be overridden only using `messages.properties` files.

Create a `/emails/i18n.ts` file with following content:

```ts
import { GetMessages } from "keycloakify-emails";

export const getMessages: GetMessages = (props) => {
  // all properties are optional, if you omit them, they will be taken from a base theme
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

## Integrating with jsx-email

Install `jsx-email`:

```bash
npm i --save-dev jsx-email
```

Then create templates using `jsx-email` components:

```tsx
import {
  GetSubject,
  GetTemplate,
  GetTemplateProps,
  createVariablesHelper,
} from "keycloakify-emails";
import { render } from "keycloakify-emails/jsx-email";
import { Text } from "jsx-email";

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
  return await render(
    <Template locale={props.locale} themeName={props.themeName} />,
    props.plainText,
  );
};

export const getSubject: GetSubject = async (props) => {
  return "Verify email";
};
```

See [jsx-email docs](https://jsx.email/docs/quick-start) for more.

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

### RawOutput

Allows printing content into a template without processing or escaping, useful for Freemarker expressions that are not valid HTML.

```tsx
export const If = ({
  condition,
  children,
}: PropsWithChildren<{ condition: string }>) => (
  <>
    <RawOutput content={`<#if ${condition}>`} />
    {children}
    <RawOutput content="</#if>" />
  </>
);
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
