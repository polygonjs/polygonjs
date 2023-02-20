/**
 * Creates a plane with a distorted reflection, to simulate an ocean surface
 *
 * @remarks
 *
 * Without any input, this node creates a very large plane.
 * If you would like the ocean to be restricted to a smaller area, such as a disk,
 * you can plug in an input geometry. Just make sure that this geometry should be facing the z axis,
 * as it will currently be rotated internally to face the y axis. Note that this behavior may change in the future
 * to be made more intuitive.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {OceanPlaneSopOperation} from '../../operations/sop/OceanPlane';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Number3} from '../../../types/GlobalTypes';
const DEFAULT = OceanPlaneSopOperation.DEFAULT_PARAMS;

class OceanPlaneSopParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param reflection direction */
	direction = ParamConfig.VECTOR3(DEFAULT.direction.toArray());
	/** @param sun direction */
	sunDirection = ParamConfig.VECTOR3(DEFAULT.sunDirection.toArray());
	/** @param sun color */
	sunColor = ParamConfig.COLOR(DEFAULT.sunColor.toArray() as Number3);
	/** @param water color */
	waterColor = ParamConfig.COLOR(DEFAULT.waterColor.toArray() as Number3);
	/** @param reflection color */
	reflectionColor = ParamConfig.COLOR(DEFAULT.reflectionColor.toArray() as Number3);
	/** @param reflection fresnel */
	reflectionFresnel = ParamConfig.FLOAT(DEFAULT.reflectionFresnel);
	/** @param waves Height */
	wavesHeight = ParamConfig.FLOAT(DEFAULT.wavesHeight, {
		range: [0, 10],
		rangeLocked: [false, false],
	});
	/** @param distortion scale */
	distortionScale = ParamConfig.FLOAT(DEFAULT.distortionScale, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param distortion speed */
	timeScale = ParamConfig.FLOAT(DEFAULT.timeScale, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param size */
	size = ParamConfig.FLOAT(DEFAULT.size, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	advanced = ParamConfig.FOLDER();
	/** @param render reflection */
	renderReflection = ParamConfig.BOOLEAN(DEFAULT.renderReflection);
	/** @param normal Bias - adjusts this if the reflections are too grainy */
	normalBias = ParamConfig.FLOAT(DEFAULT.normalBias, {
		range: [0, 0.1],
		rangeLocked: [false, false],
	});
	/** @param multisamples */
	multisamples = ParamConfig.INTEGER(DEFAULT.multisamples, {
		range: [0, 4],
		rangeLocked: [true, false],
	});
	/** @param reacts to fog */
	useFog = ParamConfig.BOOLEAN(DEFAULT.useFog);
}
const ParamsConfig = new OceanPlaneSopParamsConfig();

export class OceanPlaneSopNode extends TypedSopNode<OceanPlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'oceanPlane';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _operation: OceanPlaneSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new OceanPlaneSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
