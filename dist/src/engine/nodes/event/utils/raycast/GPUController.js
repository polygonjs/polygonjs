import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {LinearFilter, NearestFilter, RGBAFormat, FloatType, NoToneMapping, LinearEncoding} from "three/src/constants";
import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
export class RaycastGPUController {
  constructor(_node) {
    this._node = _node;
    this._resolved_material = null;
    this._restore_context = {
      scene: {
        overrideMaterial: null
      },
      renderer: {
        toneMapping: -1,
        outputEncoding: -1
      }
    };
    this._mouse = new Vector22();
    this._mouse_array = [0, 0];
    this._read = new Float32Array(4);
    this._param_read = [0, 0, 0, 0];
  }
  update_mouse(context) {
    if (!(context.canvas && context.event)) {
      return;
    }
    if (context.event instanceof MouseEvent) {
      this._mouse.x = context.event.offsetX / context.canvas.offsetWidth;
      this._mouse.y = 1 - context.event.offsetY / context.canvas.offsetHeight;
      this._mouse.toArray(this._mouse_array);
      this._node.p.mouse.set(this._mouse_array);
    }
  }
  process_event(context) {
    if (!(context.canvas && context.camera_node)) {
      return;
    }
    const camera_node = context.camera_node;
    const renderer_controller = camera_node.render_controller;
    if (renderer_controller) {
      const canvas = context.canvas;
      this._render_target = this._render_target || new WebGLRenderTarget2(canvas.offsetWidth, canvas.offsetHeight, {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType
      });
      if (!this._resolved_material) {
        this.update_material();
        console.warn("no material found");
        return;
      }
      const threejs_camera = camera_node;
      const scene = renderer_controller.resolved_scene || camera_node.scene.default_scene;
      const renderer = renderer_controller.renderer(canvas);
      this._modify_scene_and_renderer(scene, renderer);
      renderer.setRenderTarget(this._render_target);
      renderer.clear();
      renderer.render(scene, threejs_camera.object);
      renderer.setRenderTarget(null);
      this._restore_scene_and_renderer(scene, renderer);
      renderer.readRenderTargetPixels(this._render_target, Math.round(this._mouse.x * canvas.offsetWidth), Math.round(this._mouse.y * canvas.offsetHeight), 1, 1, this._read);
      this._param_read[0] = this._read[0];
      this._param_read[1] = this._read[1];
      this._param_read[2] = this._read[2];
      this._param_read[3] = this._read[3];
      this._node.p.pixel_value.set(this._param_read);
      if (this._node.pv.pixel_value.x > this._node.pv.hit_threshold) {
        this._node.trigger_hit(context);
      } else {
        this._node.trigger_miss(context);
      }
    }
  }
  _modify_scene_and_renderer(scene, renderer) {
    this._restore_context.scene.overrideMaterial = scene.overrideMaterial;
    this._restore_context.renderer.outputEncoding = renderer.outputEncoding;
    this._restore_context.renderer.toneMapping = renderer.toneMapping;
    scene.overrideMaterial = this._resolved_material;
    renderer.toneMapping = NoToneMapping;
    renderer.outputEncoding = LinearEncoding;
  }
  _restore_scene_and_renderer(scene, renderer) {
    scene.overrideMaterial = this._restore_context.scene.overrideMaterial;
    renderer.outputEncoding = this._restore_context.renderer.outputEncoding;
    renderer.toneMapping = this._restore_context.renderer.toneMapping;
  }
  update_material() {
    const node = this._node.p.material.found_node();
    if (node) {
      if (node.node_context() == NodeContext2.MAT) {
        this._resolved_material = node.material;
      } else {
        this._node.states.error.set("target is not an obj");
      }
    } else {
      this._node.states.error.set("no target found");
    }
  }
  static PARAM_CALLBACK_update_material(node) {
    node.gpu_controller.update_material();
  }
}
