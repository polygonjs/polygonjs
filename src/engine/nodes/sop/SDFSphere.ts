/**
 * Creates an SDF sphere.
 *
 *
 */

import {SDFSopNode} from './_BaseSDF';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/cad/CadConstant';
import {SDFLoader} from '../../../core/geometry/sdf/SDFLoader';

class SDFSphereSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param resulution */
	resolution = ParamConfig.INTEGER(64, {
		range: [1, 128],
		rangeLocked: [true, false],
		step,
	});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SDFSphereSopParamsConfig();

export class SDFSphereSopNode extends SDFSopNode<SDFSphereSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SDF_SPHERE;
	}

	override async cook() {
		const manifold = await SDFLoader.core();
		const geometry = manifold.sphere(this.pv.radius, this.pv.resolution);

		this.setSDFGeometry(geometry);
	}
}
