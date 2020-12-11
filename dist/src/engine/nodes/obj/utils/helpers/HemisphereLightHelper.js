import {Color as Color2} from "three/src/math/Color";
import {OctahedronBufferGeometry as OctahedronBufferGeometry2} from "three/src/geometries/OctahedronBufferGeometry";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {BaseLightHelper as BaseLightHelper2} from "./_BaseLightHelper";
export class HemisphereLightHelper extends BaseLightHelper2 {
  constructor() {
    super(...arguments);
    this._geometry = new OctahedronBufferGeometry2(1);
    this._quat = new Quaternion2();
    this._default_position = new Vector32(0, 1, 0);
    this._color1 = new Color2();
    this._color2 = new Color2();
  }
  build_helper() {
    this._geometry.rotateZ(Math.PI * 0.5);
    this._material.vertexColors = true;
    const position = this._geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    this._geometry.setAttribute("color", new BufferAttribute2(colors, 3));
    this._object.geometry = this._geometry;
    this._object.material = this._material;
    this._object.matrixAutoUpdate = false;
  }
  update() {
    if (!this.node.pv.position) {
      return;
    }
    this._object.position.copy(this.node.pv.position).multiplyScalar(-1);
    this._quat.setFromUnitVectors(this._default_position, this.node.pv.position);
    this._object.setRotationFromQuaternion(this._quat);
    this._object.scale.setScalar(this.node.pv.helper_size);
    this._object.updateMatrix();
    const colors = this._geometry.getAttribute("color");
    this._color1.copy(this.node.light.color);
    this._color2.copy(this.node.light.groundColor);
    for (let i = 0, l = colors.count; i < l; i++) {
      const color = i < l / 2 ? this._color1 : this._color2;
      colors.setXYZ(i, color.r, color.g, color.b);
    }
    colors.needsUpdate = true;
  }
}
