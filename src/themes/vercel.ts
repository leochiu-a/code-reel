import type { ThemeRegistration } from "shiki";

const VERCEL_SHIKI_THEME: ThemeRegistration = {
  name: "vercel",
  displayName: "Vercel",
  type: "dark",
  fg: "#ededed",
  bg: "#000000",
  settings: [
    {
      settings: {
        foreground: "#ededed",
        background: "#000000",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#a1a1a1",
        fontStyle: "italic",
      },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#00ca50" },
    },
    {
      scope: ["constant", "constant.numeric", "constant.language", "constant.character"],
      settings: { foreground: "#47a8ff" },
    },
    {
      scope: ["keyword", "storage", "storage.type"],
      settings: { foreground: "#ff4d8d" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#ff9300" },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: "#c472fb" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.name.struct",
        "entity.name.enum",
        "entity.name.interface",
        "support.class",
        "support.type",
        "support.type.primitive",
        "support.module",
        "support.type.swift",
        "support.class.swift",
        "support.constant",
        "support.constant.swift",
        "variable.other.class",
      ],
      settings: { foreground: "#c472fb" },
    },
    {
      scope: ["variable.other.property", "support.type.property-name", "meta.object-literal.key"],
      settings: { foreground: "#47a8ff" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#ededed" },
    },
    {
      scope: ["markup.underline.link"],
      settings: {
        foreground: "#00ca50",
        fontStyle: "underline",
      },
    },
    {
      scope: ["markup.inserted", "diff.inserted", "meta.diff.header.to-file"],
      settings: { foreground: "#00952d" },
    },
    {
      scope: ["markup.deleted", "diff.deleted", "meta.diff.header.from-file"],
      settings: { foreground: "#f32e40" },
    },
  ],
};

export default VERCEL_SHIKI_THEME;
