import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CSS2DObject as CSS2DObject2} from "../objects/CSS2DObject";
import {CoreMath} from "../../../core/math/_Module";
export class CSS2DRenderer {
  constructor() {
    this._width = 0;
    this._height = 0;
    this._widthHalf = 0;
    this._heightHalf = 0;
    this.vector = new Vector32();
    this.viewMatrix = new Matrix42();
    this.viewProjectionMatrix = new Matrix42();
    this.cache_distanceToCameraSquared = new WeakMap();
    this.domElement = document.createElement("div");
    this._sort_objects = false;
    this._use_fog = false;
    this._fog_near = 1;
    this._fog_far = 100;
    this.a = new Vector32();
    this.b = new Vector32();
    this.domElement.classList.add("polygonjs-CSS2DRenderer");
  }
  getSize() {
    return {
      width: this._width,
      height: this._height
    };
  }
  setSize(width, height) {
    this._width = width;
    this._height = height;
    this._widthHalf = this._width / 2;
    this._heightHalf = this._height / 2;
    this.domElement.style.width = width + "px";
    this.domElement.style.height = height + "px";
  }
  renderObject(object, scene, camera) {
    if (object instanceof CSS2DObject2) {
      this.vector.setFromMatrixPosition(object.matrixWorld);
      this.vector.applyMatrix4(this.viewProjectionMatrix);
      var element = object.element;
      var style = "translate(-50%,-50%) translate(" + (this.vector.x * this._widthHalf + this._widthHalf) + "px," + (-this.vector.y * this._heightHalf + this._heightHalf) + "px)";
      element.style.webkitTransform = style;
      element.style.transform = style;
      element.style.display = object.visible && this.vector.z >= -1 && this.vector.z <= 1 ? "" : "none";
      if (this._sort_objects || this._use_fog) {
        const dist_to_squared = this.getDistanceToSquared(camera, object);
        if (this._use_fog) {
          const dist = Math.sqrt(dist_to_squared);
          const dist_remapped = CoreMath.fit(dist, this._fog_near, this._fog_far, 0, 1);
          const opacity = CoreMath.clamp(1 - dist_remapped, 0, 1);
          element.style.opacity = `${opacity}`;
          if (opacity == 0) {
            element.style.display = "none";
          }
        }
        this.cache_distanceToCameraSquared.set(object, dist_to_squared);
      }
      if (element.parentNode !== this.domElement) {
        this.domElement.appendChild(element);
      }
    }
    for (var i = 0, l = object.children.length; i < l; i++) {
      this.renderObject(object.children[i], scene, camera);
    }
  }
  getDistanceToSquared(object1, object2) {
    this.a.setFromMatrixPosition(object1.matrixWorld);
    this.b.setFromMatrixPosition(object2.matrixWorld);
    return this.a.distanceToSquared(this.b);
  }
  filterAndFlatten(scene) {
    const result = [];
    scene.traverse(function(object) {
      if (object instanceof CSS2DObject2)
        result.push(object);
    });
    return result;
  }
  render(scene, camera) {
    if (scene.autoUpdate === true)
      scene.updateMatrixWorld();
    if (camera.parent === null)
      camera.updateMatrixWorld();
    this.viewMatrix.copy(camera.matrixWorldInverse);
    this.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, this.viewMatrix);
    this.renderObject(scene, scene, camera);
    if (this._sort_objects) {
      this.zOrder(scene);
    }
  }
  set_sorting(state) {
    this._sort_objects = state;
  }
  zOrder(scene) {
    const sorted = this.filterAndFlatten(scene).sort((a, b) => {
      const distanceA = this.cache_distanceToCameraSquared.get(a);
      const distanceB = this.cache_distanceToCameraSquared.get(b);
      if (distanceA != null && distanceB != null) {
        return distanceA - distanceB;
      } else {
        return 0;
      }
    });
    const zMax = sorted.length;
    for (let i = 0, l = sorted.length; i < l; i++) {
      sorted[i].element.style.zIndex = `${zMax - i}`;
    }
  }
  set_use_fog(state) {
    this._use_fog = state;
  }
  set_fog_range(near, far) {
    this._fog_near = near;
    this._fog_far = far;
  }
}
