/**
 * Creates a plane with a distorted reflection, to simulate an ocean surface
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {OceanPlaneSopOperation} from '../../operations/sop/OceanPlane';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Number3} from '../../../types/GlobalTypes';
import {NodeContext} from '../../poly/NodeContext';
const DEFAULT = OceanPlaneSopOperation.DEFAULT_PARAMS;

class OceanPlaneSopParamsConfig extends NodeParamsConfig {
	/** @param sun direction */
	sunDirection = ParamConfig.VECTOR3(DEFAULT.sunDirection.toArray());
	/** @param sun color */
	sunColor = ParamConfig.COLOR(DEFAULT.sunColor.toArray() as Number3);
	/** @param water color */
	waterColor = ParamConfig.COLOR(DEFAULT.waterColor.toArray() as Number3);
	/** @param distortion scale */
	distortionScale = ParamConfig.FLOAT(DEFAULT.distortionScale, {
		range: [0, 10],
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
	/** @param normals Texture */
	normals = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
	});
	/** @param render reflection */
	renderReflection = ParamConfig.BOOLEAN(DEFAULT.renderReflection);
}
const ParamsConfig = new OceanPlaneSopParamsConfig();

export class OceanPlaneSopNode extends TypedSopNode<OceanPlaneSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'oceanPlane';
	}

	initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: OceanPlaneSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new OceanPlaneSopOperation(this._scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
