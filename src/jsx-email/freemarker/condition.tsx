import { PropsWithChildren } from "react";
import { RawOutput } from "./raw-output.js";

/**
 * JSX helper to write a freemarker conditions
 *
 * @example
 * ```jsx
 * <If condition="firstName?? && lastName??">
 *   <Then>
 *     Hello {fmExp('firstName')} {fmExp('lastName')}
 *   </Then>
 *   <ElseIf condition="firstName??">
 *     Hello {fmExp('firstName')}
 *   </ElseIf>
 *   <Else>
 *      Hello Guest!
 *   </Else>
 * </If>
 * ```
 *
 * In a simpler cases you can use `If` without `Then` case:
 *
 * @example
 * ```jsx
 * <If condition="firstName?? && lastName??">
 *   Hello {fmExp('firstName')} {fmExp('lastName')}
 * </If>
 * ```
 */
export const If = ({
  condition,
  children,
}: PropsWithChildren<{ condition: string }>) => (
  <>
    <RawOutput content={`<#if ${condition}>`} />
    {children}
    <RawOutput content="</#if>" />
  </>
);
export const Then = ({ children }: PropsWithChildren) => {
  return children;
};

export const Else = ({ children }: PropsWithChildren) => (
  <>
    <RawOutput content="<#else>"></RawOutput>
    {children}
  </>
);

export const ElseIf = ({
  condition,
  children,
}: PropsWithChildren<{ condition: string }>) => (
  <>
    <RawOutput content={`<#elseif ${condition}>`}></RawOutput>
    {children}
  </>
);
