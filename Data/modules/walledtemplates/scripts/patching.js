/* globals
libWrapper,
game,
MeasuredTemplate,
MeasuredTemplateDocument,
canvas
*/

"use strict";

import { MODULE_ID } from "./const.js";
import { defaultOptionsMeasuredTemplateConfig } from "./renderMeasuredTemplateConfig.js";
import {
  walledTemplateGetCircleShape,
  walledTemplateGetConeShape,
  walledTemplateGetRectShape,
  walledTemplateGetRayShape,
  _getConeShapeSwadeMeasuredTemplate,
  getBoundaryShapes,
  computeSweepPolygon } from "./getShape.js";
import {
  walledTemplatesMeasuredTemplateRefresh,
  boundsOverlap,
  autotargetToken } from "./targeting.js";
import { getGridHighlightPositionsMeasuredTemplate } from "./highlighting/Foundry_highlighting.js";

// Disable for now until PF2 and PF1 are updated for v10; may not need these
// import { WalledTemplatesPF1eGetHighlightedSquares } from "./highlighting/PF1e_highlighting.js";
// import { WalledTemplatesPF2eHighlightGrid } from "./highlighting/PF2e_highlighting.js";

export function registerWalledTemplates() {
  libWrapper.register(MODULE_ID, "MeasuredTemplate.prototype._getCircleShape", walledTemplateGetCircleShape, libWrapper.WRAPPER);
  libWrapper.register(MODULE_ID, "MeasuredTemplate.prototype._getConeShape", walledTemplateGetConeShape, libWrapper.WRAPPER);
  libWrapper.register(MODULE_ID, "MeasuredTemplate.prototype._getRectShape", walledTemplateGetRectShape, libWrapper.WRAPPER);
  libWrapper.register(MODULE_ID, "MeasuredTemplate.prototype._getRayShape", walledTemplateGetRayShape, libWrapper.WRAPPER);
  libWrapper.register(MODULE_ID, "MeasuredTemplate.prototype._getGridHighlightPositions", getGridHighlightPositionsMeasuredTemplate, libWrapper.WRAPPER);

  libWrapper.register(MODULE_ID, "MeasuredTemplateConfig.defaultOptions", defaultOptionsMeasuredTemplateConfig, libWrapper.WRAPPER);

  if ( game.system.id === "swade" ) {
    libWrapper.register(MODULE_ID, "CONFIG.MeasuredTemplate.objectClass.prototype._getConeShape", _getConeShapeSwadeMeasuredTemplate, libWrapper.WRAPPER);
  }

  // Disable for now until PF2 and PF1 are updated for v10; may not need these
  //   if ( game.system.id === "pf2e" ) {
  //     // Override how the grid is highlighted for cones and rays
  //     libWrapper.register(MODULE_ID, "CONFIG.MeasuredTemplate.objectClass.prototype.highlightGrid",
  //  WalledTemplatesPF2eHighlightGrid, libWrapper.MIXED);
  //   }
  //
  //   if ( game.system.id === "pf1" ) {
  //     libWrapper.register(MODULE_ID, "CONFIG.MeasuredTemplate.objectClass.prototype.getHighlightedSquares",
  // WalledTemplatesPF1eGetHighlightedSquares, libWrapper.WRAPPER);
  //   }

  libWrapper.register(MODULE_ID, "MeasuredTemplate.prototype.refresh", walledTemplatesMeasuredTemplateRefresh, libWrapper.MIXED);

  // For debugging
  if ( game.modules.get("_dev-mode")?.api?.getPackageDebugValue(MODULE_ID) ) {
    libWrapper.register(MODULE_ID, "ClockwiseSweepPolygon.prototype._executeSweep", executeSweepClockwiseSweepPolygon, libWrapper.WRAPPER, { perf_mode: libWrapper.PERF_FAST});
  }

  // ----- New methods ----- //

  Object.defineProperty(MeasuredTemplate.prototype, "getBoundaryShapes", {
    value: getBoundaryShapes,
    writable: true,
    configurable: true
  });

  Object.defineProperty(MeasuredTemplate.prototype, "computeSweepPolygon", {
    value: computeSweepPolygon,
    writable: true,
    configurable: true
  });

  Object.defineProperty(MeasuredTemplate.prototype, "autotargetToken", {
    value: autotargetToken,
    writable: true,
    configurable: true
  });

  Object.defineProperty(MeasuredTemplate.prototype, "boundsOverlap", {
    value: boundsOverlap,
    writable: true,
    configurable: true
  });

  if ( !Object.hasOwn(MeasuredTemplateDocument.prototype, "elevation") ) {
    Object.defineProperty(MeasuredTemplateDocument.prototype, "elevation", {
      get: function() {
        return this.flags?.levels?.elevation ?? canvas.primary.background.elevation;
      }
    });
  }
}

// For debugging
function executeSweepClockwiseSweepPolygon(wrapper) {
  wrapper();
  this._preWApoints = [...this.points];
}

