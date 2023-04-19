import FoundryHelpers from "./foundry-helpers.js";
import { registerSocket } from "../socket.js";
import EffectHandler from "./effect-handler.js";
import { errorM, isGMConnected } from "./effect-utility.js";
import CustomEffectsHandler from "./effect-custom-handler.js";
import { Constants } from "../effects-public/effect.js";
import "../api.js";
import "./effect-helpers.js";
/**
 * Interface for working with effects and executing them as a GM via sockets
 */
export default class EffectInterface {
    constructor(moduleName) {
        this._customEffectsHandler = new CustomEffectsHandler();
        this.moduleName = moduleName;
        this._effectHandler = new EffectHandler(moduleName);
        this._foundryHelpers = new FoundryHelpers();
        this._customEffectsHandler = new CustomEffectsHandler();
        this._socket = registerSocket();
    }
    /**
     * Initializes the socket and registers the socket functions
     */
    initialize(moduleName = "") {
        //this._socket = registerSocket();
        if (moduleName) {
            this.moduleName = moduleName;
            this._effectHandler = new EffectHandler(moduleName);
        }
    }
    /**
     * Toggles the effect on the provided actor UUIDS as the GM via sockets
     *
     * @param {string} effectName - name of the effect to toggle
     * @param {string} overlay - name of the effect to toggle
     * @param {string[]} uuids - UUIDS of the actors to toggle the effect on
     * @param {string[]} withSocket - use socket library for execute as GM
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async toggleEffect(effectName, overlay = false, uuids = [], withSocket = true) {
        if (uuids.length === 0) {
            uuids = this._foundryHelpers.getActorUuids();
        }
        if (uuids.length === 0) {
            errorM(this.moduleName, `Please select or target a token to toggle ${effectName}`, true);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("toggleEffect", effectName, overlay, uuids);
        }
        else {
            return this._effectHandler.toggleEffect(effectName, overlay, uuids);
        }
    }
    /**
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     * @deprecated remove from dfreds
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is applied to
     * @param {string[]} withSocket - use socket library for execute as GM
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    hasEffectApplied(effectName, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("hasEffectApplied", effectName, uuid);
        }
        else {
            return this._effectHandler.hasEffectApplied(effectName, uuid);
        }
    }
    /**
     * Removes the effect from the provided actor UUID as the GM via sockets
     *
     * @param {object} params - the effect params
     * @param {string} params.effectName - the name of the effect to remove
     * @param {string} params.uuid - the UUID of the actor to remove the effect from
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async removeEffect(effectName, uuid, withSocket = true) {
        const actor = this._foundryHelpers.getActorByUuid(uuid);
        if (!actor) {
            errorM(this.moduleName, `Actor ${uuid} could not be found`, true);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("removeEffect", {
                effectName,
                uuid
            });
        }
        else {
            return this._effectHandler.removeEffect(effectName, uuid);
        }
    }
    /**
     * Adds the effect to the provided actor UUID as the GM via sockets
     *
     * @param {string} effectName - the name of the effect to add
     * @param {string} effectData - the active effect data to add // mod 4535992
     * @param {string} uuid - the UUID of the actor to add the effect to
     * @param {string} origin - the origin of the effect
     * @param {string} overlay - if the effect is an overlay or not
     * @param {string} metadata - the metadata of the effect
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async addEffect(effectName, effectData, uuid, origin, overlay, metadata = undefined, withSocket = true) {
        const actor = this._foundryHelpers.getActorByUuid(uuid);
        if (!actor) {
            errorM(this.moduleName, `Actor ${uuid} could not be found`);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("addEffect", effectName, effectData, uuid, origin, overlay, metadata);
        }
        else {
            return this._effectHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
        }
    }
    /**
     * Adds the defined effect to the provided actor UUID as the GM via sockets
     *
     * @param {object} effectData - the object containing all of the relevant effect data
     * @param {string} uuid - the UUID of the actor to add the effect to
     * @param {string} origin - the origin of the effect
     * @param {boolean} overlay - if the effect is an overlay or not
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async addEffectWith(effectData, uuid, origin, overlay, metadata = undefined, withSocket = true) {
        // const effect = new Effect(effectData);
        const actor = this._foundryHelpers.getActorByUuid(uuid);
        if (!actor) {
            errorM(this.moduleName, `Actor ${uuid} could not be found`, true);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            const effectName = null; // TODO 2022-07-09
            return this._socket.executeAsGM("addEffect", effectName, effectData, uuid, origin, overlay, metadata);
        }
        else {
            const effectName = undefined; // TODO 2022-07-09;
            return this._effectHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
        }
    }
    // ============================================================
    // Additional feature for retrocompatibility
    // ============================================================
    // ====================================================================
    // ACTOR MANAGEMENT
    // ====================================================================
    /**
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is applied to
     * @param {string} includeDisabled - if true include the applied disabled effect
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    hasEffectAppliedOnActor(effectName, uuid, includeDisabled, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("hasEffectAppliedOnActor", effectName, uuid, includeDisabled);
        }
        else {
            return this._effectHandler.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
        }
    }
    /**
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectId - the id of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is applied to
     * @param {string} includeDisabled - if true include the applied disabled effect
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("hasEffectAppliedFromIdOnActor", effectId, uuid, includeDisabled);
        }
        else {
            return this._effectHandler.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
        }
    }
    /**
     * Removes the effect with the provided name from an actor matching the
     * provided UUID
     *
     * @param {string} effectName - the name of the effect to remove
     * @param {string} uuid - the uuid of the actor to remove the effect from
     */
    async removeEffectOnActor(effectName, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("removeEffectOnActor", effectName, uuid);
        }
        else {
            return this._effectHandler.removeEffectOnActor(effectName, uuid);
        }
    }
    /**
     * Removes the effect with the provided name from an actor matching the
     * provided UUID
     *
     * @param {string} effectId - the id of the effect to remove
     * @param {string} uuid - the uuid of the actor to remove the effect from
     */
    async removeEffectFromIdOnActor(effectId, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("removeEffectFromIdOnActor", effectId, uuid);
        }
        else {
            return this._effectHandler.removeEffectFromIdOnActor(effectId, uuid);
        }
    }
    /**
     * Adds the effect with the provided name to an actor matching the provided
     * UUID
     *
     * @param {string} effectName - the name of the effect to add
     * @param {string} uuid - the uuid of the actor to add the effect to
     */
    async addEffectOnActor(effectName, uuid, effect, withSocket = true) {
        if (!uuid) {
            errorM(this.moduleName, `Actor ${uuid} could not be found`, true);
            return undefined;
        }
        if (!effect) {
            errorM(this.moduleName, `Effect ${effectName} could not be found`, true);
            return undefined;
        }
        // if (effect.nestedEffects.length > 0) {
        //   effect = await this.getNestedEffectSelection(effect);
        // }
        const label = effect.label ? effect.label : effect.name;
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("addEffectOnActor", label, uuid, undefined, false, effect);
        }
        else {
            return this._effectHandler.addEffectOnActor(label, uuid, "", false, effect);
        }
    }
    async toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay, withSocket = true) {
        if (effectId.length === 0) {
            errorM(this.moduleName, `Please select or target a active effect to toggle ${effectId}`, true);
            return undefined;
        }
        const actor = game.actors?.get(uuid);
        const effect = actor.effects.find((entity) => {
            return entity.id === effectId;
        });
        if (!effect) {
            errorM(this.moduleName, `Effect ${effectId} was not found`, true);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("toggleEffectFromIdOnActor", effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
        else {
            return this._effectHandler.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
    }
    /**
     * Adds the effect with the provided name to an actor matching the provided
     * UUID
     *
     * @param {string} uuid - the uuid of the actor to add the effect to
     * @param {string} activeEffectData - the name of the effect to add
     * @param {boolean} overlay - if the effect is an overlay or not
     */
    async addActiveEffectOnActor(uuid, activeEffectData, overlay = false, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("addActiveEffectOnActor", uuid, activeEffectData, overlay);
        }
        else {
            return this._effectHandler.addActiveEffectOnActor(uuid, activeEffectData, overlay);
        }
    }
    /**
     * Toggles the effect on the provided actor UUIDS as the GM via sockets
     *
     * @param {string} effectName - name of the effect to toggle
     * @param {string} uuid - UUID of the actor to toggle the effect on
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async findEffectByNameOnActor(effectName, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("findEffectByNameOnActor", effectName, uuid);
        }
        else {
            return this._effectHandler.findEffectByNameOnActor(effectName, uuid);
        }
    }
    /**
     * Toggles the effect on the provided actor UUIDS as the GM via sockets
     *
     * @param {string} effectId - name of the effect to toggle
     * @param {string} uuid - UUID of the actor to toggle the effect on
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async findEffectByIdOnActor(effectId, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("findEffectByIdOnActor", effectId, uuid);
        }
        else {
            return this._effectHandler.findEffectByIdOnActor(effectId, uuid);
        }
    }
    // ====================================================================
    // TOKEN MANAGEMENT
    // ====================================================================
    /**
     * Checks to see if any of the current active effects applied to the token
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the token to see if the effect is applied to
     * @param {string} includeDisabled - if true include the applied disabled effect
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    hasEffectAppliedOnToken(effectName, uuid, includeDisabled, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("hasEffectAppliedOnToken", effectName, uuid, includeDisabled);
        }
        else {
            return this._effectHandler.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
        }
    }
    /**
     * Checks to see if any of the current active effects applied to the token
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectId - the id of the effect to check
     * @param {string} uuid - the uuid of the token to see if the effect is applied to
     * @param {string} includeDisabled - if true include the applied disabled effect
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("hasEffectAppliedFromIdOnToken", effectId, uuid, includeDisabled);
        }
        else {
            return this._effectHandler.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
        }
    }
    /**
     * Removes the effect with the provided name from an token matching the
     * provided UUID
     *
     * @param {string} effectName - the name of the effect to remove
     * @param {string} uuid - the uuid of the token to remove the effect from
     */
    async removeEffectOnToken(effectName, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("removeEffectOnToken", effectName, uuid);
        }
        else {
            return this._effectHandler.removeEffectOnToken(effectName, uuid);
        }
    }
    /**
     * Removes the effect with the provided name from an token matching the
     * provided UUID
     *
     * @param {string} effectId - the id of the effect to remove
     * @param {string} uuid - the uuid of the token to remove the effect from
     */
    async removeEffectFromIdOnToken(effectId, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("removeEffectFromIdOnToken", effectId, uuid);
        }
        else {
            return this._effectHandler.removeEffectFromIdOnToken(effectId, uuid);
        }
    }
    /**
     * Removes the effect with the provided name from an token matching the
     * provided UUID
     *
     * @param {string} effectIds - the id of the effect to remove
     * @param {string} uuid - the uuid of the token to remove the effect from
     */
    async removeEffectFromIdOnTokenMultiple(effectIds, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("removeEffectFromIdOnTokenMultiple", effectIds, uuid);
        }
        else {
            return this._effectHandler.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
        }
    }
    /**
     * Adds the effect with the provided name to an token matching the provided
     * UUID
     *
     * @param {string} effectName - the name of the effect to add
     * @param {string} uuid - the uuid of the token to add the effect to
     */
    async addEffectOnToken(effectName, uuid, effect, withSocket = true) {
        if (!uuid) {
            errorM(this.moduleName, `Token ${uuid} could not be found`, true);
            return undefined;
        }
        if (!effect) {
            errorM(this.moduleName, `Effect ${effectName} could not be found`, true);
            return undefined;
        }
        // if (effect.nestedEffects.length > 0) {
        //   effect = await this.getNestedEffectSelection(effect);
        // }
        const label = effect.label ? effect.label : effect.name;
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("addEffectOnToken", label, uuid, undefined, false, effect);
        }
        else {
            return this._effectHandler.addEffectOnToken(label, uuid, "", false, effect);
        }
    }
    async toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay, withSocket = true) {
        if (effectId.length === 0) {
            errorM(this.moduleName, `Please select or target a active effect to toggle ${effectId}`, true);
            return undefined;
        }
        const token = this._foundryHelpers.getTokenByUuid(uuid);
        //@ts-ignore
        const actorEffects = token.actor?.effects?.contents || [];
        const effect = actorEffects.find(
        //@ts-ignore
        (activeEffect) => activeEffect?._id === effectId);
        // if (!effect) return undefined;
        if (!effect) {
            errorM(this.moduleName, `Effect ${effectId} was not found`, true);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("toggleEffectFromIdOnToken", effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
        else {
            return this._effectHandler.toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
    }
    async toggleEffectFromDataOnToken(effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay, withSocket = true) {
        if (!effect) {
            errorM(this.moduleName, `Effect ${effect} was not found`, true);
            return undefined;
        }
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("toggleEffectFromDataOnToken", effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
        else {
            return this._effectHandler.toggleEffectFromDataOnToken(effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
    }
    /**
     * Adds the effect with the provided name to an token matching the provided
     * UUID
     *
     * @param {string} uuid - the uuid of the token to add the effect to
     * @param {string} activeEffectData - the name of the effect to add
     * @param {boolean} overlay - if the effect is an overlay or not
     */
    async addActiveEffectOnToken(uuid, activeEffectData, overlay = false, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("addActiveEffectOnToken", uuid, activeEffectData, overlay);
        }
        else {
            return this._effectHandler.addActiveEffectOnToken(uuid, activeEffectData, overlay);
        }
    }
    /**
     * Toggles the effect on the provided token UUIDS as the GM via sockets
     *
     * @param {string} effectName - name of the effect to toggle
     * @param {string} uuid - UUID of the token to toggle the effect on
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async findEffectByNameOnToken(effectName, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("findEffectByNameOnToken", effectName, uuid);
        }
        else {
            return this._effectHandler.findEffectByNameOnToken(effectName, uuid);
        }
    }
    /**
     * Toggles the effect on the provided token UUIDS as the GM via sockets
     *
     * @param {string} effectId - name of the effect to toggle
     * @param {string} uuid - UUID of the token to toggle the effect on
     * @returns {Promise} a promise that resolves when the GM socket function completes
     */
    async findEffectByIdOnToken(effectId, uuid, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("findEffectByIdOnToken", effectId, uuid);
        }
        else {
            return this._effectHandler.findEffectByIdOnToken(effectId, uuid);
        }
    }
    async updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("updateEffectFromIdOnToken", effectId, uuid, origin, overlay, effectUpdated);
        }
        else {
            return this._effectHandler.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        }
    }
    async updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("updateEffectFromNameOnToken", effectName, uuid, origin, overlay, effectUpdated);
        }
        else {
            return this._effectHandler.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        }
    }
    async updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("updateActiveEffectFromIdOnToken", effectId, uuid, origin, overlay, effectUpdated);
        }
        else {
            return this._effectHandler.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        }
    }
    async updateActiveEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated, withSocket = true) {
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("updateActiveEffectFromNameOnToken", effectName, uuid, origin, overlay, effectUpdated);
        }
        else {
            return this._effectHandler.updateActiveEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        }
    }
    // ==================================================================
    async onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled, withSocket = true) {
        // if (withSocket && isGMConnected()) {
        //   return this._socket.executeAsGM(
        //     'onManageActiveEffectFromEffectId',
        //     effectActions,
        //     owner,
        //     effectId,
        //     alwaysDelete,
        //     forceEnabled,
        //     forceDisabled,
        //     isTemporary,
        //     isDisabled,
        //   );
        // } else {
        return this._effectHandler.onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        // }
    }
    /**
     * Manage Active Effect instances through the Actor Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {Actor|Item} owner      The owning document which manages this effect
     * @returns {Promise|null}        Promise that resolves when the changes are complete.
     */
    async onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled, withSocket = true) {
        // if (withSocket && isGMConnected()) {
        //   return this._socket.executeAsGM(
        //     'onManageActiveEffectFromEffect',
        //     effectActions,
        //     owner,
        //     effect,
        //     alwaysDelete,
        //     forceEnabled,
        //     forceDisabled,
        //     isTemporary,
        //     isDisabled,
        //   );
        // } else {
        return this._effectHandler.onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        // }
    }
    /**
     * Manage Active Effect instances through the Actor Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {Actor|Item} owner      The owning document which manages this effect
     * @returns {Promise|null}        Promise that resolves when the changes are complete.
     */
    async onManageActiveEffectFromActiveEffect(effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled, withSocket = true) {
        // if (withSocket && isGMConnected()) {
        //   return this._socket.executeAsGM(
        //     'onManageActiveEffectFromActiveEffect',
        //     effectActions,
        //     owner,
        //     activeEffect,
        //     alwaysDelete,
        //     forceEnabled,
        //     forceDisabled,
        //     isTemporary,
        //     isDisabled,
        //   );
        // } else {
        return await this._effectHandler.onManageActiveEffectFromActiveEffect(effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        // }
    }
    // 2023-02-25
    /**
     * Searches through the list of available effects and returns one matching the
     * effect name. Prioritizes finding custom effects first.
     *
     * @param {string} effectName - the effect name to search for
     * @returns {ActiveEffect} the found effect
     */
    findEffectByName(effectName, withSocket = true) {
        // const effect = this.findCustomEffectByName(effectName);
        // if (effect) return effect;
        // return API.effects.all.find((effect) => effect.label == effectName);
        const uuids = this._foundryHelpers.getActorUuids();
        if (withSocket && isGMConnected()) {
            return this._socket.executeAsGM("findEffectByNameOnToken", effectName, uuids[0]);
        }
        else {
            return this._effectHandler.findEffectByNameOnToken(effectName, uuids[0]);
        }
    }
    // /**
    //  * Searches through the list of available custom effects and returns one matching the
    //  * effect name.
    //  *
    //  * @param {string} effectName - the effect name to search for
    //  * @returns {ActiveEffect} the found effect
    //  */
    // findCustomEffectByName(effectName) {
    // 	const effect = this._customEffectsHandler.getCustomEffects().find((effect) => effect.label == effectName);
    // 	return effect;
    // }
    // /**
    //  * Toggles the effect on the provided actor UUIDS as the GM via sockets. If no actor
    //  * UUIDs are provided, it finds one of these in this priority:
    //  *
    //  * 1. The targeted tokens (if prioritize targets is enabled)
    //  * 2. The currently selected tokens on the canvas
    //  * 3. The user configured character
    //  *
    //  * @param {string} effectName - name of the effect to toggle
    //  * @param {object} params - the effect parameters
    //  * @param {boolean} params.overlay - if the effect is an overlay or not
    //  * @param {string[]} params.uuids - UUIDS of the actors to toggle the effect on
    //  * @returns {Promise} a promise that resolves when the GM socket function completes
    //  */
    // async toggleEffect(effectName, { overlay, uuids = <any[]>[] } = {}) {
    // 	if (uuids.length == 0) {
    // 		uuids = <any[]>this._foundryHelpers.getActorUuids();
    // 	}
    // 	if (uuids.length == 0) {
    // 		ui.notifications.error(`Please select or target a token to toggle ${effectName}`);
    // 		return;
    // 	}
    // 	let effect = this.findEffectByName(effectName);
    // 	if (!effect) {
    // 		ui.notifications.error(`Effect ${effectName} was not found`);
    // 		return;
    // 	}
    // 	if (this.hasNestedEffects(effect)) {
    // 		effect = await this._getNestedEffectSelection(effect);
    // 		if (!effect) return; // dialog closed without selecting one
    // 	}
    // 	return this._socket.executeAsGM("toggleEffect", effect.label, {
    // 		overlay,
    // 		uuids,
    // 	});
    // }
    // /**
    //  * Checks to see if any of the current active effects applied to the actor
    //  * with the given UUID match the effect name and are a convenient effect
    //  *
    //  * @param {string} effectName - the name of the effect to check
    //  * @param {string} uuid - the uuid of the actor to see if the effect is
    //  * applied to
    //  * @returns {boolean} true if the effect is applied, false otherwise
    //  */
    // hasEffectApplied(effectName, uuid) {
    // 	return this._effectHandler.hasEffectApplied(effectName, uuid);
    // }
    // /**
    //  * Removes the effect from the provided actor UUID as the GM via sockets
    //  *
    //  * @param {object} params - the effect params
    //  * @param {string} params.effectName - the name of the effect to remove
    //  * @param {string} params.uuid - the UUID of the actor to remove the effect from
    //  * @param {string | undefined} params.origin - only removes the effect if the origin
    //  * matches. If undefined, removes any effect with the matching name
    //  * @returns {Promise} a promise that resolves when the GM socket function completes
    //  */
    // async removeEffect({ effectName, uuid, origin }) {
    // 	let effect = this.findEffectByName(effectName);
    // 	if (!effect) {
    // 		ui.notifications.error(`Effect ${effectName} could not be found`);
    // 		return;
    // 	}
    // 	const actor = this._foundryHelpers.getActorByUuid(uuid);
    // 	if (!actor) {
    // 		ui.notifications.error(`Actor ${uuid} could not be found`);
    // 		return;
    // 	}
    // 	if (this.hasNestedEffects(effect)) {
    // 		effect = await this._getNestedEffectSelection(effect);
    // 		if (!effect) return; // dialog closed without selecting one
    // 	}
    // 	return this._socket.executeAsGM("removeEffect", {
    // 		effectName: effect.label,
    // 		uuid,
    // 		origin,
    // 	});
    // }
    // /**
    //  * Adds the effect to the provided actor UUID as the GM via sockets
    //  *
    //  * @param {object} params - the params for adding an effect
    //  * @param {string} params.effectName - the name of the effect to add
    //  * @param {string} params.uuid - the UUID of the actor to add the effect to
    //  * @param {string} params.origin - the origin of the effect
    //  * @param {boolean} params.overlay - if the effect is an overlay or not
    //  * @param {object} params.metadata - additional contextual data for the application of the effect (likely provided by midi-qol)
    //  * @returns {Promise} a promise that resolves when the GM socket function completes
    //  */
    // async addEffect({ effectName, uuid, origin, overlay, metadata }) {
    // 	let effect = this.findEffectByName(effectName);
    // 	if (!effect) {
    // 		ui.notifications.error(`Effect ${effectName} could not be found`);
    // 		return;
    // 	}
    // 	const actor = this._foundryHelpers.getActorByUuid(uuid);
    // 	if (!actor) {
    // 		ui.notifications.error(`Actor ${uuid} could not be found`);
    // 		return;
    // 	}
    // 	if (this.hasNestedEffects(effect) > 0) {
    // 		effect = await this._getNestedEffectSelection(effect);
    // 		if (!effect) return; // dialog closed without selecting one
    // 	}
    // 	return this._socket.executeAsGM("addEffect", {
    // 		effect: { ...effect },
    // 		uuid,
    // 		origin,
    // 		overlay,
    // 	});
    // }
    // /**
    //  * Adds the defined effect to the provided actor UUID as the GM via sockets
    //  *
    //  * @param {object} params - the params for adding an effect
    //  * @param {object} params.effectData - the object containing all of the relevant effect data
    //  * @param {string} params.uuid - the UUID of the actor to add the effect to
    //  * @param {string} params.origin - the origin of the effect
    //  * @param {boolean} params.overlay - if the effect is an overlay or not
    //  * @returns {Promise} a promise that resolves when the GM socket function completes
    //  */
    // async addEffectWith({ effectData, uuid, origin, overlay }) {
    // 	let effect = createActiveEffect({ ...effectData, origin });
    // 	const actor = this._foundryHelpers.getActorByUuid(uuid);
    // 	if (!actor) {
    // 		ui.notifications.error(`Actor ${uuid} could not be found`);
    // 		return;
    // 	}
    // 	if (this.hasNestedEffects(effect)) {
    // 		effect = await this._getNestedEffectSelection(effect);
    // 		if (!effect) return; // dialog closed without selecting one
    // 	}
    // 	return this._socket.executeAsGM("addEffect", {
    // 		effect: { ...effect },
    // 		uuid,
    // 		origin,
    // 		overlay,
    // 	});
    // }
    /**
     * Creates new custom effects with the provided active effect data.
     *
     * @param {object} params - the params for adding an effect
     * @param {ActiveEffect[]} params.activeEffects - array of active effects to add
     * @returns {Promise} a promise that resolves when the active effects have finished being added
     */
    createNewCustomEffectsWith({ activeEffects }) {
        return this._customEffectsHandler.createNewCustomEffectsWith({
            activeEffects
        });
    }
    /**
     * Checks if the given effect has nested effects
     *
     * @param {ActiveEffect} effect - the active effect to check the nested effets on
     * @returns
     */
    async hasNestedEffects(effect, withSocket = true) {
        const nestedEffects = getProperty(effect, `flags.${Constants.MODULE_ID}.${Constants.FLAGS.NESTED_EFFECTS}`) ?? [];
        return nestedEffects.length > 0;
    }
    async _getNestedEffectSelection(effect, withSocket = true) {
        const uuids = this._foundryHelpers.getActorUuids();
        const nestedEffectNames = getProperty(effect, `flags.${Constants.MODULE_ID}.${Constants.FLAGS.NESTED_EFFECTS}`) ?? [];
        const nestedEffects = nestedEffectNames.map((nestedEffect) => this.findEffectByNameOnToken(nestedEffect, uuids[0], withSocket));
        const content = await renderTemplate("modules/dfreds-convenient-effects/templates/nested-effects-dialog.hbs", {
            parentEffect: effect,
            nestedEffects
        });
        const choice = await Dialog.prompt({
            title: effect.label,
            content: content,
            label: "Select Effect",
            callback: (html) => {
                const htmlChoice = html.find('select[name="effect-choice"]').val();
                return htmlChoice;
            },
            rejectClose: false
        }, 
        //@ts-ignore
        { width: 300 });
        return nestedEffects.find((nestedEffect) => nestedEffect.label == choice);
    }
}
