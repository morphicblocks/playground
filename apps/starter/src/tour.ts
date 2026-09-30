import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// A short guided tour (Driver.js). It opens on every visit until the box
// "Don't show again" is ticked; the Tour button opens it any time. An app of
// your own needs none of this.

const HIDE_KEY = "starter-tour-hidden";

/** A framework term, marked in the theme's accent color. */
const term = (word: string) => `<strong class="term">${word}</strong>`;

const read = (): boolean => {
  try {
    return localStorage.getItem(HIDE_KEY) === "yes";
  } catch {
    return false;
  }
};

const write = (hidden: boolean): void => {
  try {
    if (hidden) localStorage.setItem(HIDE_KEY, "yes");
    else localStorage.removeItem(HIDE_KEY);
  } catch {
    /* private mode: the choice lasts for this visit */
  }
};

export function setUpTour(button: HTMLElement): void {
  let hidden = read();

  const tour = driver({
    showProgress: true,
    progressText: "{{current}} of {{total}}",
    popoverClass: "starter-tour",
    steps: [
      {
        element: "#elements",
        popover: {
          title: "Morphic Block",
          description: `Every ${term("Morphic Block")} has ${term("Elements")} (its parts): a title, an icon, a hint and its code in three languages. Tick an ${term("Element")} to show it on every tile below.`,
        },
      },
      {
        element: "#toolbox",
        popover: {
          title: "Toolbox",
          description: `The ${term("Toolbox")} (a ${term("View")} of all blocks) holds one tile per ${term("Morphic Block")}. Drag a tile into a ${term("Workspace")} or a ${term("Codespace")} to add it to the program.`,
        },
      },
      {
        element: "#toolbox [data-block-type]",
        popover: {
          title: "Element",
          description: `Hover over a tile to see how its ${term("Morphic Block")} is defined: the ${term("Elements")} the tile shows, as they are written in <code>definitions.json</code>.`,
        },
      },
      {
        element: ".view-pane [data-kind]",
        popover: {
          title: "View",
          description: `A ${term("View")} shows the program: as blocks (${term("Workspace")}), as text you can change by dragging (${term("Codespace")}) or as read only text (${term("Preview")}). Both panes switch the same way.`,
        },
      },
      {
        element: ".view-pane [data-language]",
        popover: {
          title: "Mode",
          description: `A ${term("Mode")} picks the ${term("Elements")} a ${term("View")} shows: pseudocode, JavaScript or Python. The program stays the same; only how it is written changes.`,
        },
      },
      {
        element: "#run",
        popover: {
          title: "Run",
          description: "Runs the program and shows what it prints. That is the whole tour.",
        },
      },
    ],
    // Every step carries the choice to skip the tour on the next visit.
    onPopoverRender: (popover) => {
      const label = document.createElement("label");
      label.className = "tour-hide";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = hidden;
      box.addEventListener("change", () => {
        hidden = box.checked;
        write(hidden);
      });
      label.append(box, " Don't show again");
      popover.footer.prepend(label);
    },
  });

  button.addEventListener("click", () => tour.drive());
  if (!hidden) tour.drive();
}
