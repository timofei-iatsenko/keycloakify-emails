/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { render, Text, Img, Container } from "jsx-email";
import { EmailLayout } from "../layout";
import { createVariablesHelper } from "keycloakify-emails/variables";
import { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
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

export const templateName = "Email Test";

const { exp } = createVariablesHelper("email-test.ftl");

const baseUrl = import.meta.isJsxEmailPreview ? "/assets" : "${url.resourcesUrl}";

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={"Here is a preview"} locale={locale}>
    <Container>
      <Img src={`${baseUrl}/kc-logo.png`} alt="KC Logo" width="83" height="75" />
    </Container>
    <Text style={paragraph}>This is a test message from {exp("realmName")}</Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "[KEYCLOAK] - SMTP test message";
};
