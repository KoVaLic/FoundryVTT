/* globals
GlobalLightSource,
canvas,
PIXI,
CONFIG
*/
"use strict";

import { SETTINGS, getSceneSetting } from "./settings.js";
import { log } from "./util.js";
import { ShaderPatcher, applyPatches } from "./perfect-vision/shader-patcher.js";
import { Point3d } from "./geometry/3d/Point3d.js";

/** To test a light
drawing = game.modules.get("elevatedvision").api.drawing
drawing.clearDrawings()
[l] = canvas.lighting.placeables
l.source.los._drawShadows()

*/


/*
https://ptb.discord.com/channels/732325252788387980/734082399453052938/1006958083320336534

- aVertexPosition are the vertices of the polygon normalized; origin is (0,0), radius 1
- vUvs is aVertexPosition transformed such that the center is (0.5,0.5) and the radius 0.5,
  such that it's in the range [0,1]x[0,1]. Therefore the * 2.0 is required to calculate dist,
  otherwise dist wouldn't be in the range [0,1]
- aDepthValue/vDepth is the edge falloff: the distance to the boundary of the polygon normalized
- vSamplerUvs are the texture coordinates used for sampling from a screen-sized texture

*/

// In GLSL 2, cannot use dynamic arrays. So set a maximum number of walls for a given light.
const MAX_NUM_WALLS = 100;
const MAX_NUM_WALL_ENDPOINTS = MAX_NUM_WALLS * 2;

// Orientation of three 2d points
const FN_ORIENT2D = {
  NAME: "orient2d",
  PARAMS: ["in vec2 a", "in vec2 b", "in vec2 c"],
  RETURN: "float",
  get TYPE() { return `${this.RETURN}(${this.PARAMS.join(", ")})`; },
  BODY:
`
  return (a.y - c.y) * (b.x - c.x) - (a.x - c.x) * (b.y - c.y);
`
};

// Does segment AB intersect the segment CD?
const FN_LINE_SEGMENT_INTERSECTS = {
  NAME: "lineSegmentIntersects",
  PARAMS: ["in vec2 a", "in vec2 b", "in vec2 c", "in vec2 d"],
  RETURN: "bool",
  get TYPE() { return `${this.RETURN}(${this.PARAMS.join(", ")})`; },
  BODY:
`
  float xa = orient2d(a, b, c);
  float xb = orient2d(a, b, d);
  if ( xa == 0.0 && xb == 0.0 ) return false;

  bool xab = (xa * xb) <= 0.0;
  bool xcd = (orient2d(c, d, a) * orient2d(c, d, b)) <= 0.0;
  return xab && xcd;
`};

// Point on line AB that forms perpendicular point to C
const FN_PERPENDICULAR_POINT = {
  NAME: "perpendicularPoint",
  PARAMS: ["in vec2 a", "in vec2 b", "in vec2 c"],
  RETURN: "vec2",
  get TYPE() { return `${this.RETURN}(${this.PARAMS.join(", ")})`; },
  BODY:
`
  vec2 deltaBA = b - a;

  // dab might be 0 but only if a and b are equal
  float dab = pow(deltaBA.x, 2.0) + pow(deltaBA.y, 2.0);
  vec2 deltaCA = c - a;

  float u = ((deltaCA.x * deltaBA.x) + (deltaCA.y * deltaBA.y)) / dab;
  return vec2(a.x + (u * deltaBA.x), a.y + (u * deltaBA.y));
`};

// Calculate the canvas elevation given a pixel value
// Maps 0–1 to elevation in canvas coordinates.
// EV_elevationResolution:
// r: elevation min; g: elevation step; b: max pixel value (likely 255); a: canvas size / distance
// u.EV_elevationResolution = [elevationMin, elevationStep, maximumPixelValue, elevationMult];

const FN_CANVAS_ELEVATION_FROM_PIXEL = {
  NAME: "canvasElevationFromPixel",
  PARAMS: ["in float pixel", "in vec4 EV_elevationResolution"],
  RETURN: "float",
  get TYPE() { return `${this.RETURN}(${this.PARAMS.join(", ")})`; },
  BODY:
`
  return (EV_elevationResolution.r + (pixel * EV_elevationResolution.b * EV_elevationResolution.g)) * EV_elevationResolution.a;
`};

