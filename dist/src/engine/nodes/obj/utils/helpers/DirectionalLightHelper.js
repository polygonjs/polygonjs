import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {BaseLightHelper as BaseLightHelper2} from "./_BaseLightHelper";
import {Line as Line2} from "three/src/objects/Line";
export class DirectionalLightHelper extends BaseLightHelper2 {
  constructor() {
    super(...arguments);
    this._square = new Line2();
    this._line_material = new LineBasicMaterial2({fog: false});
  }
  build_helper() {
    const geometry = new BufferGeometry2();
    const size = 1;
    geometry.setAttribute("position", new Float32BufferAttribute([-size, size, 0, size, size, 0, size, -size, 0, -size, -size, 0, -size, size, 0], 3));
    this._square.geometry = geometry;
    this._square.material = this._line_material;
    this._square.rotateX(Math.PI * 0.5);
    this._square.updateMatrix();
    this._square.matrixAutoUpdate = false;
    this.object.add(this._square);
  }
  update() {
    this._object.scale.setScalar(this.node.pv.helper_size);
    this._object.updateMatrix();
    this._line_material.color.copy(this.node.light.color);
  }
}
