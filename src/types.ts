/**
 * this file should be part of keycloakify integration (be in the package)
 */

export type GetTemplateProps = {
  locale: string;
  themeName: string;
  plainText: boolean;
};

export type GetTemplate = (props: GetTemplateProps) => Promise<string>;
export type GetSubject = (props: {
  locale: string;
  themeName: string;
}) => Promise<string>;
export type GetMessages = (props: {
  locale: string;
  themeName: string;
}) => Record<string, string>;
