/**
 * Updates clipping properties
 *
 *
 */
import {Material, ShaderMaterial} from 'three';
import {UpdateMatNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';

class ClipPropertiesMatParamsConfig extends NodeParamsConfig {
	/** @param clipIntersection */
	clipIntersection = ParamConfig.BOOLEAN(0);
	/** @param clipShadows */
	clipShadows = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new ClipPropertiesMatParamsConfig();

export class ClipPropertiesMatNode extends UpdateMatNode<ShaderMaterial, ClipPropertiesMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'clipProperties';
	}

	override async cook(inputMaterials: Material[]) {
		const inputMaterial = inputMaterials[0] as ShaderMaterialWithCustomMaterials;

		inputMaterial.clipIntersection = this.pv.clipIntersection;
		inputMaterial.clipShadows = this.pv.clipShadows;

		this.setMaterial(inputMaterial);
	}
}
