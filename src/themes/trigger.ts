import type { ThemeRegistration } from "shiki";

const TRIGGER_SHIKI_THEME: ThemeRegistration = {
  name: "trigger-dev",
  displayName: "Trigger.dev",
  type: "dark",
  fg: "#cccbff",
  bg: "#121317",
  settings: [
    {
      settings: {
        foreground: "#cccbff",
        background: "#121317",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#5f6570",
        fontStyle: "italic",
      },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#afec73" },
    },
    {
      scope: ["constant", "constant.numeric", "constant.language", "constant.character"],
      settings: { foreground: "#9c9af2" },
    },
    {
      scope: ["keyword", "storage", "storage.type"],
      settings: { foreground: "#e888f8" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#cccbff" },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: "#9684ff" },
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
      settings: { foreground: "#cccbff" },
    },
    {
      scope: ["variable.other.property", "support.type.property-name", "meta.object-literal.key"],
      settings: { foreground: "#cccbff" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#878c99" },
    },
    {
      scope: ["markup.underline.link"],
      settings: {
        foreground: "#826dff",
        fontStyle: "underline",
      },
    },
    {
      scope: ["constant.numeric"],
      settings: { foreground: "#b5cea8" },
    },
    {
      scope: ["markup.inserted", "diff.inserted", "meta.diff.header.to-file"],
      settings: { foreground: "#2ddc6a" },
    },
    {
      scope: ["markup.deleted", "diff.deleted", "meta.diff.header.from-file"],
      settings: { foreground: "#ff6b6b" },
    },
  ],
};

export default TRIGGER_SHIKI_THEME;
