[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# keycloakify-emails

> The extension for [keycloakify](https://keycloakify.dev) to build your email theme using JS

## Description

This extension allows you to build email theme using a modern email JS tooling.

Supported features: 

- Support theme variants. You can produce different templates using the same sourcecode.
- Support i18n. You can use i18n solution of your choice. The extension simply pass a `locale` to your template function.
- Support override for `messages.properties` using javascript and i18n solution of your choice.
- Provide type-safe helpers for available template variables, as well helpers to create Freemarker expressions.

The extension is framework-agnostic. You can choose any JS emails library you want.

[jsx-email](https://jsx.email/) is recommended. `keycloakify-emails` provides some essential 
bindings and helpers for this library.

## Installation

```sh
npm install --save-dev keycloakify-emails
# yarn add --dev keycloakify-emails
```

## Usage

Then add an extension in your `vite.config`
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
      themeName: ['vanilla', 'chocolate'],
      accountThemeImplementation: "none",
      postBuild: async (buildContext) => {
        await buildEmailTheme({
          templatesSrcDirPath: import.meta.dirname + "/emails/templates", // path to your source folder with source files
          i18nSourceFile: import.meta.dirname + "/emails/i18n.ts", // path to your i18n file
          themeNames: buildContext.themeNames,
          keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
          locales: ["en", "pl"],
          cwd: import.meta.dirname,
          esbuild: {}, //optional esbuild options
        });
      },
    }),
  ],
});
```

### Creating a template using a JS

Create a js file in the `templatesSrcDirPath` folder with the name of Keycloak template you want to override.
Templates which is not presented would fallback to the base Keycloak theme. 
So you can style only those templates you are interested in.


```tsx
// emails/templates/email-test.tsx
import { GetSubject, GetTemplate } from "keycloakify-emails";

export const getTemplate: GetTemplate = async (props) => {
  // return here markup for your template
  return "<p>This is a test message</p>";
};

export const getSubject: GetSubject = async (props) => {
  // return here a Subject for your template
  return "[KEYCLOAK] - SMTP test message";
};
``` 

Check `GetTemplate` and `GetSubject` types for more info on available parameters and expected return types.

TODO: Check full example with `jsx-email`. 

### Creating an i18n.ts file

There is some language properties which are used by KeyCloak methods and 
could be overridden only using `messages.properties` files. 

Create a `/emails/i18n.ts` file with following content: 

```ts
import { GetMessages } from "keycloakify-emails";

export const getMessages: GetMessages = (props) => {
  // this default properties are optional, if you omit them, they will be taken from a base theme
  if (props.locale == 'en') {
    return {
      "requiredAction.CONFIGURE_TOTP": "Configure OTP",
      "requiredAction.TERMS_AND_CONDITIONS": "Terms and Conditions",
      "requiredAction.UPDATE_PASSWORD": "Update Password",
      "requiredAction.UPDATE_PROFILE": "Update Profile",
      "requiredAction.VERIFY_EMAIL": "Verify Email",
      "requiredAction.CONFIGURE_RECOVERY_AUTHN_CODES": "Generate Recovery Codes",

      // # units for link expiration timeout formatting
      // # for languages which have more unit plural forms depending on the value (eg. Czech and other Slavic langs) you can override unit text for some other values like described in the Java choice format which is documented here. For Czech, it would be '{0,choice,0#minut|1#minuta|2#minuty|2<minut}'
      // # https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/MessageFormat.html
      // # https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/ChoiceFormat.html
      "linkExpirationFormatter.timePeriodUnit.seconds": "{0,choice,0#seconds|1#second|1<seconds}",
      "linkExpirationFormatter.timePeriodUnit.minutes": "{0,choice,0#minutes|1#minute|1<minutes}",
      "linkExpirationFormatter.timePeriodUnit.hours": "{0,choice,0#hours|1#hour|1<hours}",
      "linkExpirationFormatter.timePeriodUnit.days": "{0,choice,0#days|1#day|1<days}",
    };
  } else {
    // provide translations for other languages
    return {}
  }
};
```

### jsx-email integration

Library provides a `jsx-email` helpers to smooth the integration. 
They are exposed on the `"keycloakify-emails/jsx-email"` entrypoint

First install `jsx-email`: 

```bash
npm i --save-dev jsx-email
```

Then you can use in your templates: 

```tsx
import { GetSubject, GetTemplate, GetTemplateProps, createVariablesHelper } from "keycloakify-emails";
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

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "vanilla",
};

export const templateName = "Email Verification";

const { exp } = createVariablesHelper("email-verification.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <Html lang={locale}>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={paragraph}>
          <p>
            Someone has created a {exp("user.firstName")} account with this email address. If
            this was you, click the link below to verify your email address
          </p>
          <p>
            <a href={exp("link")}>Link to e-mail address verification</a>
          </p>
          <p>
            This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
          </p>
          <p>If you didn't create this account, just ignore this message.</p>
        </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template locale={props.locale} themeName={props.themeName} />, props.plainText);
};

export const getSubject: GetSubject = async (_props) => {
  return "Verify email";
};
``` 

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/timofei-iatsenko/keycloakify-emails/blob/main/LICENSE
[package]: https://www.npmjs.com/package/keycloakify-emails
[badge-downloads]: https://img.shields.io/npm/dw/keycloakify-emails.svg
[badge-version]: https://img.shields.io/npm/v/keycloakify-emails.svg
[badge-license]: https://img.shields.io/npm/l/keycloakify-emails.svg
