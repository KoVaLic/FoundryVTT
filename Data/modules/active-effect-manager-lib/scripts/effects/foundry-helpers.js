import { warn } from "../lib/lib.js";
/**
 * Simple helpers for querying aspects of foundry
 */
export default class FoundryHelpers {
    constructor() {
        // this._settings = new Settings();
    }
    /**
     * Gets all UUIDs for selected or targeted tokens, depending on if priortize
     * targets is enabled
     * @deprecated
     * @returns {string[]} actor uuids for selected or targeted tokens
     */
    getActorUuidsFromCanvas() {
        if (canvas.tokens?.controlled.length === 0 && game.user?.targets.size === 0) {
            return [];
        }
        // if (this._settings.prioritizeTargets && game.user?.targets.size !== 0) {
        //   return Array.from(game.user?.targets).map((token) => token.actor?.uuid);
        // } else {
        return canvas.tokens?.controlled.map((token) => token.actor?.uuid);
        // }
    }
    /**
     * Gets all UUIDs for selected or targeted tokens, depending on if priortize
     * targets is enabled
     *
     * @param prioritizeTargets If enabled, effects will be applied to any targeted tokens instead of selected tokens.
     * @returns {string[]} actor uuids for selected or targeted tokens
     */
    getActorUuids(prioritizeTargets = false) {
        if (canvas.tokens?.controlled.length == 0 &&
            game.user?.targets.size == 0 &&
            game.user?.character == undefined) {
            return [];
        }
        if (prioritizeTargets && game.user?.targets.size !== 0) {
            return Array.from(game.user?.targets).map((token) => token.actor?.uuid);
        }
        else if (canvas.tokens?.controlled.length !== 0) {
            return canvas.tokens?.controlled.map((token) => token.actor?.uuid);
        }
        else {
            return [game.user?.character?.uuid];
        }
    }
    /**
     * Gets the actor object by the actor UUID
     *
     * @param {string} uuid - the actor UUID
     * @returns {Actor5e} the actor that was found via the UUID
     */
    getActorByUuid(uuid) {
        //@ts-ignore
        const actorToken = fromUuidSync(uuid);
        let actor = actorToken?.actor ? actorToken?.actor : actorToken;
        // MOD 4535992
        if (!actor) {
            actor = game.actors?.get(uuid);
        }
        return actor;
    }
    /**
     * Re-renders the Convenient Effects application if open
     */
    renderConvenientEffectsAppIfOpen() {
        // TODO DISABLED IT
        // const openApps = Object.values(ui.windows);
        // const convenientEffectsApp = openApps.find((app) => app instanceof ConvenientEffectsApp);
        // if (convenientEffectsApp) {
        // 	convenientEffectsApp.render();
        // }
        warn(`You can't use this feature...`, true);
    }
    async uuidToDocument(uuid) {
        const parts = uuid.split(".");
        let result = null;
        if (parts[0] === "Compendium") {
            const pack = game["packs"].get(parts[1] + "." + parts[2]);
            if (pack !== undefined) {
                result = await pack.getDocument(parts[3]);
            }
        }
        else {
            result = await fromUuid(uuid);
        }
        if (result === null) {
            throw new Error(`Document not found by uuid : ${uuid}`);
        }
        return result;
    }
    /**
     * Gets the actor object by the actor UUID
     *
     * @param {string} uuid - the actor UUID
     * @returns {Actor5e} the actor that was found via the UUID
     */
    getTokenByUuid(uuid) {
        const tokens = canvas.tokens?.placeables;
        //@ts-ignore
        let token = tokens.find((token) => token.uuid === uuid || token.id === uuid);
        return token;
    }
}
