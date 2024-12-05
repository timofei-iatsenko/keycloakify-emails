import { Text } from "jsx-email";
import { EmailLayout } from "../layout";
import { render } from "keycloakify-emails/jsx-email";
import {
  GetSubject,
  GetTemplate,
  GetTemplateProps,
  createVariablesHelper,
} from "keycloakify-emails";
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

export const templateName = "Email Update Confirmation";

const { exp } = createVariablesHelper("email-update-confirmation.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <p>
        To update your {exp("realmName")} account with email address {exp("newEmail")},
        click the link below
      </p>
      <p>
        <a href={exp("link")}>{exp("link")}</a>
      </p>
      <p>
        This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
      </p>
      <p>
        If you don't want to proceed with this modification, just ignore this message.
      </p>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, props.plainText);
};

export const getSubject: GetSubject = async (_props) => {
  return "Verify new email";
};
