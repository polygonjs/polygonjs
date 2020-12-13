import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {WebGLMultisampleRenderTarget as WebGLMultisampleRenderTarget2} from "three/src/renderers/WebGLMultisampleRenderTarget";
const CONTEXT_OPTIONS = {};
var WebGLContext;
(function(WebGLContext2) {
  WebGLContext2["WEBGL"] = "webgl";
  WebGLContext2["WEBGL2"] = "webgl2";
  WebGLContext2["EXPERIMENTAL_WEBGL"] = "experimental-webgl";
  WebGLContext2["EXPERIMENTAL_WEBGL2"] = "experimental-webgl2";
})(WebGLContext || (WebGLContext = {}));
export class RenderersController {
  constructor() {
    this._next_renderer_id = 0;
    this._next_env_map_id = 0;
    this._renderers = {};
    this._env_maps = {};
    this._require_webgl2 = false;
    this._resolves = [];
  }
  set_require_webgl2() {
    if (!this._require_webgl2) {
      this._require_webgl2 = true;
    }
  }
  webgl2_available() {
    if (this._webgl2_available === void 0) {
      this._webgl2_available = this._set_webgl2_available();
    }
    return this._webgl2_available;
  }
  _set_webgl2_available() {
    const canvas = document.createElement("canvas");
    return (window.WebGL2RenderingContext && canvas.getContext(WebGLContext.WEBGL2)) != null;
  }
  rendering_context(canvas) {
    let gl = null;
    if (this._require_webgl2) {
      gl = this._rendering_context_webgl(canvas, true);
      if (!gl) {
        console.warn("failed to create webgl2 context");
      }
    }
    if (!gl) {
      gl = this._rendering_context_webgl(canvas, false);
    }
    return gl;
  }
  _rendering_context_webgl(canvas, webgl2) {
    let context_name;
    if (this.webgl2_available()) {
      context_name = WebGLContext.WEBGL2;
    } else {
      context_name = webgl2 ? WebGLContext.WEBGL2 : WebGLContext.WEBGL;
    }
    let gl = canvas.getContext(context_name, CONTEXT_OPTIONS);
    if (!gl) {
      context_name = webgl2 ? WebGLContext.EXPERIMENTAL_WEBGL2 : WebGLContext.EXPERIMENTAL_WEBGL;
      gl = canvas.getContext(context_name, CONTEXT_OPTIONS);
    }
    return gl;
  }
  register_renderer(renderer) {
    if (renderer._polygon_id) {
      throw new Error("render already registered");
    }
    renderer._polygon_id = this._next_renderer_id += 1;
    this._renderers[renderer._polygon_id] = renderer;
    if (Object.keys(this._renderers).length == 1) {
      this.flush_callbacks_with_renderer(renderer);
    }
  }
  deregister_renderer(renderer) {
    delete this._renderers[renderer._polygon_id];
    renderer.dispose();
  }
  first_renderer() {
    const first_id = Object.keys(this._renderers)[0];
    if (first_id) {
      return this._renderers[first_id];
    }
    return null;
  }
  renderers() {
    return Object.values(this._renderers);
  }
  flush_callbacks_with_renderer(renderer) {
    let callback;
    while (callback = this._resolves.pop()) {
      callback(renderer);
    }
  }
  async wait_for_renderer() {
    const renderer = this.first_renderer();
    if (renderer) {
      return renderer;
    } else {
      return new Promise((resolve, reject) => {
        this._resolves.push(resolve);
      });
    }
  }
  render_target(width, height, parameters) {
    if (this.webgl2_available()) {
      return new WebGLMultisampleRenderTarget2(width, height, parameters);
    } else {
      return new WebGLRenderTarget2(width, height, parameters);
    }
  }
}
