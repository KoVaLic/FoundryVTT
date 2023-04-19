import CONSTANTS from "./constants.js";
import EffectInterface from "./effects/effect-interface.js";
import { error } from "./lib/lib.js";
import StatusEffectsLib from "./effects/status-effects.js";
import { EffectSupport } from "./effects/effect-support.js";
import { Constants } from "./effects-public/effect.js";
import "./effects/effect-helpers.js";
const API = {
    effectInterface: EffectInterface,
    statusEffects: StatusEffectsLib,
    statusSearchTerm: "",
    get _defaultStatusEffectNames() {
        return [
        // add something here ???
        ];
    },
    /**
     * Returns the game setting for the status effect names
     *
     * @returns {String[]} the names of all the status effects
     */
    get statusEffectNames() {
        return game.settings.get(CONSTANTS.MODULE_NAME, "statusEffectNames");
    },
    /**
     * Adds a given effect name to the saved status effect settings
     *
     * @param {string} name - the name of the effect to add to status effects
     * @returns {Promise} a promise that resolves when the settings update is complete
     */
    async addStatusEffect(name) {
        let statusEffectsArray = this.statusEffectNames;
        statusEffectsArray.push(name);
        statusEffectsArray = [...new Set(statusEffectsArray)]; // remove duplicates
        return game.settings.set(CONSTANTS.MODULE_NAME, "statusEffectNames", statusEffectsArray);
    },
    /**
     * Removes a given effect name from the saved status effect settings
     *
     * @param {string} name - the name of the effect to remove from status effects
     * @returns {Promise} a promise that resolves when the settings update is complete
     */
    async removeStatusEffect(name) {
        const statusEffectsArray = this.statusEffectNames.filter((statusEffect) => statusEffect !== name);
        return game.settings.set(CONSTANTS.MODULE_NAME, "statusEffectNames", statusEffectsArray);
    },
    /**
     * Reset status effects back to the original defaults
     *
     * @returns {Promise} a promise that resolves when the settings update is complete
     */
    async resetStatusEffects() {
        return game.settings.set(CONSTANTS.MODULE_NAME, "statusEffectNames", this._defaultStatusEffectNames);
    },
    /**
     * Checks if the given effect name is a status effect
     *
     * @param {string} name - the effect name to search for
     * @returns {boolean} true if the effect is a status effect, false otherwise
     */
    isStatusEffect(name) {
        return this.statusEffectNames.includes(name);
    },
    // ======================
    // Effect Management
    // ======================
    async removeEffectArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("removeEffectArr | inAttributes must be of type array");
        }
        const [effectName, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.removeEffect(effectName, uuid);
        return result;
    },
    async toggleEffectArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("toggleEffectArr | inAttributes must be of type array");
        }
        const [effectName, overlay, uuids, metadata, effectData] = inAttributes;
        const result = await this.effectInterface._effectHandler.toggleEffect(effectName, overlay, uuids, metadata, effectData);
        return result;
    },
    async addEffectArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("addEffectArr | inAttributes must be of type array");
        }
        const [effectName, effectData, uuid, origin, overlay, metadata] = inAttributes;
        const result = await this.effectInterface._effectHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
        return result;
    },
    async hasEffectAppliedArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("hasEffectAppliedArr | inAttributes must be of type array");
        }
        const [effectName, uuid] = inAttributes;
        const result = this.effectInterface._effectHandler.hasEffectApplied(effectName, uuid);
        return result;
    },
    async hasEffectAppliedOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("hasEffectAppliedOnActorArr | inAttributes must be of type array");
        }
        const [effectName, uuid, includeDisabled] = inAttributes;
        const result = this.effectInterface._effectHandler.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
        return result;
    },
    async hasEffectAppliedFromIdOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("hasEffectAppliedFromIdOnActorArr | inAttributes must be of type array");
        }
        const [effectId, uuid, includeDisabled] = inAttributes;
        const result = this.effectInterface._effectHandler.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
        return result;
    },
    async addEffectOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("addEffectOnActorArr | inAttributes must be of type array");
        }
        const [effectName, uuid, origin, overlay, effect] = inAttributes;
        const result = await this.effectInterface._effectHandler.addEffectOnActor(effectName, uuid, origin, overlay, effect);
        return result;
    },
    async removeEffectOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("removeEffectOnActorArr | inAttributes must be of type array");
        }
        const [effectName, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.removeEffectOnActor(effectName, uuid);
        return result;
    },
    async removeEffectFromIdOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("removeEffectFromIdOnActor | inAttributes must be of type array");
        }
        const [effectId, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.removeEffectFromIdOnActor(effectId, uuid);
        return result;
    },
    async toggleEffectFromIdOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("addEffectOnActorArr | inAttributes must be of type array");
        }
        const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
        const result = await this.effectInterface._effectHandler.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        return result;
    },
    async findEffectByNameOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("findEffectByNameOnActorArr | inAttributes must be of type array");
        }
        const [effectName, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.findEffectByNameOnActor(effectName, uuid);
        return result;
    },
    async findEffectByIdOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("findEffectByIdOnActorArr | inAttributes must be of type array");
        }
        const [effectId, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.findEffectByIdOnActor(effectId, uuid);
        return result;
    },
    async hasEffectAppliedOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("hasEffectAppliedOnTokenArr | inAttributes must be of type array");
        }
        const [effectName, uuid, includeDisabled] = inAttributes;
        const result = this.effectInterface._effectHandler.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
        return result;
    },
    async hasEffectAppliedFromIdOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("hasEffectAppliedFromIdOnTokenArr | inAttributes must be of type array");
        }
        const [effectId, uuid, includeDisabled] = inAttributes;
        const result = this.effectInterface._effectHandler.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
        return result;
    },
    async addEffectOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("addEffectOnTokenArr | inAttributes must be of type array");
        }
        const [effectName, uuid, origin, overlay, effect] = inAttributes;
        const result = await this.effectInterface._effectHandler.addEffectOnToken(effectName, uuid, origin, overlay, effect);
        return result;
    },
    async removeEffectOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("removeEffectOnTokenArr | inAttributes must be of type array");
        }
        const [effectName, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.removeEffectOnToken(effectName, uuid);
        return result;
    },
    async removeEffectFromIdOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("removeEffectFromIdOnToken | inAttributes must be of type array");
        }
        const [effectId, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.removeEffectFromIdOnToken(effectId, uuid);
        return result;
    },
    async removeEffectFromIdOnTokenMultipleArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("removeEffectFromIdOnTokenMultipleArr | inAttributes must be of type array");
        }
        const [effectIds, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
        return result;
    },
    async toggleEffectFromIdOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("toggleEffectFromIdOnTokenArr | inAttributes must be of type array");
        }
        const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
        const result = await this.effectInterface._effectHandler.toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        return result;
    },
    async toggleEffectFromDataOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("toggleEffectFromDataOnTokenArr | inAttributes must be of type array");
        }
        const [effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
        const result = await this.effectInterface._effectHandler.toggleEffectFromDataOnToken(effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        return result;
    },
    async findEffectByNameOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("findEffectByNameOnTokenArr | inAttributes must be of type array");
        }
        const [effectName, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.findEffectByNameOnToken(effectName, uuid);
        return result;
    },
    async findEffectByIdOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("findEffectByIdOnTokenArr | inAttributes must be of type array");
        }
        const [effectId, uuid] = inAttributes;
        const result = await this.effectInterface._effectHandler.findEffectByIdOnToken(effectId, uuid);
        return result;
    },
    async addActiveEffectOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("addActiveEffectOnTokenArr | inAttributes must be of type array");
        }
        const [tokenId, activeEffectData, overlay] = inAttributes;
        const result = this.effectInterface._effectHandler.addActiveEffectOnToken(tokenId, activeEffectData, overlay);
        return result;
    },
    async addActiveEffectOnActorArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("addActiveEffectOnTokenArr | inAttributes must be of type array");
        }
        const [actorId, activeEffectData, overlay] = inAttributes;
        const result = this.effectInterface._effectHandler.addActiveEffectOnActor(actorId, activeEffectData, overlay);
        return result;
    },
    async updateEffectFromIdOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("updateEffectFromIdOnTokenArr | inAttributes must be of type array");
        }
        const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
        const result = await this.effectInterface._effectHandler.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        return result;
    },
    async updateEffectFromNameOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("updateEffectFromNameOnTokenArr | inAttributes must be of type array");
        }
        const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
        const result = await this.effectInterface._effectHandler.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        return result;
    },
    async updateActiveEffectFromIdOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("updateActiveEffectFromIdOnTokenArr | inAttributes must be of type array");
        }
        const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
        const result = await this.effectInterface._effectHandler.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        return result;
    },
    async updateActiveEffectFromNameOnTokenArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error("updateActiveEffectFromNameOnTokenArr | inAttributes must be of type array");
        }
        const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
        const result = await this.effectInterface._effectHandler.updateActiveEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        return result;
    },
    async onManageActiveEffectFromEffectIdArr(...inAttributes) {
        const [effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] = inAttributes;
        const result = await this.effectInterface._effectHandler.onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        return result;
    },
    async onManageActiveEffectFromEffectArr(...inAttributes) {
        const [effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] = inAttributes;
        const result = await this.effectInterface._effectHandler.onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        return result;
    },
    async onManageActiveEffectFromActiveEffectArr(...inAttributes) {
        const [effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] = inAttributes;
        const result = await (this.effectInterface)._effectHandler.onManageActiveEffectFromActiveEffect(effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        return result;
    },
    // ======================
    // Effect Actor Management
    // ======================
    async addEffectOnActor(actorId, effectName, effect) {
        const result = await this.effectInterface.addEffectOnActor(effectName, actorId, effect);
        return result;
    },
    async findEffectByNameOnActor(actorId, effectName) {
        const result = await this.effectInterface.findEffectByNameOnActor(effectName, actorId);
        return result;
    },
    async findEffectByIdOnActor(actorId, effectId) {
        const result = await this.effectInterface.findEffectByIdOnActor(effectId, actorId);
        return result;
    },
    async hasEffectAppliedOnActor(actorId, effectName, includeDisabled) {
        const result = this.effectInterface.hasEffectAppliedOnActor(effectName, actorId, includeDisabled);
        return result;
    },
    async hasEffectAppliedFromIdOnActor(actorId, effectId, includeDisabled) {
        const result = this.effectInterface.hasEffectAppliedFromIdOnActor(effectId, actorId, includeDisabled);
        return result;
    },
    async toggleEffectFromIdOnActor(actorId, effectId, alwaysDelete, forceEnabled, forceDisabled, overlay) {
        const result = await this.effectInterface.toggleEffectFromIdOnActor(effectId, actorId, alwaysDelete, forceEnabled, forceDisabled, overlay);
        return result;
    },
    async addActiveEffectOnActor(actorId, activeEffectData, overlay) {
        const result = this.effectInterface.addActiveEffectOnActor(actorId, activeEffectData, overlay);
        return result;
    },
    async removeEffectOnActor(actorId, effectName) {
        const result = await this.effectInterface.removeEffectOnActor(effectName, actorId);
        return result;
    },
    async removeEffectFromIdOnActor(actorId, effectId) {
        const result = await this.effectInterface.removeEffectFromIdOnActor(effectId, actorId);
        return result;
    },
    // ======================
    // Effect Token Management
    // ======================
    async addEffectOnToken(tokenId, effectName, effect) {
        const result = await this.effectInterface.addEffectOnToken(effectName, tokenId, effect);
        return result;
    },
    async findEffectByNameOnToken(tokenId, effectName) {
        const result = await this.effectInterface.findEffectByNameOnToken(effectName, tokenId);
        return result;
    },
    async findEffectByIdOnToken(tokenId, effectId) {
        const result = await this.effectInterface.findEffectByIdOnToken(effectId, tokenId);
        return result;
    },
    async hasEffectAppliedOnToken(tokenId, effectName, includeDisabled) {
        const result = this.effectInterface.hasEffectAppliedOnToken(effectName, tokenId, includeDisabled);
        return result;
    },
    async hasEffectAppliedFromIdOnToken(tokenId, effectId, includeDisabled) {
        const result = this.effectInterface.hasEffectAppliedFromIdOnToken(effectId, tokenId, includeDisabled);
        return result;
    },
    async toggleEffectFromIdOnToken(tokenId, effectId, alwaysDelete, forceEnabled, forceDisabled, overlay) {
        const result = await this.effectInterface.toggleEffectFromIdOnToken(effectId, tokenId, alwaysDelete, forceEnabled, forceDisabled, overlay);
        return result;
    },
    async toggleEffectFromDataOnToken(tokenId, effect, alwaysDelete, forceEnabled, forceDisabled, overlay) {
        const result = await this.effectInterface.toggleEffectFromDataOnToken(effect, tokenId, alwaysDelete, forceEnabled, forceDisabled, overlay);
        return result;
    },
    async addActiveEffectOnToken(tokenId, activeEffectData, overlay) {
        const result = await this.effectInterface.addActiveEffectOnToken(tokenId, activeEffectData, overlay);
        return result;
    },
    async removeEffectOnToken(tokenId, effectName) {
        const result = await this.effectInterface.removeEffectOnToken(effectName, tokenId);
        return result;
    },
    async removeEffectFromIdOnToken(tokenId, effectId) {
        const result = await this.effectInterface.removeEffectFromIdOnToken(effectId, tokenId);
        return result;
    },
    async removeEffectFromIdOnTokenMultiple(tokenId, effectIds) {
        const result = await this.effectInterface.removeEffectFromIdOnTokenMultiple(effectIds, tokenId);
        return result;
    },
    async updateEffectFromIdOnToken(tokenId, effectId, origin, overlay, effectUpdated) {
        const result = await this.effectInterface.updateEffectFromIdOnToken(effectId, tokenId, origin, overlay, effectUpdated);
        return result;
    },
    async updateEffectFromNameOnToken(tokenId, effectName, origin, overlay, effectUpdated) {
        const result = await this.effectInterface.updateEffectFromNameOnToken(effectName, tokenId, origin, overlay, effectUpdated);
        return result;
    },
    async updateActiveEffectFromIdOnToken(tokenId, effectId, origin, overlay, effectUpdated) {
        const result = await this.effectInterface.updateActiveEffectFromIdOnToken(effectId, tokenId, origin, overlay, effectUpdated);
        return result;
    },
    async updateActiveEffectFromNameOnToken(tokenId, effectName, origin, overlay, effectUpdated) {
        const result = await this.effectInterface.updateActiveEffectFromNameOnToken(effectName, tokenId, origin, overlay, effectUpdated);
        return result;
    },
    // ======================
    // Effect Generic Management
    // ======================
    async onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled) {
        const result = await this.effectInterface.onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        return result;
    },
    async onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled) {
        const result = await this.effectInterface.onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        return result;
    },
    async onManageActiveEffectFromActiveEffect(effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled) {
        const result = await this.effectInterface.onManageActiveEffectFromActiveEffect(effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        return result;
    },
    // ==========================
    // SUPPORT 2022-09-11
    // ==========================
    async buildDefault(id, name, icon, isPassive, changes = [], atlChanges = [], tokenMagicChanges = [], atcvChanges = []) {
        return EffectSupport.buildDefault(id, name, icon, isPassive, changes, atlChanges, tokenMagicChanges, atcvChanges);
    },
    async isDuplicateEffectChange(aeKey, arrChanges) {
        return EffectSupport.isDuplicateEffectChange(aeKey, arrChanges);
    },
    async _handleIntegrations(effect) {
        return EffectSupport._handleIntegrations(effect);
    },
    async convertActiveEffectToEffect(activeEffect) {
        return EffectSupport.convertActiveEffectToEffect(activeEffect);
    },
    async convertActiveEffectDataPropertiesToActiveEffect(activeEffectDataProperties, isPassive) {
        return EffectSupport.convertActiveEffectDataPropertiesToActiveEffect(activeEffectDataProperties, isPassive);
    },
    async convertToActiveEffectData(effect) {
        return EffectSupport.convertToActiveEffectData(effect);
    },
    async retrieveChangesOrderedByPriorityFromAE(activeEffect) {
        return EffectSupport.retrieveChangesOrderedByPriorityFromAE(activeEffect);
    },
    async prepareOriginForToken(tokenOrTokenId) {
        return EffectSupport.prepareOriginForToken(tokenOrTokenId);
    },
    async prepareOriginForActor(actorOrActorId) {
        return EffectSupport.prepareOriginForActor(actorOrActorId);
    },
    async prepareOriginFromEntity(entity) {
        return EffectSupport.prepareOriginFromEntity(entity);
    },
    async convertToATLEffect(
    //lockRotation: boolean,
    sightEnabled, dimSight, brightSight, sightAngle, sightVisionMode, //e.g. 'darkvision'
    dimLight, brightLight, lightColor, lightAlpha, lightAngle, lightColoration = null, lightLuminosity = null, lightGradual = null, lightSaturation = null, lightContrast = null, lightShadows = null, lightAnimationType, lightAnimationSpeed, lightAnimationIntensity, lightAnimationReverse, 
    // applyAsAtlEffect = false, // rimosso
    effectName = null, effectIcon = null, duration = null, 
    // vision = false,
    // id: string | null = null,
    // name: string | null = null,
    height = null, width = null, scale = null, alpha = null) {
        return EffectSupport.convertToATLEffect(
        //lockRotation,
        sightEnabled, dimSight, brightSight, sightAngle, sightVisionMode, dimLight, brightLight, lightColor, lightAlpha, lightAngle, lightColoration, lightLuminosity, lightGradual, lightSaturation, lightContrast, lightShadows, lightAnimationType, lightAnimationSpeed, lightAnimationIntensity, lightAnimationReverse, 
        // applyAsAtlEffect, // rimosso
        effectName, effectIcon, duration, 
        // visio,
        // id,
        // name,
        height, width, scale, alpha);
    },
    // 2023-02-25
    /**
     * Searches through the list of available effects and returns one matching the
     * effect name. Prioritizes finding custom effects first.
     *
     * @param {string} effectName - the effect name to search for
     * @returns {ActiveEffect} the found effect
     */
    async findEffectByName(effectName) {
        const result = await this.effectInterface.findEffectByName(effectName);
        return result;
    },
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
        const result = await this.effectInterface.toggleEffect(effectName, overlay, uuids);
        return result;
    },
    /**
     * Creates new custom effects with the provided active effect data.
     *
     * @param {object} params - the params for adding an effect
     * @param {ActiveEffect[]} params.activeEffects - array of active effects to add
     * @returns {Promise} a promise that resolves when the active effects have finished being added
     */
    async createNewCustomEffectsWith({ activeEffects }) {
        const result = await this.effectInterface.createNewCustomEffectsWith({
            activeEffects
        });
        return result;
    },
    /**
     * Checks if the given effect has nested effects
     *
     * @param {ActiveEffect} effect - the active effect to check the nested effets on
     * @returns
     */
    async hasNestedEffects(effect, withSocket = true) {
        const nestedEffects = getProperty(effect, `flags.${Constants.MODULE_ID}.${Constants.FLAGS.NESTED_EFFECTS}`) ?? [];
        return nestedEffects.length > 0;
    },
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
};
export default API;
