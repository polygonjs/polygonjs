/**
 * Adds a clipping plane to the input material
 *
 *
 */
import {Plane, Material, ShaderMaterial} from 'three';
import {UpdateMatNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';

class ClippingPlaneMatParamsConfig extends NodeParamsConfig {
	/** @param plane normal */
	normal = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param plane constant */
	constant = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new ClippingPlaneMatParamsConfig();

export class ClippingPlaneMatNode extends UpdateMatNode<ShaderMaterial, ClippingPlaneMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'clippingPlane';
	}

	private _plane = new Plane();
	override async cook(inputMaterials: Material[]) {
		const inputMaterial = inputMaterials[0] as ShaderMaterialWithCustomMaterials;

		this._plane.normal.copy(this.pv.normal);
		this._plane.constant = this.pv.constant;
		if (!inputMaterial.clippingPlanes) {
			inputMaterial.clippingPlanes = [];
		}
		inputMaterial.clippingPlanes.push(this._plane);

		this.setMaterial(inputMaterial);
	}
}
