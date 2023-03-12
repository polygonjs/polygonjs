/**
 * Creates an SDF box.
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/cad/CadConstant';
import Module from 'manifold-3d';

class SDFBoxSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		step,
	});
	/** @param sizes */
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SDFBoxSopParamsConfig();

export class SDFBoxSopNode extends CADSopNode<SDFBoxSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SDF_BOX;
	}

	override async cook() {
		console.log(Module);
		const wasm = await Module();
		wasm.setup();
		const manifold_1 = wasm.cube([0.2, 0.2, 0.2], true);
		console.log(manifold_1);
		this.setObjects([]);
	}
}
