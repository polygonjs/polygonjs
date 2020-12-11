import {SphereBufferGeometry as SphereBufferGeometry2} from "three/src/geometries/SphereBufferGeometry";
import {BaseLightHelper as BaseLightHelper2} from "./_BaseLightHelper";
import {Vector3 as Vector32} from "three/src/math/Vector3";
export class PointLightHelper extends BaseLightHelper2 {
  constructor() {
    super(...arguments);
    this._matrix_scale = new Vector32(1, 1, 1);
  }
  build_helper() {
    const size = 1;
    this._object.geometry = new SphereBufferGeometry2(size, 4, 2);
    this._object.matrixAutoUpdate = false;
    this._object.material = this._material;
  }
  update() {
    const size = this.node.pv.helper_size;
    this._matrix_scale.set(size, size, size);
    this._object.matrix.identity();
    this._object.matrix.scale(this._matrix_scale);
    this._material.color.copy(this.node.light.color);
  }
}