const FN_RAY_QUAD_INTERSECTION = {
  NAME: "rayQuadIntersection",
  PARAMS: ["in vec3 rayOrigin", "in vec3 rayDirection", "in vec3 v0", "in vec3 v1", "in vec3 v2", "in vec3 v3"],
  RETURN: "float",
  get TYPE() { return `${this.RETURN}(${this.PARAMS.join(", ")})`; },
  BODY:
`
  // Reject rays using the barycentric coordinates of the intersection point with respect to T
  vec3 E01 = v1 - v0;
  vec3 E03 = v3 - v0;
  vec3 P = cross(rayDirection, E03);
  float det = dot(E01, P);
  if (abs(det) < 1e-6) return -1.0;

  vec3 T = rayOrigin - v0;
  float alpha = dot(T, P) / det;
  if (alpha < 0.0) return -1.0;
  if (alpha > 1.0) return -1.0;

  vec3 Q = cross(T, E01);
  float beta = dot(rayDirection, Q) / det;
  if (beta < 0.0) return -1.0;
  if (beta > 1.0) return -1.0;

  // Reject rays using the barycentric coordinates of the intersection point with respect to T prime
  if ((alpha + beta) > 1.0) {
    vec3 E23 = v3 - v2;
    vec3 E21 = v1 - v2;
    vec3 Pprime = cross(rayDirection, E21);
    float detprime = dot(E23, Pprime);
    if (abs(detprime) < 1e-6) return -1.0;

    vec3 Tprime = rayOrigin - v2;
    float alphaprime = dot(Tprime, Pprime) / detprime;
    if (alphaprime < 0.0) return -1.0;

    vec3 Qprime = cross(Tprime, E23);
    float betaprime = dot(rayDirection, Qprime) / detprime;
    if (betaprime < 0.0) return -1.0;
  }

  // Compute the ray parameter of the intersection point
  float t = dot(E03, Q) / det;
  //if (t < 0.0) return -1.0;
  return t;
`};

// Determine if a given location from a wall is in shadow or not.
const FN_LOCATION_IN_WALL_SHADOW = {
  NAME: "locationInWallShadow",
  PARAMS: ["in vec3 wallTL", "in vec3 wallBR", "in float wallDistance", "in vec3 sourceLocation", "in vec3 pixelLocation", "out float percentDistanceFromWall"],
  RETURN: "bool",
  get TYPE() { return `${this.RETURN}(${this.PARAMS.join(", ")})`; },
  BODY:
`
  percentDistanceFromWall = 0.0; // Set a default value when returning early.

  vec3 Atop = wallTL;
  vec3 Abottom = vec3(wallTL.xy, wallBR.z);
  vec3 Btop = vec3(wallBR.xy, wallTL.z);
  vec3 Bbottom = wallBR;

  // Shoot a ray from the pixel toward the source to see if it intersects the wall
  vec3 rayDirection = sourceLocation - pixelLocation;
  float t = rayQuadIntersection(pixelLocation, rayDirection, Atop, Abottom, Bbottom, Btop);
  if ( t < 0.0 || t > 1.0 ) return false;

  // Distance from the wall to this pixel
  float distWP = length(rayDirection * t);

  // atan(opp/adj) equivalent to JS Math.atan(opp/adj)
  // atan(y, x) equivalent to JS Math.atan2(y, x)
  float adjWe = wallTL.z - pixelLocation.z;
  float adjSourceElevation = sourceLocation.z - pixelLocation.z;
  float theta = atan((adjSourceElevation - adjWe) /  wallDistance);

  // Distance from center/origin to furthest part of shadow perpendicular to wall
  float distOV = adjSourceElevation / tan(theta);
  float maxDistWP = distOV - wallDistance;

  percentDistanceFromWall = distWP / maxDistWP;
  return true;
`};

// Export the entire block of helper functions.
const functionDecs = [];
const functions = [
  FN_ORIENT2D,
  FN_LINE_SEGMENT_INTERSECTS,
  FN_PERPENDICULAR_POINT,
  FN_RAY_QUAD_INTERSECTION,
  FN_CANVAS_ELEVATION_FROM_PIXEL,
  FN_LOCATION_IN_WALL_SHADOW
];
for ( const fn of functions) {
  functionDecs.push(
`
${fn.RETURN} ${fn.NAME}(${fn.PARAMS.join(", ")}) {
${fn.BODY}
}

`);
}
export const FRAGMENT_FUNCTIONS = functionDecs.join("");

