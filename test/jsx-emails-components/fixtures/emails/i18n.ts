import { GetMessages } from "../../../../src/index.js";

export const getMessages: GetMessages = (props) => {
  return {
    key: "EN value" + JSON.stringify(props),
  };
};
