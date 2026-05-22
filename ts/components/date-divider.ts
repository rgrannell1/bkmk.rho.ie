// DateDivider — date group separator rendered between runs of different-date bookmarks
// @work.md

import m from "mithril";
import dayjs from "dayjs";

type DividerAttrs = {
  date: string;
};

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format("DD MMM YYYY");
}

export function DateDivider() {
  return {
    view(vnode: m.Vnode<DividerAttrs>) {
      return m("div.date-divider",
        m("span.date-divider-text", formatDate(vnode.attrs.date))
      );
    },
  };
}