const DEPTH_CALCULATION =
`
float depth = smoothstep(0.0, 1.0, vDepth);
int wallsToProcess = EV_numWalls;
int terrainWallsToProcess = EV_numTerrainWalls;
vec4 backgroundElevation = vec4(0.0, 0.0, 0.0, 1.0);
vec2 EV_textureCoord = EV_transform.xy * vUvs + EV_transform.zw;

vec2 evTextureCoord = (vUvs.xy - EV_sceneDims.xy) / EV_sceneDims.zw;
backgroundElevation = texture2D(EV_elevationSampler, evTextureCoord);

float percentDistanceFromWall;
float pixelElevation = canvasElevationFromPixel(backgroundElevation.r, EV_elevationResolution);

float sceneLeft = EV_sceneDims.x;
float sceneTop = EV_sceneDims.y;
float sceneWidth = EV_sceneDims.z;
float sceneHeight = EV_sceneDims.w;
float sceneRight = sceneLeft + sceneWidth;
float sceneBottom = sceneTop + sceneHeight;

if ( vUvs.x < sceneLeft
  || vUvs.x > sceneRight
  || vUvs.y < sceneTop
  || vUvs.y > sceneBottom
  || EV_sourceLocation.z < EV_elevationResolution.r ) {

  // Skip if we are outside the scene boundary or below elevation min
  wallsToProcess = 0;
  terrainWallsToProcess = 0;

} else if ( pixelElevation > EV_sourceLocation.z ) {

  // If elevation at this point is above the light, then light cannot hit this pixel.
  depth = 0.0;
  wallsToProcess = 0;
  terrainWallsToProcess = 0;
  inShadow = EV_isVision;
}

vec3 pixelLocation = vec3(vUvs.xy, pixelElevation);
for ( int i = 0; i < MAX_NUM_WALLS; i++ ) {
  if ( i >= wallsToProcess ) break;

  vec3 wallTL = EV_wallCoords[i * 2];
  vec3 wallBR = EV_wallCoords[(i * 2) + 1];

  bool thisWallInShadow = locationInWallShadow(
    wallTL,
    wallBR,
    EV_wallDistances[i],
    EV_sourceLocation,
    pixelLocation,
    percentDistanceFromWall
  );

  if ( thisWallInShadow ) {
    // Current location is within shadow of the wall
    // Don't break out of loop; could be more than one wall casting shadow on this point.
    // For now, use the closest shadow for depth.
    inShadow = true;
    depth = min(depth, percentDistanceFromWall);
  }
}

// If terrain walls are present, see if at least 2 walls block this pixel from the light.
if ( !inShadow && terrainWallsToProcess > 1 ) {
  bool terrainWallShadows = false;
  float percentDistanceFromTerrainWall = 1.0;
  for ( int j = 0; j < MAX_NUM_WALLS; j++ ) {
    if ( j >= terrainWallsToProcess ) break;

    vec3 terrainWallTL = EV_terrainWallCoords[j * 2];
    vec3 terrainWallBR = EV_terrainWallCoords[(j * 2) + 1];

    bool thisTerrainWallInShadow = locationInWallShadow(
      terrainWallTL,
      terrainWallBR,
      EV_terrainWallDistances[j],
      EV_sourceLocation,
      pixelLocation,
      percentDistanceFromWall
    );

    if ( thisTerrainWallInShadow && terrainWallShadows ) {
      inShadow = true;
    }

    if ( thisTerrainWallInShadow ) {
      percentDistanceFromTerrainWall = min(percentDistanceFromTerrainWall, percentDistanceFromWall);
      terrainWallShadows = true;
    }
  }

  if ( inShadow ) {
    depth = min(depth, percentDistanceFromTerrainWall);
  }
}
`;

const FRAG_COLOR =
`
  if ( EV_isVision && inShadow ) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
`;

