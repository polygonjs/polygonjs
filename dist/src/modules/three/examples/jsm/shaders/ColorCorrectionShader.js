import {Vector3 as Vector32} from "three/src/math/Vector3";
var ColorCorrectionShader = {
  uniforms: {
    tDiffuse: {value: null},
    powRGB: {value: new Vector32(2, 2, 2)},
    mulRGB: {value: new Vector32(1, 1, 1)},
    addRGB: {value: new Vector32(0, 0, 0)}
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "	vUv = uv;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform vec3 powRGB;",
    "uniform vec3 mulRGB;",
    "uniform vec3 addRGB;",
    "varying vec2 vUv;",
    "void main() {",
    "	gl_FragColor = texture2D( tDiffuse, vUv );",
    "	gl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );",
    "}"
  ].join("\n")
};
export {ColorCorrectionShader};
