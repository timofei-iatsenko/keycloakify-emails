import { Text, render } from "jsx-email";
import { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import * as Fm from "keycloakify-emails/jsx-email";
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

export const templateName = "Workflow Notification";

const { exp, v } = createVariablesHelper("workflow-notification.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <h2>{Fm.exp("kcSanitize(msg(subjectKey, daysRemaining, reason))?no_esc")}</h2>

      <Fm.If condition={`${v("messageKey")} == "customMessage"`}>
        <Fm.Then>
          <p>{Fm.exp("kcSanitize(customMessage)?no_esc")}</p>
        </Fm.Then>
        <Fm.Else>
          <p>Dear {Fm.exp("user.firstName!user.username")},</p>

          <p>{Fm.exp("kcSanitize(msg(messageKey, daysRemaining, reason))?no_esc")}</p>

          <Fm.If condition={`${v("daysRemaining")} gt 0`}>
            <p>
              <strong>
                Time remaining: {exp("daysRemaining")} day
                <Fm.If condition={`${v("daysRemaining")} != 1`}>s</Fm.If>
              </strong>
            </p>
          </Fm.If>

          <p>
            If you have questions, please contact your {exp("realmName")} administrator.
          </p>

          <p>
            Best regards,
            <br />
            {exp("realmName")} Administration
          </p>
        </Fm.Else>
      </Fm.If>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Account Notification";
};
