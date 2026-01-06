import type { ThemeRegistration } from "shiki";

const PRISMA_SHIKI_THEME: ThemeRegistration = {
  name: "prisma",
  displayName: "Prisma",
  type: "dark",
  fg: "#ffffff",
  bg: "#0b0f1c",
  settings: [
    {
      settings: {
        foreground: "#ffffff",
        background: "#0b0f1c",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#718096", fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
      settings: { foreground: "#71E8DF" },
    },
    {
      scope: ["constant", "constant.numeric", "constant.language", "constant.character"],
      settings: { foreground: "#7F9CF5" },
    },
    {
      scope: ["keyword", "storage", "storage.type"],
      settings: { foreground: "#71E8DF" },
    },
    {
      scope: ["variable", "variable.parameter", "variable.other.readwrite"],
      settings: { foreground: "#71E8DF" },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: "#7F9CF5" },
    },
    {
      scope: ["entity.name.type", "support.type", "support.class", "support.type.primitive"],
      settings: { foreground: "#7F9CF5" },
    },
    {
      scope: ["variable.other.property", "support.type.property-name", "meta.object-literal.key"],
      settings: { foreground: "#71E8DF" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#ffffff" },
    },
    {
      scope: ["markup.underline.link"],
      settings: { foreground: "#7F9CF5", fontStyle: "underline" },
    },
    {
      scope: ["markup.inserted", "diff.inserted", "meta.diff.header.to-file"],
      settings: { foreground: "#16A394" },
    },
    {
      scope: ["markup.deleted", "diff.deleted", "meta.diff.header.from-file"],
      settings: { foreground: "#FC8280" },
    },
  ],
};

export default PRISMA_SHIKI_THEME;
