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

export const templateName = "User Disabled By Permanent Lockout";

const { exp } = createVariablesHelper("event-user_disabled_by_permanent_lockout.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <p>
        Your user has been disabled permanently because of multiple failed attempts on{" "}
        {exp("event.date")}. Please contact an administrator.
      </p>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "User disabled by permanent lockout";
};
