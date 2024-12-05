export type GetTemplateProps<T extends string = string> = {
  locale: string;
  themeName: T;
  plainText: boolean;
};

export type GetTemplate<T extends string = string> = (
  props: GetTemplateProps<T>,
) => Promise<string>;
export type GetSubject<T extends string = string> = (props: {
  locale: string;
  themeName: T;
}) => Promise<string>;
export type GetMessages<T extends string = string> = (props: {
  locale: string;
  themeName: T;
}) => Record<string, string>;
