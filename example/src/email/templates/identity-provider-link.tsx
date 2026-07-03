import { Text, render } from "jsx-email";
import { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import { createVariablesHelper } from "keycloakify-emails/variables";
import { EmailLayout } from "../layout";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> {}

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

export const templateName = "Identity Provider Link";

const { exp } = createVariablesHelper("identity-provider-link.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <p>
        Someone wants to link your <b>{exp("realmName")}</b> account with
        <b>{exp("identityProviderDisplayName")}</b> account of user
        {exp("identityProviderContext.username")}. If this was you, click the link below
        to link accounts
      </p>
      <p>
        <a href={exp("link")}>Link to confirm account linking</a>
      </p>
      <p>
        This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
      </p>
      <p>
        If you didn&apos;t initiate this process or don&apos;t want to link account, just
        ignore this message. If you link accounts, you will be able to login to
        {exp("realmName")} through {exp("identityProviderDisplayName")}.
      </p>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Link {0}";
};
