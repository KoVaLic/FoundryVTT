var _a;
import CONSTANTS from "../constants.js";
import { log } from "../lib/lib.js";
export class DropEffectsOnItems {
}
_a = DropEffectsOnItems;
DropEffectsOnItems.init = async () => {
    log(`${CONSTANTS.MODULE_NAME} | Initializing ${CONSTANTS.MODULE_NAME}`);
    Hooks.on("renderItemSheet", _a.handleItemSheetRender);
};
DropEffectsOnItems.handleItemSheetRender = (app, html) => {
    const effectsList = html.find(".effects-list");
    if (!effectsList) {
        return;
    }
    const dragDrop = new DragDrop({
        dragSelector: "[data-effect-id]",
        dropSelector: ".effects-list",
        permissions: {
            dragstart: () => true,
            //@ts-ignore
            dragdrop: () => app.isEditable && !app.item.isOwned
        },
        callbacks: { dragstart: _a._onDragStart(app.object), drop: _a._onDrop(app.object) }
    });
    log("binding dragdrop", dragDrop);
    dragDrop.bind(html[0]);
};
/**
 * The Drag Start event which populates data to create an effect on drop
 * @param {*} event
 */
DropEffectsOnItems._onDragStart = (effectParent) => (event) => {
    if (!effectParent) {
        log("DragDrop _onDragStart no parent", {
            effectParent
        });
        return;
    }
    const li = event.currentTarget;
    const effectId = li.dataset?.effectId;
    if (!effectId) {
        return;
    }
    const effect = effectParent.effects.get(effectId);
    if (!effect) {
        return;
    }
    // outputs the type and uuid
    const dragData = effect.toDragData();
    log("DragDrop dragStart:", {
        effect,
        dragData
    });
    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
};
/**
 * When an effect is dropped on the sheet, create a copy of that effect
 */
DropEffectsOnItems._onDrop = (effectParent) => async (event) => {
    log("DragDrop dropping");
    if (!effectParent) {
        return;
    }
    // Try to extract the data
    let dropData;
    try {
        dropData = JSON.parse(event.dataTransfer.getData("text/plain"));
        log("DragDrop drop", {
            event,
            dropData
        });
    }
    catch (err) {
        log("DragDrop drop", {
            err
        });
        return false;
    }
    if (dropData.type !== "ActiveEffect") {
        return false;
    }
    //@ts-ignore
    const effectDocument = await ActiveEffect.implementation.fromDropData(dropData);
    if (!effectDocument) {
        return false;
    }
    log("DragDrop drop starting:", {
        effectParent,
        dropData,
        effectDocument
    });
    // create the new effect but make the 'origin' the new parent item
    return ActiveEffect.create({
        ...effectDocument.toObject(),
        origin: effectParent.uuid
    }, { parent: effectParent });
};
