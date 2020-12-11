import {BackSide} from "three/src/constants";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {Line as Line2} from "three/src/objects/Line";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {MeshBasicMaterial as MeshBasicMaterial2} from "three/src/materials/MeshBasicMaterial";
function RectAreaLightHelper(light, color) {
  this.light = light;
  this.color = color;
  var positions = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0];
  var geometry = new BufferGeometry2();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  var material = new LineBasicMaterial2({fog: false});
  Line2.call(this, geometry, material);
  this.type = "RectAreaLightHelper";
  var positions2 = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
  var geometry2 = new BufferGeometry2();
  geometry2.setAttribute("position", new Float32BufferAttribute(positions2, 3));
  geometry2.computeBoundingSphere();
  this.add(new Mesh2(geometry2, new MeshBasicMaterial2({side: BackSide, fog: false})));
  this.update();
}
RectAreaLightHelper.prototype = Object.create(Line2.prototype);
RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;
RectAreaLightHelper.prototype.update = function() {
  this.scale.set(0.5 * this.light.width, 0.5 * this.light.height, 1);
  if (this.color !== void 0) {
    this.material.color.set(this.color);
    this.children[0].material.color.set(this.color);
  } else {
    this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
    var c = this.material.color;
    var max = Math.max(c.r, c.g, c.b);
    if (max > 1)
      c.multiplyScalar(1 / max);
    this.children[0].material.color.copy(this.material.color);
  }
};
RectAreaLightHelper.prototype.dispose = function() {
  this.geometry.dispose();
  this.material.dispose();
  this.children[0].geometry.dispose();
  this.children[0].material.dispose();
};
export {RectAreaLightHelper};
