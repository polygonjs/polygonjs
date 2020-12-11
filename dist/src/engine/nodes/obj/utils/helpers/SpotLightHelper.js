import {BaseLightHelper as BaseLightHelper2} from "./_BaseLightHelper";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {Vector3 as Vector32} from "three/src/math/Vector3";
export class SpotLightHelper extends BaseLightHelper2 {
  constructor() {
    super(...arguments);
    this._cone = new LineSegments2();
    this._line_material = new LineBasicMaterial2({fog: false});
    this._matrix_scale = new Vector32();
  }
  build_helper() {
    const geometry = new BufferGeometry2();
    const positions = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, -1, 1];
    for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
      const p1 = i / l * Math.PI * 2;
      const p2 = j / l * Math.PI * 2;
      positions.push(Math.cos(p1), Math.sin(p1), 1, Math.cos(p2), Math.sin(p2), 1);
    }
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    this._cone.geometry = geometry;
    this._cone.material = this._line_material;
    this._cone.matrixAutoUpdate = false;
    this.object.add(this._cone);
  }
  update() {
    const coneLength = (this.node.light.distance ? this.node.light.distance : 1e3) * this.node.pv.helper_size;
    const coneWidth = coneLength * Math.tan(this.node.light.angle);
    this._matrix_scale.set(coneWidth, coneWidth, coneLength);
    this._cone.matrix.identity();
    this._cone.matrix.makeRotationX(Math.PI * 0.5);
    this._cone.matrix.scale(this._matrix_scale);
    this._line_material.color.copy(this.node.light.color);
  }
}
