/**
 * Transform input geometries or objects.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ROTATION_ORDERS, TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {TransformSopOperation} from '../../operations/sop/Transform';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TransformSopOperation.DEFAULT_PARAMS;
class TransformSopParamConfig extends NodeParamsConfig {
	/** @param sets if this node should transform objects or geometries */
	applyOn = ParamConfig.INTEGER(DEFAULT.applyOn, {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((target_type, i) => {
				return {name: target_type, value: i};
			}),
		},
	});
	/** @param group this applies to */
	group = ParamConfig.STRING(DEFAULT.group, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)},
	});

	// transform
	/** @param rotation order */
	rotationOrder = ParamConfig.INTEGER(DEFAULT.rotationOrder, {
		menu: {
			entries: ROTATION_ORDERS.map((order, v) => {
				return {name: order, value: v};
			}),
		},
	});
	/** @param translate */
	t = ParamConfig.VECTOR3(DEFAULT.t);
	/** @param rotation */
	r = ParamConfig.VECTOR3(DEFAULT.r);
	/** @param scale */
	s = ParamConfig.VECTOR3(DEFAULT.s);
	/** @param scale (as a float) */
	scale = ParamConfig.FLOAT(DEFAULT.scale, {range: [0, 10]});
	// look_at = ParamConfig.OPERATOR_PATH('');
	// up = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param pivot */
	pivot = ParamConfig.VECTOR3(DEFAULT.pivot, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)},
	});
}
const ParamsConfig = new TransformSopParamConfig();

export class TransformSopNode extends TypedSopNode<TransformSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transform';
	}

	static displayedInputNames(): string[] {
		return ['geometries or objects to transform'];
	}

	initializeNode() {
		// this.uiData.set_param_label(this.p.applyOn, (v)=>TARGET_TYPES[v])
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(TransformSopOperation.INPUT_CLONED_STATE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.applyOn], () => {
					return TRANSFORM_TARGET_TYPES[this.pv.applyOn];
				});
			});
		});
	}

	private _operation: TransformSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TransformSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
