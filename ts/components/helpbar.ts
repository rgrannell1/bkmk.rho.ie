// Helpbar — fixed bottom bar showing keybinding chips
// @work.md

import m from "mithril";

type ChipAttrs = {
  binding: string;
  label:   string;
};

function Chip() {
  return {
    view(vnode: m.Vnode<ChipAttrs>) {
      const { binding, label } = vnode.attrs;
      return m("span.helpbar-chip", [
        m("kbd", binding),
        m("span.helpbar-label", label),
      ]);
    },
  };
}

const BINDINGS: ChipAttrs[] = [
  { binding: "/",        label: "search"   },
  { binding: "↑/↓",     label: "navigate" },
  { binding: "↵",        label: "open"     },
  { binding: "Esc",      label: "clear"    },
  { binding: "a",        label: "reauth"   },
  { binding: "tag:",     label: "filter"   },
  { binding: "host:",    label: "host"     },
  { binding: "date:",    label: "date"     },
];

export function Helpbar() {
  return {
    view() {
      return m("footer.helpbar",
        BINDINGS.map(chip =>
          m(Chip(), { binding: chip.binding, label: chip.label })
        )
      );
    },
  };
}
