/**
 * Extrudes quads.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Vector3, Plane} from 'three';

const _axis = new Vector3();
const _pos = new Vector3();
const _projectedPos = new Vector3();
const _delta = new Vector3();
const _plane = new Plane();

class QuadMirrorSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	// group = ParamConfig.STRING(DEFAULT.group, {
	// 	objectMask: true,
	// });
	/** @param axis */
	axis = ParamConfig.VECTOR3([1, 0, 0]);
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param preserve input */
	// preserveInput = ParamConfig.BOOLEAN(DEFAULT.preserveInput);
}
const ParamsConfig = new QuadMirrorSopParamsConfig();

export class QuadMirrorSopNode extends QuadSopNode<QuadMirrorSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_MIRROR;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.quadObjects();
		if (!objects) {
			this.states.error.set(`no quad objects found`);
			return;
		}
		_axis.copy(this.pv.axis).normalize();
		_plane.constant = -this.pv.center.dot(_axis);
		_plane.normal.copy(_axis);
		for (const object of objects) {
			this._mirrorObject(object);
		}

		this.setQuadObjects(objects);
	}

	private _mirrorObject(quadObject: QuadObject) {
		const geometry = quadObject.geometry;
		if (!geometry) {
			return;
		}
		const position = geometry.attributes['position'];
		const pointsCount = position.count;
		const positions = position.array;
		for (let i = 0; i < pointsCount; i++) {
			_pos.fromArray(positions, i * 3);
			_plane.projectPoint(_pos, _projectedPos);
			_delta.copy(_pos).sub(_projectedPos);
			_projectedPos.sub(_delta);
			_projectedPos.toArray(positions, i * 3);
		}
		// if ((object as Mesh).isMesh) {
		quadObjectInverse(quadObject);
		// }
	}
}
const stride = 4;
export function quadObjectInverse(quadObject: QuadObject) {
	const index = quadObject.geometry.index;
	const facesCount = index.length / 4;
	const array = index;
	for (let i = 0; i < facesCount; i++) {
		const a = array[i * stride];
		const b = array[i * stride + 1];
		const c = array[i * stride + 2];
		const d = array[i * stride + 3];
		array[i * stride] = d;
		array[i * stride + 1] = c;
		array[i * stride + 2] = b;
		array[i * stride + 3] = a;
	}
}
