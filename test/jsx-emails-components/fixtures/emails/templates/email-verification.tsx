import {
  GetSubject,
  GetTemplate,
  GetTemplateProps,
} from "../../../../../src/index.js";
import { createVariablesHelper } from "../../../../../src/create-variables-helper.js";
import { render } from "jsx-email";
import * as Fm from "../../../../../src/jsx-email/index.js";

const { exp, v } = createVariablesHelper("email-verification.ftl");

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> {}

export const Template = ({ locale }: TemplateProps) => (
  <div>
    <Fm.If condition="user.firstName?? && user.lastName??">
      <Fm.Then>
        Hello {exp("user.firstName")} {exp("user.lastName")}
      </Fm.Then>
      <Fm.ElseIf condition="firstName??">
        Hello {exp("user.firstName")}
      </Fm.ElseIf>
      <Fm.Else>Hello Guest!</Fm.Else>
    </Fm.If>

    <Fm.Tag name="list" attributes="requiredActions">
      <Fm.Tag name="items" attributes={`as reqActionItem`}>
        Custom Tag
      </Fm.Tag>
    </Fm.Tag>
  </div>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(<Template {...props} />, { plainText: props.plainText });
};

export const getSubject: GetSubject = async (props) => {
  return "email-verification.ftl > Subject" + JSON.stringify(props);
};