function addShadowCode(source) {
  try {
    source = new ShaderPatcher("frag")
      .setSource(source)

      .addUniform("EV_numWalls", "int")
      .addUniform("EV_numTerrainWalls", "int")
      .addUniform("EV_terrainWallDistances", "float[MAX_NUM_WALLS]")
      .addUniform("EV_terrainWallCoords", "vec3[MAX_NUM_WALL_ENDPOINTS]")
      .addUniform("EV_wallCoords", "vec3[MAX_NUM_WALL_ENDPOINTS]")
      .addUniform("EV_wallDistances", "float[MAX_NUM_WALLS]")
      .addUniform("EV_sourceLocation", "vec3")
      .addUniform("EV_isVision", "bool")
      .addUniform("EV_elevationSampler", "sampler2D")
      .addUniform("EV_transform", "vec4")
      .addUniform("EV_elevationResolution", "vec4")
      .addUniform("EV_hasElevationSampler", "bool")
      .addUniform("EV_sceneDims", "vec4")

      // Functions must be in reverse-order of dependency.
      .addFunction(FN_LOCATION_IN_WALL_SHADOW.NAME, FN_LOCATION_IN_WALL_SHADOW.TYPE, FN_LOCATION_IN_WALL_SHADOW.BODY)
      .addFunction(FN_CANVAS_ELEVATION_FROM_PIXEL.NAME, FN_CANVAS_ELEVATION_FROM_PIXEL.TYPE, FN_CANVAS_ELEVATION_FROM_PIXEL.BODY)
      .addFunction(FN_RAY_QUAD_INTERSECTION.NAME, FN_RAY_QUAD_INTERSECTION.TYPE, FN_RAY_QUAD_INTERSECTION.BODY)
      .addFunction(FN_PERPENDICULAR_POINT.NAME, FN_PERPENDICULAR_POINT.TYPE, FN_PERPENDICULAR_POINT.BODY)
      .addFunction(FN_LINE_SEGMENT_INTERSECTS.NAME, FN_LINE_SEGMENT_INTERSECTS.TYPE, FN_LINE_SEGMENT_INTERSECTS.BODY)
      .addFunction(FN_ORIENT2D.NAME, FN_ORIENT2D.TYPE, FN_ORIENT2D.BODY)

      // Add variable that can be seen by wrapped main
      .addGlobal("inShadow", "bool", "false")

      // Add define after so it appears near the top
      .prependBlock(`#define MAX_NUM_WALLS ${MAX_NUM_WALLS}`)
      .prependBlock(`#define MAX_NUM_WALL_ENDPOINTS ${MAX_NUM_WALL_ENDPOINTS}`)

      .replace(/float depth = smoothstep[(]0.0, 1.0, vDepth[)];/, DEPTH_CALCULATION)

      .wrapMain(`\
        void main() {
          @main();

          ${FRAG_COLOR}
        }

      `)

      .getSource();

  } finally {
    return source;
  }

}

const originalFragmentSource = new Map();

/**
 * Wrap AdaptiveLightShader.prototype.create
 * Modify the code to add shadow depth based on background elevation and walls
 * Add uniforms used by the fragment shader to draw shadows in the color and illumination shaders.
 */
export function createAdaptiveLightingShader(wrapped, ...args) {
  log("createAdaptiveLightingShader");

  if ( !originalFragmentSource.has(this.name) ) originalFragmentSource.set(this.name, this.fragmentShader);
  const shaderAlgorithm = getSceneSetting(SETTINGS.SHADING.ALGORITHM);
  if ( shaderAlgorithm !== SETTINGS.SHADING.TYPES.WEBGL ) {
    this.fragmentShader = originalFragmentSource.get(this.name);
    return wrapped(...args);
  }

  applyPatches(this,
    false,
    source => {
      source = addShadowCode(source);
      return source;
    });

  const shader = wrapped(...args);
  shader.uniforms.EV_numWalls = 0;
  shader.uniforms.EV_numTerrainWalls = 0;
  shader.uniforms.EV_wallCoords = [0, 0, 0, 0, 0, 0];
  shader.uniforms.EV_terrainWallCoords = [0, 0, 0, 0, 0, 0];
  shader.uniforms.EV_terrainWallDistances = [0];

  shader.uniforms.EV_sourceLocation = [0.5, 0.5, 0.5];
  shader.uniforms.EV_wallDistances = [0];
  shader.uniforms.EV_isVision = false;
  shader.uniforms.EV_elevationSampler = canvas.elevation._elevationTexture ?? PIXI.Texture.EMPTY;

  shader.uniforms.EV_transform = [1, 1, 1, 1];
  shader.uniforms.EV_hasElevationSampler = false;

  // [min, step, maxPixelValue ]
  shader.uniforms.EV_elevationResolution = [0, 1, 255, 1];

  return shader;
}

/*

 Looking at a cross-section:
  O----------W----V-----?
  | \ Ø      |    |
Oe|    \     |    |
  |       \  |    |
  |          \    |
  |        We| Ø \ | <- point V where obj can be seen by O for given elevations
  ----------------•----
  |<-   OV      ->|
 e = height of O (vision/light object center)
 Ø = theta
 W = wall

Oe must be greater than We or no shadow.

opp = Oe - We
adj = OW
theta = atan(opp / adj)

OV = Oe / tan(theta)

Also need the height from the current position on the canvas for which the shadow no longer
applies. That can be simplified by just shifting the elevations of the above diagram.
So Oe becomes Oe - pixelE. We = We - pixelE.
*/

