/**
 * Creates a box.
 *
 * @remarks
 * If the node has no input, you can control the radius and center of the box. If the node has an input, it will create a box that encompasses the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MetaballSopOperation} from '../../operations/sop/Metaball';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = MetaballSopOperation.DEFAULT_PARAMS;
class MetaballSopParamsConfig extends NodeParamsConfig {
	/** @param resolution */
	resolution = ParamConfig.FLOAT(DEFAULT.resolution, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param isolation */
	isolation = ParamConfig.FLOAT(DEFAULT.isolation, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param metaStrength */
	useMetaStrengthAttrib = ParamConfig.BOOLEAN(DEFAULT.useMetaStrengthAttrib);
	/** @param metaStrength */
	metaStrength = ParamConfig.FLOAT(DEFAULT.metaStrength, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param enableUVs */
	enableUVs = ParamConfig.BOOLEAN(DEFAULT.enableUVs);
	/** @param enableColors */
	enableColors = ParamConfig.BOOLEAN(DEFAULT.enableColors);
	/** @param addPlanes */
	addPlanes = ParamConfig.BOOLEAN(DEFAULT.addPlanes);
	/** @param addPlaneX */
	addPlaneX = ParamConfig.BOOLEAN(DEFAULT.addPlaneX, {
		visibleIf: {addPlanes: true},
	});
	/** @param addPlaneY */
	addPlaneY = ParamConfig.BOOLEAN(DEFAULT.addPlaneY, {
		visibleIf: {addPlanes: true},
	});
	/** @param addPlaneZ */
	addPlaneZ = ParamConfig.BOOLEAN(DEFAULT.addPlaneZ, {
		visibleIf: {addPlanes: true},
	});
}
const ParamsConfig = new MetaballSopParamsConfig();

export class MetaballSopNode extends TypedSopNode<MetaballSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'metaball';
	}

	static displayedInputNames(): string[] {
		return ['geometry to create metaballs from'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MetaballSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MetaballSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MetaballSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
