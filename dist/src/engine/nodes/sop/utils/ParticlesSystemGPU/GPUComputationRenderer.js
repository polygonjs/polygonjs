import {Camera as Camera2} from "three/src/cameras/Camera";
import {ClampToEdgeWrapping, FloatType, HalfFloatType, NearestFilter, RGBAFormat} from "three/src/constants";
import {DataTexture as DataTexture2} from "three/src/textures/DataTexture";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {PlaneBufferGeometry as PlaneBufferGeometry2} from "three/src/geometries/PlaneBufferGeometry";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
var GPUComputationRenderer = function(sizeX, sizeY, renderer) {
  this.variables = [];
  this.currentTextureIndex = 0;
  var dataType = FloatType;
  var scene = new Scene2();
  scene.matrixAutoUpdate = false;
  var camera = new Camera2();
  camera.position.z = 1;
  camera.matrixAutoUpdate = false;
  camera.updateMatrix();
  var passThruUniforms = {
    passThruTexture: {value: null}
  };
  var passThruShader = createShaderMaterial(getPassThroughFragmentShader(), passThruUniforms);
  var mesh = new Mesh2(new PlaneBufferGeometry2(2, 2), passThruShader);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  scene.add(mesh);
  this.setDataType = function(type) {
    dataType = type;
    return this;
  };
  this.addVariable = function(variableName, computeFragmentShader, initialValueTexture) {
    var material = this.createShaderMaterial(computeFragmentShader);
    var variable = {
      name: variableName,
      initialValueTexture,
      material,
      dependencies: null,
      renderTargets: [],
      wrapS: null,
      wrapT: null,
      minFilter: NearestFilter,
      magFilter: NearestFilter
    };
    this.variables.push(variable);
    return variable;
  };
  this.setVariableDependencies = function(variable, dependencies) {
    variable.dependencies = dependencies;
  };
  this.init = function() {
    if (renderer.capabilities.isWebGL2 === false && renderer.extensions.has("OES_texture_float") === false) {
      return "No OES_texture_float support for float textures.";
    }
    if (renderer.capabilities.maxVertexTextures === 0) {
      return "No support for vertex shader textures.";
    }
    for (var i = 0; i < this.variables.length; i++) {
      var variable = this.variables[i];
      variable.renderTargets[0] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
      variable.renderTargets[1] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
      this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]);
      this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]);
      var material = variable.material;
      var uniforms = material.uniforms;
      if (variable.dependencies !== null) {
        for (var d = 0; d < variable.dependencies.length; d++) {
          var depVar = variable.dependencies[d];
          if (depVar.name !== variable.name) {
            var found = false;
            for (var j = 0; j < this.variables.length; j++) {
              if (depVar.name === this.variables[j].name) {
                found = true;
                break;
              }
            }
            if (!found) {
              return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;
            }
          }
          uniforms[depVar.name] = {value: null};
        }
      }
    }
    this.currentTextureIndex = 0;
    return null;
  };
  this.compute = function() {
    var currentTextureIndex = this.currentTextureIndex;
    var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;
    for (var i = 0, il = this.variables.length; i < il; i++) {
      var variable = this.variables[i];
      if (variable.dependencies !== null) {
        var uniforms = variable.material.uniforms;
        for (var d = 0, dl = variable.dependencies.length; d < dl; d++) {
          var depVar = variable.dependencies[d];
          uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
        }
      }
      this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
    }
    this.currentTextureIndex = nextTextureIndex;
  };
  this.getCurrentRenderTarget = function(variable) {
    return variable.renderTargets[this.currentTextureIndex];
  };
  this.getAlternateRenderTarget = function(variable) {
    return variable.renderTargets[this.currentTextureIndex === 0 ? 1 : 0];
  };
  function addResolutionDefine(materialShader) {
    materialShader.defines.resolution = "vec2( " + sizeX.toFixed(1) + ", " + sizeY.toFixed(1) + " )";
  }
  this.addResolutionDefine = addResolutionDefine;
  function createShaderMaterial(computeFragmentShader, uniforms) {
    uniforms = uniforms || {};
    var material = new ShaderMaterial2({
      uniforms,
      vertexShader: getPassThroughVertexShader(),
      fragmentShader: computeFragmentShader
    });
    addResolutionDefine(material);
    return material;
  }
  this.createShaderMaterial = createShaderMaterial;
  this.createRenderTarget = function(sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter) {
    sizeXTexture = sizeXTexture || sizeX;
    sizeYTexture = sizeYTexture || sizeY;
    wrapS = wrapS || ClampToEdgeWrapping;
    wrapT = wrapT || ClampToEdgeWrapping;
    minFilter = minFilter || NearestFilter;
    magFilter = magFilter || NearestFilter;
    var renderTarget = new WebGLRenderTarget2(sizeXTexture, sizeYTexture, {
      wrapS,
      wrapT,
      minFilter,
      magFilter,
      format: RGBAFormat,
      type: dataType,
      depthBuffer: false
    });
    return renderTarget;
  };
  this.createTexture = function() {
    var data = new Float32Array(sizeX * sizeY * 4);
    return new DataTexture2(data, sizeX, sizeY, RGBAFormat, FloatType);
  };
  this.renderTexture = function(input, output) {
    passThruUniforms.passThruTexture.value = input;
    this.doRenderTarget(passThruShader, output);
    passThruUniforms.passThruTexture.value = null;
  };
  this.doRenderTarget = function(material, output) {
    var currentRenderTarget = renderer.getRenderTarget();
    mesh.material = material;
    renderer.setRenderTarget(output);
    renderer.render(scene, camera);
    mesh.material = passThruShader;
    renderer.setRenderTarget(currentRenderTarget);
  };
  function getPassThroughVertexShader() {
    return "void main()	{\n\n	gl_Position = vec4( position, 1.0 );\n\n}\n";
  }
  function getPassThroughFragmentShader() {
    return "uniform sampler2D passThruTexture;\n\nvoid main() {\n\n	vec2 uv = gl_FragCoord.xy / resolution.xy;\n\n	gl_FragColor = texture2D( passThruTexture, uv );\n\n}\n";
  }
};
export {GPUComputationRenderer};
