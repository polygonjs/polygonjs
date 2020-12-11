import {Clock as Clock2} from "three/src/core/Clock";
import {LinearFilter} from "three/src/constants";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {OrthographicCamera as OrthographicCamera2} from "three/src/cameras/OrthographicCamera";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {RGBAFormat} from "three/src/constants";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {CopyShader as CopyShader2} from "../shaders/CopyShader.js";
import {ShaderPass as ShaderPass2} from "../postprocessing/ShaderPass.js";
import {MaskPass as MaskPass2} from "../postprocessing/MaskPass.js";
import {ClearMaskPass} from "../postprocessing/MaskPass.js";
var EffectComposer = function(renderer, renderTarget) {
  this.renderer = renderer;
  if (renderTarget === void 0) {
    var parameters = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat
    };
    var size = renderer.getSize(new Vector22());
    this._pixelRatio = renderer.getPixelRatio();
    this._width = size.width;
    this._height = size.height;
    renderTarget = new WebGLRenderTarget2(this._width * this._pixelRatio, this._height * this._pixelRatio, parameters);
    renderTarget.texture.name = "EffectComposer.rt1";
  } else {
    this._pixelRatio = 1;
    this._width = renderTarget.width;
    this._height = renderTarget.height;
  }
  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();
  this.renderTarget2.texture.name = "EffectComposer.rt2";
  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;
  this.renderToScreen = true;
  this.passes = [];
  if (CopyShader2 === void 0) {
    console.error("THREE.EffectComposer relies on CopyShader");
  }
  if (ShaderPass2 === void 0) {
    console.error("THREE.EffectComposer relies on ShaderPass");
  }
  this.copyPass = new ShaderPass2(CopyShader2);
  this.clock = new Clock2();
};
Object.assign(EffectComposer.prototype, {
  swapBuffers: function() {
    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  },
  addPass: function(pass) {
    this.passes.push(pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  },
  insertPass: function(pass, index) {
    this.passes.splice(index, 0, pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  },
  removePass: function(pass) {
    const index = this.passes.indexOf(pass);
    if (index !== -1) {
      this.passes.splice(index, 1);
    }
  },
  isLastEnabledPass: function(passIndex) {
    for (var i = passIndex + 1; i < this.passes.length; i++) {
      if (this.passes[i].enabled) {
        return false;
      }
    }
    return true;
  },
  render: function(deltaTime) {
    if (deltaTime === void 0) {
      deltaTime = this.clock.getDelta();
    }
    var currentRenderTarget = this.renderer.getRenderTarget();
    var maskActive = false;
    var pass, i, il = this.passes.length;
    for (i = 0; i < il; i++) {
      pass = this.passes[i];
      if (pass.enabled === false)
        continue;
      pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);
      if (pass.needsSwap) {
        if (maskActive) {
          var context = this.renderer.getContext();
          var stencil = this.renderer.state.buffers.stencil;
          stencil.setFunc(context.NOTEQUAL, 1, 4294967295);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
          stencil.setFunc(context.EQUAL, 1, 4294967295);
        }
        this.swapBuffers();
      }
      if (MaskPass2 !== void 0) {
        if (pass instanceof MaskPass2) {
          maskActive = true;
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false;
        }
      }
    }
    this.renderer.setRenderTarget(currentRenderTarget);
  },
  reset: function(renderTarget) {
    if (renderTarget === void 0) {
      var size = this.renderer.getSize(new Vector22());
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  },
  setSize: function(width, height) {
    this._width = width;
    this._height = height;
    var effectiveWidth = this._width * this._pixelRatio;
    var effectiveHeight = this._height * this._pixelRatio;
    this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight);
    for (var i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(effectiveWidth, effectiveHeight);
    }
  },
  setPixelRatio: function(pixelRatio) {
    this._pixelRatio = pixelRatio;
    this.setSize(this._width, this._height);
  }
});
var Pass = function() {
  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;
  this.renderToScreen = false;
};
Object.assign(Pass.prototype, {
  setSize: function() {
  },
  render: function() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
});
Pass.FullScreenQuad = function() {
  var camera = new OrthographicCamera2(-1, 1, 1, -1, 0, 1);
  var geometry = new PlaneBufferGeometry2(2, 2);
  var FullScreenQuad = function(material) {
    this._mesh = new Mesh2(geometry, material);
  };
  Object.defineProperty(FullScreenQuad.prototype, "material", {
    get: function() {
      return this._mesh.material;
    },
    set: function(value) {
      this._mesh.material = value;
    }
  });
  Object.assign(FullScreenQuad.prototype, {
    dispose: function() {
      this._mesh.geometry.dispose();
    },
    render: function(renderer) {
      renderer.render(this._mesh, camera);
    }
  });
  return FullScreenQuad;
}();
export {EffectComposer, Pass};
