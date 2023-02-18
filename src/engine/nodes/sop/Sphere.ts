/**
 * Creates a sphere.
 *
 * @remarks
 * If the node has no input, you can control the radius and center of the sphere. If the node has an input, it will create a sphere that encompasses the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {SphereSopOperation, SPHERE_TYPES, SPHERE_TYPE} from '../../operations/sop/Sphere';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = SphereSopOperation.DEFAULT_PARAMS;
const step = 0.00001;
class SphereSopParamsConfig extends NodeParamsConfig {
	/** @param type of sphere (default sphere or isocahedron) */
	type = ParamConfig.INTEGER(DEFAULT.type, {
		menu: {
			entries: SPHERE_TYPES.map((name) => {
				return {name: name, value: SPHERE_TYPE[name]};
			}),
		},
	});
	/** @param radius of the sphere when the type is default */
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	/** @param resolution - number of segments in x and y */
	resolution = ParamConfig.VECTOR2(DEFAULT.resolution, {visibleIf: {type: SPHERE_TYPE.default}});
	/** @param if set to 1, you can then set the phiStart, phi_end, thetaStart and theta_end */
	open = ParamConfig.BOOLEAN(DEFAULT.open, {visibleIf: {type: SPHERE_TYPE.default}});
	/** @param start of phi angle */
	phiStart = ParamConfig.FLOAT(DEFAULT.phiStart, {
		range: [0, Math.PI * 2],
		visibleIf: {type: SPHERE_TYPE.default, open: true},
		step,
	});
	/** @param length of phi opening */
	phiLength = ParamConfig.FLOAT('$PI*2', {
		range: [0, Math.PI * 2],
		visibleIf: {type: SPHERE_TYPE.default, open: true},
		step,
	});
	/** @param start of theta angle */
	thetaStart = ParamConfig.FLOAT(DEFAULT.thetaStart, {
		range: [0, Math.PI],
		visibleIf: {type: SPHERE_TYPE.default, open: true},
		step,
	});
	/** @param length of theta opening */
	thetaLength = ParamConfig.FLOAT('$PI', {
		range: [0, Math.PI],
		visibleIf: {type: SPHERE_TYPE.default, open: true},
		step,
	});
	/** @param resolution of the sphere when the type is isocahedron */
	detail = ParamConfig.INTEGER(DEFAULT.detail, {
		range: [0, 5],
		rangeLocked: [true, false],
		visibleIf: {type: SPHERE_TYPE.isocahedron},
	});
	/** @param center of the sphere */
	center = ParamConfig.VECTOR3(DEFAULT.center);
	/** @param create lines instead of polygons */
	asLines = ParamConfig.BOOLEAN(DEFAULT.asLines);
}
const ParamsConfig = new SphereSopParamsConfig();

export class SphereSopNode extends TypedSopNode<SphereSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SPHERE;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(SphereSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: SphereSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SphereSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
