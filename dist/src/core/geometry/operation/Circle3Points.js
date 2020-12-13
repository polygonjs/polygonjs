import {Vector3 as Vector32} from "three/src/math/Vector3";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {TypeAssert} from "../../../engine/poly/Assert";
export var PointsCountMode;
(function(PointsCountMode2) {
  PointsCountMode2["SEGMENTS_COUNT"] = "segments count";
  PointsCountMode2["SEGMENTS_LENGTH"] = "segments length";
})(PointsCountMode || (PointsCountMode = {}));
export const POINTS_COUNT_MODE = [PointsCountMode.SEGMENTS_COUNT, PointsCountMode.SEGMENTS_LENGTH];
export var JoinMode;
(function(JoinMode2) {
  JoinMode2["ABC"] = "abc";
  JoinMode2["ACB"] = "acb";
  JoinMode2["AB"] = "ab";
  JoinMode2["BC"] = "bc";
  JoinMode2["AC"] = "ac";
})(JoinMode || (JoinMode = {}));
export const JOIN_MODES = [JoinMode.ABC, JoinMode.ACB, JoinMode.AB, JoinMode.AC, JoinMode.BC];
export class Circle3Points {
  constructor(params) {
    this.params = params;
    this.a = new Vector32();
    this.b = new Vector32();
    this.c = new Vector32();
    this.an = new Vector32();
    this.bn = new Vector32();
    this.cn = new Vector32();
    this.ac = new Vector32();
    this.ab = new Vector32();
    this.ab_x_ac = new Vector32();
    this.part0 = new Vector32();
    this.part1 = new Vector32();
    this.divider = 1;
    this.a_center = new Vector32();
    this.center = new Vector32();
    this.normal = new Vector32();
    this.radius = 1;
    this.x = new Vector32();
    this.y = new Vector32();
    this.z = new Vector32();
    this.angle_ab = 1;
    this.angle_ac = 1;
    this.angle_bc = 1;
    this.angle = 2 * Math.PI;
    this.x_rotated = new Vector32();
    this._created_geometries = {};
  }
  created_geometries() {
    return this._created_geometries;
  }
  create(a, b, c) {
    this.a.copy(a);
    this.b.copy(b);
    this.c.copy(c);
    this._compute_axis();
    this._create_arc();
    this._create_center();
  }
  _create_arc() {
    this._compute_angle();
    const points_count = this._points_count();
    const positions = new Array(points_count * 3);
    const indices = new Array(points_count);
    const angle_increment = this.angle / (points_count - 1);
    this.x_rotated.copy(this.x).multiplyScalar(this.radius);
    let i = 0;
    for (i = 0; i < points_count; i++) {
      this.x_rotated.copy(this.x).applyAxisAngle(this.normal, angle_increment * i).multiplyScalar(this.radius).add(this.center);
      this.x_rotated.toArray(positions, i * 3);
      if (i > 0) {
        indices[(i - 1) * 2] = i - 1;
        indices[(i - 1) * 2 + 1] = i;
      }
    }
    if (this.params.full) {
      indices.push(i - 1);
      indices.push(0);
    }
    const geometry = new BufferGeometry2();
    geometry.setAttribute("position", new BufferAttribute2(new Float32Array(positions), 3));
    geometry.setIndex(indices);
    if (this.params.add_id_attribute || this.params.add_idn_attribute) {
      const ids = new Array(points_count);
      for (let i2 = 0; i2 < ids.length; i2++) {
        ids[i2] = i2;
      }
      if (this.params.add_id_attribute) {
        geometry.setAttribute("id", new BufferAttribute2(new Float32Array(ids), 1));
      }
      const idns = ids.map((id) => id / (points_count - 1));
      if (this.params.add_idn_attribute) {
        geometry.setAttribute("idn", new BufferAttribute2(new Float32Array(idns), 1));
      }
    }
    this._created_geometries.arc = geometry;
  }
  _create_center() {
    if (!this.params.center) {
      return;
    }
    const geometry = new BufferGeometry2();
    const positions = [this.center.x, this.center.y, this.center.z];
    geometry.setAttribute("position", new BufferAttribute2(new Float32Array(positions), 3));
    this._created_geometries.center = geometry;
  }
  _compute_axis() {
    this.ac.copy(this.c).sub(this.a);
    this.ab.copy(this.b).sub(this.a);
    this.ab_x_ac.copy(this.ab).cross(this.ac);
    this.divider = 2 * this.ab_x_ac.lengthSq();
    this.part0.copy(this.ab_x_ac).cross(this.ab).multiplyScalar(this.ac.lengthSq());
    this.part1.copy(this.ac).cross(this.ab_x_ac).multiplyScalar(this.ab.lengthSq());
    this.a_center.copy(this.part0).add(this.part1).divideScalar(this.divider);
    this.radius = this.a_center.length();
    this.normal.copy(this.ab_x_ac).normalize();
    this.center.copy(this.a).add(this.a_center);
  }
  _compute_angle() {
    if (!this.params.arc) {
      return;
    }
    if (this.params.full) {
      this.x.copy(this.a).sub(this.center).normalize();
      this.angle = 2 * Math.PI;
    } else {
      this.an.copy(this.a).sub(this.center).normalize();
      this.bn.copy(this.b).sub(this.center).normalize();
      this.cn.copy(this.c).sub(this.center).normalize();
      this._set_x_from_join_mode();
      this.y.copy(this.normal);
      this.z.copy(this.x).cross(this.y).normalize();
      this.angle_ab = this.an.angleTo(this.bn);
      this.angle_ac = this.an.angleTo(this.cn);
      this.angle_bc = this.bn.angleTo(this.cn);
      this._set_angle_from_join_mode();
    }
  }
  _points_count() {
    const mode = this.params.points_count_mode;
    switch (mode) {
      case PointsCountMode.SEGMENTS_COUNT: {
        return this.params.segments_count + 1;
      }
      case PointsCountMode.SEGMENTS_LENGTH: {
        let perimeter = Math.PI * this.radius * this.radius;
        if (!this.params.full) {
          perimeter *= Math.abs(this.angle) / (Math.PI * 2);
        }
        return Math.ceil(perimeter / this.params.segments_length);
      }
    }
    TypeAssert.unreachable(mode);
  }
  _set_x_from_join_mode() {
    const join_mode = this.params.join_mode;
    this.x.copy(this.a).sub(this.center).normalize();
    switch (join_mode) {
      case JoinMode.ABC: {
        return this.x.copy(this.an);
      }
      case JoinMode.ACB: {
        return this.x.copy(this.an);
      }
      case JoinMode.AB: {
        return this.x.copy(this.an);
      }
      case JoinMode.AC: {
        return this.x.copy(this.an);
      }
      case JoinMode.BC: {
        return this.x.copy(this.bn);
      }
    }
    TypeAssert.unreachable(join_mode);
  }
  _set_angle_from_join_mode() {
    const join_mode = this.params.join_mode;
    switch (join_mode) {
      case JoinMode.ABC: {
        this.angle = this.angle_ab + this.angle_bc;
        return;
      }
      case JoinMode.ACB: {
        this.angle = this.angle_ac + this.angle_bc;
        this.angle *= -1;
        return;
      }
      case JoinMode.AB: {
        this.angle = this.angle_ab;
        return;
      }
      case JoinMode.AC: {
        this.angle = this.angle_ac;
        this.angle *= -1;
        return;
      }
      case JoinMode.BC: {
        this.angle = this.angle_bc;
        return;
      }
    }
    TypeAssert.unreachable(join_mode);
  }
}
