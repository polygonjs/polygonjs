import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SphereBufferGeometry} from 'three/src/geometries/SphereBufferGeometry';
import {IcosahedronBufferGeometry} from 'three/src/geometries/IcosahedronBufferGeometry';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface SphereSopParams extends DefaultOperationParams {
	type: number;
	radius: number;
	resolution: Vector2;
	open: boolean;
	phiStart: number;
	phiLength: number;
	thetaStart: number;
	thetaLength: number;
	detail: number;
	center: Vector3;
}

enum SphereType {
	DEFAULT = 'default',
	ISOCAHEDRON = 'isocahedron',
}
type SphereTypes = {[key in SphereType]: number};
export const SPHERE_TYPE: SphereTypes = {
	default: 0,
	isocahedron: 1,
};
export const SPHERE_TYPES: Array<SphereType> = [SphereType.DEFAULT, SphereType.ISOCAHEDRON];

export class SphereSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: SphereSopParams = {
		type: SPHERE_TYPE.default,
		radius: 1,
		resolution: new Vector2(30, 30),
		open: false,
		phiStart: 0,
		phiLength: Math.PI * 2,
		thetaStart: 0,
		thetaLength: Math.PI,
		detail: 1,
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'sphere'> {
		return 'sphere';
	}

	cook(input_contents: CoreGroup[], params: SphereSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			return this._cook_with_input(core_group, params);
		} else {
			return this._cook_without_input(params);
		}
	}
	private _cook_without_input(params: SphereSopParams) {
		const geometry = this._create_required_geometry(params);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.create_core_group_from_geometry(geometry);
	}
	private _cook_with_input(core_group: CoreGroup, params: SphereSopParams) {
		const bbox = core_group.boundingBox();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);

		const geometry = this._create_required_geometry(params);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		geometry.translate(center.x, center.y, center.z);
		geometry.scale(size.x, size.y, size.z);
		return this.create_core_group_from_geometry(geometry);
	}

	private _create_required_geometry(params: SphereSopParams) {
		if (params.type == SPHERE_TYPE.default) {
			return this._create_default_sphere(params);
		} else {
			return this._create_default_isocahedron(params);
		}
	}

	private _create_default_sphere(params: SphereSopParams) {
		if (params.open) {
			return new SphereBufferGeometry(
				params.radius,
				params.resolution.x,
				params.resolution.y,
				params.phiStart,
				params.phiLength,
				params.thetaStart,
				params.thetaLength
			);
		} else {
			return new SphereBufferGeometry(params.radius, params.resolution.x, params.resolution.y);
		}
	}
	_create_default_isocahedron(params: SphereSopParams) {
		return new IcosahedronBufferGeometry(params.radius, params.detail);
	}
}
