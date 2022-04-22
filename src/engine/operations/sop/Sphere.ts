import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SphereBufferGeometry} from 'three';
import {IcosahedronBufferGeometry} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

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
	static override readonly DEFAULT_PARAMS: SphereSopParams = {
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
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'sphere'> {
		return 'sphere';
	}

	override cook(input_contents: CoreGroup[], params: SphereSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			return this._cookWithInput(core_group, params);
		} else {
			return this._cookWithoutInput(params);
		}
	}
	private _cookWithoutInput(params: SphereSopParams) {
		const geometry = this._createRequiredGeometry(params);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.createCoreGroupFromGeometry(geometry);
	}
	private _cookWithInput(core_group: CoreGroup, params: SphereSopParams) {
		const bbox = core_group.boundingBox();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);

		const geometry = this._createRequiredGeometry(params);
		geometry.scale(size.x, size.y, size.z);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		geometry.translate(center.x, center.y, center.z);
		return this.createCoreGroupFromGeometry(geometry);
	}

	private _createRequiredGeometry(params: SphereSopParams) {
		if (params.type == SPHERE_TYPE.default) {
			return this._createDefaultSphere(params);
		} else {
			return this._createDefaultIsocahedron(params);
		}
	}

	private _createDefaultSphere(params: SphereSopParams) {
		if (isBooleanTrue(params.open)) {
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
	_createDefaultIsocahedron(params: SphereSopParams) {
		return new IcosahedronBufferGeometry(params.radius, params.detail);
	}
}
