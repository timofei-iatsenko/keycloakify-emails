import {
  GetSubject,
  GetTemplate,
  GetTemplateProps,
} from "../../../../../../src/index.js";

export const getTemplate: GetTemplate = async (props) => {
  return "email-verification.ftl > template " + JSON.stringify(props);
};

export const getSubject: GetSubject = async (props) => {
  return "email-verification.ftl > Subject" + JSON.stringify(props);
};