/**
 * Wrap LightSource.prototype._updateColorationUniforms.
 * Add uniforms needed for the shadow fragment shader.
 */
export function _updateColorationUniformsLightSource(wrapped) {
  wrapped();
  if ( this instanceof GlobalLightSource ) return;
  this._updateEVLightUniforms(this.coloration);
}

/**
 * Wrap LightSource.prototype._updateIlluminationUniforms.
 * Add uniforms needed for the shadow fragment shader.
 */
export function _updateIlluminationUniformsLightSource(wrapped) {
  wrapped();
  if ( this instanceof GlobalLightSource ) return;
  this._updateEVLightUniforms(this.illumination);
}

/**
 * Helper function to add uniforms for the light shaders.
 * Add:
 * - elevation of the light
 * - number of walls that are in the LOS and below the light source elevation
 * For each wall that is below the light source, add
 *   (in the coordinate system used in the shader):
 * - wall coordinates
 * - wall elevations
 * - distance between the wall and the light source center
 * @param {PIXI.Shader} shader
 */
export function _updateEVLightUniformsLightSource(mesh) {
  const shader = mesh.shader;
  const { x, y, radius, elevationZ } = this;
  const source = this;
  const { width, height } = canvas.dimensions;

  const heightWalls = this.los._elevatedvision?.heightWalls || new Set();
  const terrainWalls = this.los._elevatedvision?.terrainWalls || new Set();
  const r_inv = 1 / radius;

  // Radius is .5 in the shader coordinates; adjust elevation accordingly
  const u = shader.uniforms;
  u.EV_sourceLocation = [0.5, 0.5, elevationZ * 0.5 * r_inv];

  let terrainWallCoords = [];
  let terrainWallDistances = [];
  for ( const w of terrainWalls ) {
    addWallDataToShaderArrays(w, terrainWallDistances, terrainWallCoords, source, r_inv);
  }
  u.EV_numTerrainWalls = terrainWallDistances.length;

  if ( !terrainWallCoords.length ) terrainWallCoords = [0, 0, 0, 0, 0, 0];
  if ( !terrainWallDistances.length ) terrainWallDistances = [0];

  u.EV_terrainWallCoords = terrainWallCoords;
  u.EV_terrainWallDistances = terrainWallDistances;

  let wallCoords = [];
  let wallDistances = [];
  for ( const w of heightWalls ) {
    addWallDataToShaderArrays(w, wallDistances, wallCoords, source, r_inv);
  }

  u.EV_numWalls = wallDistances.length;

  if ( !wallCoords.length ) wallCoords = [0, 0, 0, 0, 0, 0];
  if ( !wallDistances.length ) wallDistances = [0];

  u.EV_wallCoords = wallCoords;
  u.EV_wallDistances = wallDistances;
  u.EV_elevationSampler = canvas.elevation?._elevationTexture;

  // Screen-space to local coords:
  // https://ptb.discord.com/channels/732325252788387980/734082399453052938/1010914586532261909
  // shader.uniforms.EV_canvasMatrix ??= new PIXI.Matrix();
  // shader.uniforms.EV_canvasMatrix
  //   .copyFrom(canvas.stage.worldTransform)
  //   .invert()
  //   .append(mesh.transform.worldTransform);

  // Alternative version using vUvs, given that light source mesh have no rotation
  // https://ptb.discord.com/channels/732325252788387980/734082399453052938/1010999752030171136
  u.EV_transform = [
    radius * 2 / width,
    radius * 2 / height,
    (x - radius) / width,
    (y - radius) / height];

  /*
  Elevation of a given pixel from the texture value:
  texture value in the shader is between 0 and 1. Represents value / maximumPixelValue where
  maximumPixelValue is currently 255.

  To get to elevation in the light vUvs space:
  elevationCanvasUnits = (((value * maximumPixelValue * elevationStep) - elevationMin) * size) / distance;
  elevationLightUnits = elevationCanvasUnits * 0.5 * r_inv;
  = (((value * maximumPixelValue * elevationStep) - elevationMin) * size) * inv_distance * 0.5 * r_inv;
  */

  // [min, step, maxPixelValue ]
  if ( !u.EV_elevationSampler ) {
    u.EV_elevationSampler = PIXI.Texture.EMPTY;
    u.EV_hasElevationSampler = false;
  } else {
    const { elevationMin, elevationStep, maximumPixelValue} = canvas.elevation;
    const { distance, size } = canvas.scene.grid;
    const elevationMult = size * (1 / distance) * 0.5 * r_inv;
    u.EV_elevationResolution = [elevationMin, elevationStep, maximumPixelValue, elevationMult];
    u.EV_hasElevationSampler = true;
  }

  // Convert scene rectangle to local light coordinates
  const sceneRect = canvas.dimensions.sceneRect;
  const sceneLeft = circleCoord(sceneRect.left, radius, x, r_inv);
  const sceneRight = circleCoord(sceneRect.right, radius, x, r_inv);
  const sceneTop = circleCoord(sceneRect.top, radius, y, r_inv);
  const sceneBottom = circleCoord(sceneRect.bottom, radius, y, r_inv);
  u.EV_sceneDims = [sceneLeft, sceneTop, sceneRight - sceneLeft, sceneBottom - sceneTop];
}

