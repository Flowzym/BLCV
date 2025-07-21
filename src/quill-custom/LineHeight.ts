import Quill from "quill";

const Parchment = Quill.import("parchment");

const LineHeightStyle = new Parchment.Attributor.Style(
  "lineheight",
  "line-height",
  {
    scope: Parchment.Scope.BLOCK,
    whitelist: ["1", "1.15", "2", "2.5", "3"],
  },
);

const MarginTopStyle = new Parchment.Attributor.Style(
  "margintop",
  "margin-top",
  {
    scope: Parchment.Scope.BLOCK,
    whitelist: ["0px", "8px", "16px", "24px", "32px"],
  },
);

const MarginBottomStyle = new Parchment.Attributor.Style(
  "marginbottom",
  "margin-bottom",
  {
    scope: Parchment.Scope.BLOCK,
    whitelist: ["0px", "8px", "16px", "24px", "32px"],
  },
);

Quill.register(LineHeightStyle, true);
Quill.register(MarginTopStyle, true);
Quill.register(MarginBottomStyle, true);

export { LineHeightStyle, MarginTopStyle, MarginBottomStyle };
