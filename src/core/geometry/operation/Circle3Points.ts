import {Vector3} from 'three/src/math/Vector3';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {TypeAssert} from '../../../engine/poly/Assert';

export enum PointsCountMode {
	SEGMENTS_COUNT = 'segments count',
	SEGMENTS_LENGTH = 'segments length',
}
export const POINTS_COUNT_MODE: PointsCountMode[] = [PointsCountMode.SEGMENTS_COUNT, PointsCountMode.SEGMENTS_LENGTH];
export enum JoinMode {
	ABC = 'abc',
	ACB = 'acb',
	AB = 'ab',
	BC = 'bc',
	AC = 'ac',
}
export const JOIN_MODES: JoinMode[] = [JoinMode.ABC, JoinMode.ACB, JoinMode.AB, JoinMode.AC, JoinMode.BC];

interface Circle3PointsParameters {
	arc: boolean;
	center: boolean;
	points_count_mode: PointsCountMode;
	segments_length: number;
	segments_count: number;
	full: boolean;
	join_mode: JoinMode;
	add_id_attribute: boolean;
	add_idn_attribute: boolean;
}
interface CreatedGeometries {
	arc?: BufferGeometry;
	center?: BufferGeometry;
}

export class Circle3Points {
	private a: Vector3 = new Vector3();
	private b: Vector3 = new Vector3();
	private c: Vector3 = new Vector3();
	private an: Vector3 = new Vector3();
	private bn: Vector3 = new Vector3();
	private cn: Vector3 = new Vector3();
	private ac: Vector3 = new Vector3();
	private ab: Vector3 = new Vector3();
	private ab_x_ac: Vector3 = new Vector3();
	private part0: Vector3 = new Vector3();
	private part1: Vector3 = new Vector3();
	private divider: number = 1;
	private a_center: Vector3 = new Vector3();
	private center: Vector3 = new Vector3();
	private normal: Vector3 = new Vector3();
	private radius: number = 1;
	private x: Vector3 = new Vector3();
	private y: Vector3 = new Vector3();
	private z: Vector3 = new Vector3();
	private angle_ab: number = 1;
	private angle_ac: number = 1;
	private angle_bc: number = 1;
	private angle: number = 2 * Math.PI;
	private x_rotated: Vector3 = new Vector3();

	private _created_geometries: CreatedGeometries = {};

	constructor(private params: Circle3PointsParameters) {}

	created_geometries() {
		return this._created_geometries;
	}

	create(a: Vector3, b: Vector3, c: Vector3) {
		this.a.copy(a);
		this.b.copy(b);
		this.c.copy(c);
		this._compute_axis();
		this._create_arc();
		this._create_center();
	}

	private _create_arc() {
		this._compute_angle();
		const points_count = this._points_count();
		const positions: number[] = new Array(points_count * 3);
		const indices: number[] = new Array(points_count);

		const angle_increment = this.angle / (points_count - 1);
		this.x_rotated.copy(this.x).multiplyScalar(this.radius);
		let i = 0;
		for (i = 0; i < points_count; i++) {
			this.x_rotated
				.copy(this.x)
				.applyAxisAngle(this.normal, angle_increment * i)
				.multiplyScalar(this.radius)
				.add(this.center);
			this.x_rotated.toArray(positions, i * 3);

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}
		if (this.params.full) {
			// also add the last segment
			indices.push(i - 1);
			indices.push(0);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		geometry.setIndex(indices);
		if (this.params.add_id_attribute || this.params.add_idn_attribute) {
			const ids: number[] = new Array(points_count);
			for (let i = 0; i < ids.length; i++) {
				ids[i] = i;
			}
			if (this.params.add_id_attribute) {
				geometry.setAttribute('id', new BufferAttribute(new Float32Array(ids), 1));
			}
			const idns = ids.map((id) => id / (points_count - 1));
			if (this.params.add_idn_attribute) {
				geometry.setAttribute('idn', new BufferAttribute(new Float32Array(idns), 1));
			}
		}
		this._created_geometries.arc = geometry;
	}
	private _create_center() {
		if (!this.params.center) {
			return;
		}
		const geometry = new BufferGeometry();
		const positions = [this.center.x, this.center.y, this.center.z];
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		this._created_geometries.center = geometry;
	}

	private _compute_axis() {
		this.ac.copy(this.c).sub(this.a);
		this.ab.copy(this.b).sub(this.a);
		this.ab_x_ac.copy(this.ab).cross(this.ac);
		this.divider = 2.0 * this.ab_x_ac.lengthSq();
		this.part0.copy(this.ab_x_ac).cross(this.ab).multiplyScalar(this.ac.lengthSq());
		this.part1.copy(this.ac).cross(this.ab_x_ac).multiplyScalar(this.ab.lengthSq());
		this.a_center.copy(this.part0).add(this.part1).divideScalar(this.divider);
		this.radius = this.a_center.length();
		this.normal.copy(this.ab_x_ac).normalize();
		this.center.copy(this.a).add(this.a_center);
	}
	private _compute_angle() {
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

	private _points_count() {
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
	private _set_x_from_join_mode() {
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
	private _set_angle_from_join_mode(): void {
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
