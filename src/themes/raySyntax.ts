import type { ThemeRegistration } from "shiki";

/** A ray.so theme's syntax colours, as its `convertToShikiTheme` takes them. */
export type RaySyntax = {
  foreground: string;
  background: string;
  constant: string;
  string: string;
  comment: string;
  keyword: string;
  parameter: string;
  function: string;
  stringExpression: string;
  punctuation: string;
  link: string;
  number: string;
  property: string;
  objectLiteral?: string;
  diffInserted: string;
  diffDeleted: string;
};

/**
 * Builds a shiki theme from ray.so syntax colours, with the same scope mapping
 * as ray.so's css-variables theme so the code reads as it does there.
 */
export const fromRaySyntax = (name: string, syntax: RaySyntax): ThemeRegistration => ({
  name,
  type: "dark",
  fg: syntax.foreground,
  bg: syntax.background,
  settings: [
    { settings: { foreground: syntax.foreground, background: syntax.background } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: syntax.comment, fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "markup.inline.raw"],
      settings: { foreground: syntax.string },
    },
    {
      scope: ["punctuation.definition.template-expression", "meta.template.expression"],
      settings: { foreground: syntax.stringExpression },
    },
    {
      scope: ["constant", "constant.language", "constant.character", "support.constant"],
      settings: { foreground: syntax.constant },
    },
    { scope: ["constant.numeric"], settings: { foreground: syntax.number } },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier"],
      settings: { foreground: syntax.keyword },
    },
    { scope: ["variable.parameter"], settings: { foreground: syntax.parameter } },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "entity.name.type",
        "entity.name.class",
        "support.class",
        "support.type",
        "entity.name.tag",
      ],
      settings: { foreground: syntax.function },
    },
    {
      scope: [
        "variable.other.property",
        "support.type.property-name",
        "entity.other.attribute-name",
      ],
      settings: { foreground: syntax.property },
    },
    {
      scope: ["meta.object-literal.key"],
      settings: { foreground: syntax.objectLiteral ?? syntax.property },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter", "keyword.operator"],
      settings: { foreground: syntax.punctuation },
    },
    {
      scope: ["markup.underline.link"],
      settings: { foreground: syntax.link, fontStyle: "underline" },
    },
    {
      scope: ["markup.inserted", "diff.inserted", "meta.diff.header.to-file"],
      settings: { foreground: syntax.diffInserted },
    },
    {
      scope: ["markup.deleted", "diff.deleted", "meta.diff.header.from-file"],
      settings: { foreground: syntax.diffDeleted },
    },
  ],
});
