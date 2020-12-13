import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {RGBFormat} from "three/src/constants";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {OrthographicCamera as OrthographicCamera2} from "three/src/cameras/OrthographicCamera";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {LinearFilter} from "three/src/constants";
import {BokehShader, BokehDepthShader} from "../../three/examples/jsm/shaders/BokehShader2";
import {CoreScene} from "../../../core/geometry/Scene";
import DepthInstanceVertex from "./gl/DepthInstance.vert.glsl";
import {Color as Color2} from "three/src/math/Color";
import {DepthOfFieldPostNode} from "../../../engine/nodes/post/DepthOfField";
export class BokehPass2 {
  constructor(_depth_of_field_node, _scene, _camera, _resolution) {
    this._depth_of_field_node = _depth_of_field_node;
    this._scene = _scene;
    this._camera = _camera;
    this._resolution = _resolution;
    this._camera_uniforms = {mNear: {value: 0}, mFar: {value: 0}};
    this.enabled = true;
    this.needsSwap = true;
    this.clear = true;
    this.renderToScreen = true;
    this._processing_scene = new Scene2();
    this.clear_color = new Color2(1, 1, 1);
    this._core_scene = new CoreScene(this._scene);
    const shaderSettings = {
      rings: 3,
      samples: 4
    };
    this._processing_camera = new OrthographicCamera2(this._resolution.x / -2, this._resolution.x / 2, this._resolution.y / 2, this._resolution.y / -2, -1e4, 1e4);
    this._processing_camera.position.z = 100;
    this._processing_scene.add(this._processing_camera);
    var pars = {minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat};
    this._rtTextureDepth = new WebGLRenderTarget2(this._resolution.x, this._resolution.y, pars);
    this._rtTextureColor = new WebGLRenderTarget2(this._resolution.x, this._resolution.y, pars);
    var bokeh_shader = BokehShader;
    if (!bokeh_shader) {
      console.error("BokehPass relies on BokehShader");
    }
    this.bokeh_uniforms = UniformsUtils2.clone(bokeh_shader.uniforms);
    this.bokeh_uniforms["tColor"].value = this._rtTextureColor.texture;
    this.bokeh_uniforms["tDepth"].value = this._rtTextureDepth.texture;
    this.bokeh_uniforms["textureWidth"].value = this._resolution.x;
    this.bokeh_uniforms["textureHeight"].value = this._resolution.y;
    this.bokeh_material = new ShaderMaterial2({
      uniforms: this.bokeh_uniforms,
      vertexShader: bokeh_shader.vertexShader,
      fragmentShader: bokeh_shader.fragmentShader,
      defines: {
        RINGS: shaderSettings.rings,
        SAMPLES: shaderSettings.samples
      }
    });
    this._quad = new Mesh2(new PlaneBufferGeometry2(this._resolution.x, this._resolution.y), this.bokeh_material);
    this._quad.position.z = -500;
    this._processing_scene.add(this._quad);
    var depthShader = BokehDepthShader;
    if (!depthShader) {
      console.error("BokehPass relies on BokehDepthShader");
    }
    this.materialDepth = new ShaderMaterial2({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader
    });
    this.materialDepthInstance = new ShaderMaterial2({
      uniforms: depthShader.uniforms,
      vertexShader: DepthInstanceVertex,
      fragmentShader: depthShader.fragmentShader
    });
    this.update_camera_uniforms_with_node(this._depth_of_field_node, this._camera);
  }
  setSize(width, height) {
    this._rtTextureDepth.setSize(width, height);
    this._rtTextureColor.setSize(width, height);
    this.bokeh_uniforms["textureWidth"].value = width;
    this.bokeh_uniforms["textureHeight"].value = height;
  }
  dispose() {
    this._rtTextureDepth.dispose();
    this._rtTextureColor.dispose();
  }
  render(renderer, writeBuffer, readBuffer) {
    const debug_display_depth = false;
    const prev_clear_color = renderer.getClearColor();
    renderer.setClearColor(this.clear_color);
    renderer.clear();
    renderer.setRenderTarget(this._rtTextureColor);
    renderer.clear();
    renderer.render(this._scene, this._camera);
    renderer.setClearColor(0);
    this._core_scene.with_overriden_material(this.materialDepth, this.materialDepthInstance, this._camera_uniforms, () => {
      if (debug_display_depth) {
        renderer.setRenderTarget(null);
      } else {
        renderer.setRenderTarget(this._rtTextureDepth);
      }
      renderer.clear();
      renderer.render(this._scene, this._camera);
    });
    if (!debug_display_depth) {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(this._processing_scene, this._processing_camera);
    }
    renderer.setClearColor(prev_clear_color);
  }
  update_camera_uniforms_with_node(node, camera) {
    this.bokeh_uniforms["focalLength"].value = camera.getFocalLength();
    this.bokeh_uniforms["znear"].value = camera.near;
    this.bokeh_uniforms["zfar"].value = camera.far;
    var sdistance = DepthOfFieldPostNode.smoothstep(camera.near, camera.far, node.pv.focal_depth);
    var ldistance = DepthOfFieldPostNode.linearize(1 - sdistance, camera.near, camera.far);
    this.bokeh_uniforms["focalDepth"].value = ldistance;
    this._camera_uniforms = {
      mNear: {value: camera.near},
      mFar: {value: camera.far}
    };
    for (let material of [this.materialDepth, this.materialDepthInstance]) {
      material.uniforms["mNear"].value = this._camera_uniforms["mNear"].value;
      material.uniforms["mFar"].value = this._camera_uniforms["mFar"].value;
    }
  }
}
