/**
 * Allows easy position of lights, or any object around another one.
 *
 * @remarks
 * This node transforms its children with latitude and longitude controls, instead of typical translate and rotate. It makes it more intuitive to position objects such as lights.
 *
 * Note that there is an equivalent node at the OBJ level
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PolarTransformSopOperation} from '../../operations/sop/PolarTransform';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
const DEFAULT = PolarTransformSopOperation.DEFAULT_PARAMS;
class PolarTransformSopParamConfig extends NodeParamsConfig {
	/** @param sets if this node should transform objects or geometries */
	applyOn = ParamConfig.INTEGER(DEFAULT.applyOn, {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((target_type, i) => {
				return {name: target_type, value: i};
			}),
		},
	});
	/** @param center of the transform */
	center = ParamConfig.VECTOR3(DEFAULT.center.toArray());
	/** @param moves the objects along the longitude, which is equivalent to a rotation on the y axis */
	longitude = ParamConfig.FLOAT(DEFAULT.longitude, {
		range: [-360, 360],
	});
	/** @param moves the objects along the latitude, which is equivalent to a rotation on the z or x axis */
	latitude = ParamConfig.FLOAT(DEFAULT.latitude, {
		range: [-180, 180],
	});
	/** @param moves the point aways from the center */
	depth = ParamConfig.FLOAT(DEFAULT.depth, {
		range: [0, 10],
	});
}
const ParamsConfig = new PolarTransformSopParamConfig();

export class PolarTransformSopNode extends TypedSopNode<PolarTransformSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'polarTransform';
	}

	static override displayedInputNames(): string[] {
		return ['geometries or objects to transform'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(PolarTransformSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: PolarTransformSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PolarTransformSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	setApplyOn(mode: TransformTargetType) {
		this.p.applyOn.set(TRANSFORM_TARGET_TYPES.indexOf(mode));
	}
}
