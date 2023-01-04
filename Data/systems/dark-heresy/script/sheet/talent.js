import { DarkHeresyItemSheet } from "./item.js";

export class TalentSheet extends DarkHeresyItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dark-heresy", "sheet", "talent"],
            template: "systems/dark-heresy/template/sheet/talent.html",
            width: 600,
            height: 369,
            resizable: true,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "stats",
                },
            ]
        });
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons = [].concat(buttons);
        return buttons;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
