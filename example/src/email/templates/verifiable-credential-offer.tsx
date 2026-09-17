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

export const templateName = "Verifiable Credential Offer";

const { exp } = createVariablesHelper("verifiable-credential-offer.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <p>
        Your administrator has just informed you that in your {exp("realmName")}
        account you can claim verifiable credential
        <b>{exp("credentialScopeDisplayName")}</b> to your digital wallet. Click on the
        link below to start this process.
      </p>
      <p>
        <a href={exp("link")}>Link to claim {exp("credentialScopeDisplayName")}</a>
      </p>
      <p>
        This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
      </p>
      <p>
        If the link is expired already, you might be still able to claim your
        {exp("credentialScopeDisplayName")} by some other means (For example by using
        {exp("realmName")} account console).
      </p>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Verifiable Credential Offer";
};
