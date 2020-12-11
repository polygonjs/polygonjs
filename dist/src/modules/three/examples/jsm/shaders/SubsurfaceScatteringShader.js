import {Color as Color2} from "three/src/math/Color";
import {ShaderChunk as ShaderChunk2} from "three/src/renderers/shaders/ShaderChunk";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
function replaceAll(string, find, replace) {
  return string.split(find).join(replace);
}
var meshphong_frag_head = ShaderChunk2["meshphong_frag"].slice(0, ShaderChunk2["meshphong_frag"].indexOf("void main() {"));
var meshphong_frag_body = ShaderChunk2["meshphong_frag"].slice(ShaderChunk2["meshphong_frag"].indexOf("void main() {"));
var SubsurfaceScatteringShader = {
  uniforms: UniformsUtils2.merge([
    ShaderLib2["phong"].uniforms,
    {
      thicknessMap: {value: null},
      thicknessColor: {value: new Color2(16777215)},
      thicknessDistortion: {value: 0.1},
      thicknessAmbient: {value: 0},
      thicknessAttenuation: {value: 0.1},
      thicknessPower: {value: 2},
      thicknessScale: {value: 10}
    }
  ]),
  vertexShader: [
    "#define USE_UV",
    ShaderChunk2["meshphong_vert"]
  ].join("\n"),
  fragmentShader: [
    "#define USE_UV",
    "#define SUBSURFACE",
    meshphong_frag_head,
    "uniform sampler2D thicknessMap;",
    "uniform float thicknessPower;",
    "uniform float thicknessScale;",
    "uniform float thicknessDistortion;",
    "uniform float thicknessAmbient;",
    "uniform float thicknessAttenuation;",
    "uniform vec3 thicknessColor;",
    "void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {",
    "	vec3 thickness = thicknessColor * texture2D(thicknessMap, uv).r;",
    "	vec3 scatteringHalf = normalize(directLight.direction + (geometry.normal * thicknessDistortion));",
    "	float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;",
    "	vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;",
    "	reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;",
    "}",
    meshphong_frag_body.replace("#include <lights_fragment_begin>", replaceAll(ShaderChunk2["lights_fragment_begin"], "RE_Direct( directLight, geometry, material, reflectedLight );", [
      "RE_Direct( directLight, geometry, material, reflectedLight );",
      "#if defined( SUBSURFACE ) && defined( USE_UV )",
      " RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);",
      "#endif"
    ].join("\n")))
  ].join("\n")
};
export {SubsurfaceScatteringShader};
