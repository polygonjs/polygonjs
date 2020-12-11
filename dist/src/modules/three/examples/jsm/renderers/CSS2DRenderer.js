import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Object3D as Object3D2} from "three/src/core/Object3D";
import {Vector3 as Vector32} from "three/src/math/Vector3";
var CSS2DObject = function(element) {
  Object3D2.call(this);
  this.element = element || document.createElement("div");
  this.element.style.position = "absolute";
  this.addEventListener("removed", function() {
    this.traverse(function(object) {
      if (object.element instanceof Element && object.element.parentNode !== null) {
        object.element.parentNode.removeChild(object.element);
      }
    });
  });
};
CSS2DObject.prototype = Object.assign(Object.create(Object3D2.prototype), {
  constructor: CSS2DObject,
  copy: function(source, recursive) {
    Object3D2.prototype.copy.call(this, source, recursive);
    this.element = source.element.cloneNode(true);
    return this;
  }
});
var CSS2DRenderer = function() {
  var _this = this;
  var _width, _height;
  var _widthHalf, _heightHalf;
  var vector = new Vector32();
  var viewMatrix = new Matrix42();
  var viewProjectionMatrix = new Matrix42();
  var cache = {
    objects: new WeakMap()
  };
  var domElement = document.createElement("div");
  domElement.style.overflow = "hidden";
  this.domElement = domElement;
  this.getSize = function() {
    return {
      width: _width,
      height: _height
    };
  };
  this.setSize = function(width, height) {
    _width = width;
    _height = height;
    _widthHalf = _width / 2;
    _heightHalf = _height / 2;
    domElement.style.width = width + "px";
    domElement.style.height = height + "px";
  };
  var renderObject = function(object, scene, camera) {
    if (object instanceof CSS2DObject) {
      object.onBeforeRender(_this, scene, camera);
      vector.setFromMatrixPosition(object.matrixWorld);
      vector.applyMatrix4(viewProjectionMatrix);
      var element = object.element;
      var style = "translate(-50%,-50%) translate(" + (vector.x * _widthHalf + _widthHalf) + "px," + (-vector.y * _heightHalf + _heightHalf) + "px)";
      element.style.WebkitTransform = style;
      element.style.MozTransform = style;
      element.style.oTransform = style;
      element.style.transform = style;
      element.style.display = object.visible && vector.z >= -1 && vector.z <= 1 ? "" : "none";
      var objectData = {
        distanceToCameraSquared: getDistanceToSquared(camera, object)
      };
      cache.objects.set(object, objectData);
      if (element.parentNode !== domElement) {
        domElement.appendChild(element);
      }
      object.onAfterRender(_this, scene, camera);
    }
    for (var i = 0, l = object.children.length; i < l; i++) {
      renderObject(object.children[i], scene, camera);
    }
  };
  var getDistanceToSquared = function() {
    var a = new Vector32();
    var b = new Vector32();
    return function(object1, object2) {
      a.setFromMatrixPosition(object1.matrixWorld);
      b.setFromMatrixPosition(object2.matrixWorld);
      return a.distanceToSquared(b);
    };
  }();
  var filterAndFlatten = function(scene) {
    var result = [];
    scene.traverse(function(object) {
      if (object instanceof CSS2DObject)
        result.push(object);
    });
    return result;
  };
  var zOrder = function(scene) {
    var sorted = filterAndFlatten(scene).sort(function(a, b) {
      var distanceA = cache.objects.get(a).distanceToCameraSquared;
      var distanceB = cache.objects.get(b).distanceToCameraSquared;
      return distanceA - distanceB;
    });
    var zMax = sorted.length;
    for (var i = 0, l = sorted.length; i < l; i++) {
      sorted[i].element.style.zIndex = zMax - i;
    }
  };
  this.render = function(scene, camera) {
    if (scene.autoUpdate === true)
      scene.updateMatrixWorld();
    if (camera.parent === null)
      camera.updateMatrixWorld();
    viewMatrix.copy(camera.matrixWorldInverse);
    viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, viewMatrix);
    renderObject(scene, scene, camera);
    zOrder(scene);
  };
};
export {CSS2DObject, CSS2DRenderer};
