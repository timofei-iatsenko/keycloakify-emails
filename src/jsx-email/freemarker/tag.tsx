import type { PropsWithChildren } from "react";
import { Raw } from "jsx-email";

/**
 * JSX helper to write a freemarker Tags
 *
 * @example
 * ```jsx
 * <Tag name="list" attributes="requiredActions">
 *   <Tag name="items" attributes={`as reqActionItem`}>
 *     ...
 *   </Tag>
 * </Tag>
 * ```
 */
export const Tag = ({
  name,
  attributes,
  children,
}: PropsWithChildren<{ name: string; attributes: string }>) => (
  <>
    <Raw content={`<#${name} ${attributes}>`} />
    {children}
    <Raw content={`</#${name}>`} />
  </>
);