function addWallDataToShaderArrays(w, wallDistances, wallCoords, source, r_inv = 1 / source.radius) {
  // Because walls are rectangular, we can pass the top-left and bottom-right corners
  const { x, y, radius } = source;
  const center = {x, y};

  const wallPoints = Point3d.fromWall(w, { finite: true });

  const a = pointCircleCoord(wallPoints.A.top, radius, center, r_inv);
  const b = pointCircleCoord(wallPoints.B.bottom, radius, center, r_inv);

  // Point where line from light, perpendicular to wall, intersects
  const center_shader = {x: 0.5, y: 0.5};
  const wallIx = CONFIG.GeometryLib.utils.perpendicularPoint(a, b, center_shader);
  if ( !wallIx ) return; // Likely a and b not proper wall
  const wallOriginDist = PIXI.Point.distanceBetween(center_shader, wallIx);
  wallDistances.push(wallOriginDist);

  wallCoords.push(a.x, a.y, a.z, b.x, b.y, b.z);
}

/**
 * Transform a point coordinate to be in relation to a circle center and radius.
 * Between 0 and 1 where [0.5, 0.5] is the center
 * [0, .5] is at the edge in the westerly direction.
 * [1, .5] is the edge in the easterly direction
 * @param {Point} point
 * @param {Point} center
 * @param {number} r      Radius
 * @param {number} r_inv  Inverse of the radius. Optional; for repeated calcs.
 * @returns {Point}
 */
export function pointCircleCoord(point, r, center, r_inv = 1 / r) {
  return {
    x: circleCoord(point.x, r, center.x, r_inv),
    y: circleCoord(point.y, r, center.y, r_inv),
    z: point.z * 0.5 * r_inv
  };
}

/**
 * Transform a coordinate to be in relation to a circle center and radius.
 * Between 0 and 1 where [0.5, 0.5] is the center.
 * @param {number} a    Coordinate value
 * @param {number} c    Center value, along the axis of interest
 * @param {number} r    Light circle radius
 * @param {number} r_inv  Inverse of the radius. Optional; for repeated calcs.
 * @returns {number}
 */
function circleCoord(a, r, c = 0, r_inv = 1 / r) {
  return ((a - c) * r_inv * 0.5) + 0.5;
}

/**
 * Inverse of circleCoord.
 * @param {number} p    Coordinate value, in the shader coordinate system between 0 and 1.
 * @param {number} c    Center value, along the axis of interest
 * @param {number} r    Radius
 * @returns {number}
 */
function revCircleCoord(p, r, c = 0) { // eslint-disable-line no-unused-vars
  // ((a - c) * 1/r * 0.5) + 0.5 = p
  // (a - c) * 1/r = (p - 0.5) / 0.5
  // a - c = 2 * (p - 0.5) / 1/r = 2 * (p - 0.5) * r
  // a = 2 * (p - 0.5) * r + c
  return ((p - 0.5) * r * 2) + c;
}

/**
 * Wrap LightSource.prototype._createLOS.
 * Trigger an update to the illumination and coloration uniforms, so that
 * the light reflects the current shadow positions when dragged.
 * @returns {ClockwiseSweepPolygon}
 */
export function _createPolygonLightSource(wrapped) {
  const los = wrapped();

  // TO-DO: Only reset uniforms if:
  // 1. there are shadows
  // 2. there were previously shadows but are now none

  this._resetUniforms.illumination = true;
  this._resetUniforms.coloration = true;

  return los;
}
