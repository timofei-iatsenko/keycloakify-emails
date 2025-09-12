import { render, Text } from "jsx-email";
import { GetSubject, GetTemplate, GetTemplateProps } from "keycloakify-emails";
import * as Fm from "keycloakify-emails/jsx-email";
import { ReactNode } from "react";
import { createVariablesHelper } from "keycloakify-emails/variables";
import { EmailLayout } from "../layout";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> {}

const paragraph = {
  color: "#777",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

// Helper component to create a Freemarker expression for the list
const FmList = (props: { value: string; itemAs: string; children: ReactNode }) => (
  <>
    <Fm.Tag name="list" attributes={props.value}>
      <Fm.Tag name="items" attributes={`as ${props.itemAs}`}>
        {props.children}
      </Fm.Tag>
    </Fm.Tag>
  </>
);

const { exp } = createVariablesHelper("executeActions.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      Your administrator has just requested that you update your {exp("realmName")}{" "}
      account by performing the following action(s):
      <Fm.If condition="requiredActions??">
        <ul>
          <FmList value="requiredActions" itemAs="reqActionItem">
            <li>
              <Fm.If condition={`reqActionItem == 'UPDATE_PASSWORD'`}>
                Update Password
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'UPDATE_PROFILE'`}>
                Update Profile
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'TERMS_AND_CONDITIONS'`}>
                Terms and Conditions
              </Fm.If>
              <Fm.If condition={`reqActionItem == 'CONFIGURE_TOTP'`}>Configure OTP</Fm.If>
              <Fm.If condition={`reqActionItem == 'VERIFY_EMAIL'`}>Verify Email</Fm.If>
              <Fm.If condition={`reqActionItem == 'CONFIGURE_RECOVERY_AUTHN_CODES'`}>
                Generate Recovery Codes
              </Fm.If>
            </li>
          </FmList>
        </ul>
      </Fm.If>
      <p>
        Click on the link below to start this process.
        <a href={exp("link")}>Link to account update</a>
      </p>
      <p>
        This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
      </p>
      <p>
        If you are unaware that your administrator has requested this, just ignore this
        message and nothing will be changed.
      </p>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (_props) => {
  return "Update Your Account";
};
