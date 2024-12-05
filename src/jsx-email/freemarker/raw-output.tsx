import { JsxEmailComponent } from "jsx-email";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // magic custom element post-processed in render function
      "jsx-email-raw": React.DetailedHTMLProps<
        React.HTMLProps<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export interface RawOutputProps {
  content?: string;
}

// JSX Emails is escaping  a proper freemarker syntax <#if>
// We use a comment-style syntax <!-- <#if> --> and then replace it
// back to freemarker after render
export const RawOutput: JsxEmailComponent<RawOutputProps> = (props) => (
  <>
    <jsx-email-raw
      dangerouslySetInnerHTML={{ __html: `<!-- ${props.content} -->` }}
    />
  </>
);
