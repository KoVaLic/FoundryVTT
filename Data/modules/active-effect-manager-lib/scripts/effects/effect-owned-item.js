import CONSTANTS from "../constants.js";
import { error, i18n, info, log } from "../lib/lib.js";
/**
 * Handles all the logic related to the Active Effect itself
 * This is an extension of the core ActiveEffect document class which
 * overrides `update` and `delete` to make them work.
 * @href https://github.com/ElfFriend-DnD/foundryvtt-edit-owned-item-effects
 * THIS IS UNSTABLE, BRITTLE, AND NOT MADE FOR USE BEYOND THIS MODULE'S USE CASE
 */
export class EffectOwnedItem extends ActiveEffect {
    constructor(effect, owner) {
        log(`Attempting instantiation of Owned Item Effect ${effect}`);
        // manually set the parent
        //@ts-ignore
        super(effect, { parent: owner });
        log(`Instantiated Owned Item Effect ${this}`);
    }
    /**
     * Fake Create this effect by instead updating the parent embedded Item document's array of effects.
     */
    async create(context) {
        const dataToCreate = this.toJSON();
        log(`Attempting create on Owned Item Effect ${dataToCreate} ${context}`);
        try {
            //@ts-ignore
            await this._preCreate(dataToCreate, context, game.user); // game.userId
        }
        catch (error) {
            error(error);
        }
        //@ts-ignore
        log(`Updating Parent ${dataToCreate.label}`);
        this.parent?.update({
            //@ts-ignore
            effects: [dataToCreate]
        }, context);
        try {
            //@ts-ignore
            await this._onCreate(dataToCreate, { ...context, renderSheet: false }, game.userId);
        }
        catch (e) {
            error(e);
        }
    }
    /**
     * Fake delete this effect by instead updating the parent embedded Item document's array of effects.
     */
    async delete(context) {
        log(`Attempting delete on Owned Item Effect ${context}`);
        try {
            await this._preDelete(context, game.user);
        }
        catch (error) {
            error(error);
        }
        const effectIdToDelete = this.id;
        const newParentEffects = this.parent?.effects.filter((effect) => effect.id !== effectIdToDelete);
        const newParentEffectsData = [];
        for (const ae of newParentEffects) {
            newParentEffectsData.push(ae);
        }
        log(`Updating Parent, delete effect with id ${effectIdToDelete}, new parent effects ${newParentEffectsData}`);
        this.parent?.update({
            effects: newParentEffectsData
        }, { ...context, recursive: false });
        try {
            await this._onDelete(context, game.userId);
        }
        catch (e) {
            error(e);
        }
        return this;
    }
    /**
     * Fake Update this Effect Document by instead updating the parent embedded Item document's array of effects.
     */
    //@ts-ignore
    async update(data, context = {}) {
        log(`Attempting update on Owned Item Effect ${data} ${context}`);
        const embeddedItem = this.parent;
        //@ts-ignore
        if (!(embeddedItem instanceof Item) && embeddedItem.parent instanceof Actor) {
            log(`Attempted to update a non owned item effect with the owned Item effect update method ${data} ${context}`);
            return;
        }
        //@ts-ignore
        const newEffects = embeddedItem.effects.toObject();
        //@ts-ignore
        const originalEffectIndex = newEffects.findIndex((effect) => effect._id === this.id);
        // means somehow we are editing an effect which does not exist on the item
        if (originalEffectIndex < 0) {
            return;
        }
        // merge updates directly into the array of objects
        //@ts-ignore
        foundry.utils.mergeObject(newEffects[originalEffectIndex], data, context);
        //@ts-ignore
        const diff = foundry.utils.diffObject(this._source, foundry.utils.expandObject(data));
        try {
            await this._preUpdate(diff, context, game.user);
        }
        catch (e) {
            error(e);
        }
        log(`Attempting update on Owned Item Effect ${newEffects}`);
        try {
            await embeddedItem.update({
                //@ts-ignore
                effects: newEffects
            });
        }
        catch (e) {
            error(e);
        }
        try {
            await this._onUpdate(diff, context, game.userId);
        }
        catch (e) {
            error(e);
        }
        this.update(diff);
        this.sheet?.render();
        //@ts-ignore
        if (this.transfer) {
            info(i18n(`${CONSTANTS.MODULE_NAME}.effect.not-reflected`), true);
        }
        //@ts-ignore
        if (!this.transfer && transfer) {
            info(i18n(`${CONSTANTS.MODULE_NAME}.effect.not-transferred`), true);
        }
        return this;
    }
    /**
     * Applies the effect to the grandparent actor.
     */
    async transferToActor() {
        const actor = this.parent?.parent;
        if (!actor || !(actor instanceof Actor)) {
            log("Attempted to Transfer an effect on an unowned item.");
            return;
        }
        log(`Attempting to Transfer an effect with id ${this.uuid} to an Actor ${actor.name}`);
        return ActiveEffect.create({
            ...this.toJSON(),
            origin: this.parent?.uuid
        }, { parent: actor });
    }
    /**
     * Gets default duration values from the provided item.
     * Assumes dnd5e data model, falls back to 1 round default.
     */
    static getDurationFromItem(item, passive) {
        if (passive === true) {
            return undefined;
        }
        // Only for dnd5e for now
        //@ts-ignore
        const hasDuration = !!item?.system?.duration?.value;
        if (hasDuration) {
            const duration = {};
            // Only for dnd5e for now
            //@ts-ignore
            const durationValue = item.system.duration;
            switch (durationValue.units) {
                case "hour":
                    duration.seconds = durationValue?.value * 60 * 60;
                    break;
                case "minute":
                    duration.seconds = durationValue?.value * 60;
                    break;
                case "day":
                    duration.seconds = durationValue?.value * 60 * 60 * 24;
                    break;
                case "month":
                    duration.seconds = durationValue?.value * 60 * 60 * 24 * 28;
                    break;
                case "year":
                    duration.seconds = durationValue?.value * 60 * 60 * 24 * 365;
                    break;
                case "turn":
                    duration.turns = durationValue?.value;
                    break;
                case "round":
                    duration.rounds = durationValue?.value;
                    break;
                default:
                    duration.rounds = 1;
                    break;
            }
            return duration;
        }
        return {
            rounds: 1
        };
    }
    // /**
    //  * Overridden handlers for the buttons on the item sheet effect list
    //  * Assumes core active effect list controls (what 5e uses)
    //  */
    // static onManageOwnedItemActiveEffect(event, owner) {
    //   event.preventDefault();
    //   const a = event.currentTarget;
    //   const li = a.closest("li");
    //   const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    //   const initialEffectFromItem = {
    //     label: owner.name,
    //     icon: owner.img,
    //     origin: owner.uuid,
    //     duration: this.getDurationFromItem(owner, li.dataset.effectType === "passive"),
    //     disabled: li.dataset.effectType === "inactive"
    //   }
    //   const effectData = effect?.toJSON() ?? initialEffectFromItem;
    //   const ownedItemEffect = new EffectOwnedItem(effectData, owner);
    //   switch (a.dataset.action) {
    //     case "create":
    //       return ownedItemEffect.create();
    //     case "transfer":
    //       return ownedItemEffect.transferToActor();
    //     case "delete":
    //       return ownedItemEffect.delete();
    //     case "edit":
    //       return ownedItemEffect.sheet?.render(true);
    //   }
    // }
    static createEffectOnOwnedItem(effectData, item) {
        const parent = item.parent;
        if (!parent) {
            throw new Error("Parent must be provided on the creation context");
        }
        const ownedItemEffect = new this(effectData, parent);
        return ownedItemEffect.create({});
        // or
        //ActiveEffect.create(effectData, item);
    }
}
