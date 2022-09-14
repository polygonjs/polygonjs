import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {Material} from 'three';
import {ShaderMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {CustomMaterialName, ShaderMaterialWithCustomMaterials} from '../../../../core/geometry/Material';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {ParamsValueAccessorType} from '../../utils/params/ParamsValueAccessor';

export function UniformsTransparencyParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param sets the material to transparent */
		transparent = ParamConfig.BOOLEAN(0);
		/** @param sets the material opacity */
		opacity = ParamConfig.FLOAT(1);
		/** @param sets the min alpha below which the material is invisible */
		alphaTest = ParamConfig.FLOAT(0);
	};
}

type TransparencyMaterial = Material;
// class TransparencyMaterial extends Material {
// 	// transparent!: boolean;
// 	// depthTest!: boolean;
// 	// alphaTest!: number;
// 	// uniforms!: IUniforms;
// }
class TransparencyParamsConfig extends UniformsTransparencyParamConfig(NodeParamsConfig) {}

class TransparencyMatNode extends TypedMatNode<TransparencyMaterial, TransparencyParamsConfig> {
	createMaterial() {
		return new Material();
	}
}

export class UniformsTransparencyController extends BaseController {
	constructor(protected override node: TransparencyMatNode) {
		super(node);
	}
	static update(node: TransparencyMatNode) {
		const material = node.material;
		const pv = node.pv;

		this._updateTransparency(material, pv);
	}

	private static _updateTransparency(
		mat: TransparencyMaterial,
		pv: ParamsValueAccessorType<TransparencyParamsConfig>
	) {
		// transparent is currently only changed for the main material,
		// not for the customMaterials,
		// as that currently makes them disappear.
		// Also, we do not use the alternative condition  || pv.opacity < 1;
		// to set a material transparent, as this can be useful to have those params independent,
		// especially for shadow materials
		mat.transparent = isBooleanTrue(pv.transparent);
		this._updateCommon(mat, pv);
	}
	private static _updateCommon(mat: TransparencyMaterial, pv: ParamsValueAccessorType<TransparencyParamsConfig>) {
		const shaderMaterial = mat as ShaderMaterial;

		if (shaderMaterial.uniforms && shaderMaterial.uniforms.opacity) {
			shaderMaterial.uniforms.opacity.value = pv.opacity;
		}
		mat.opacity = pv.opacity;

		if (shaderMaterial.uniforms && shaderMaterial.uniforms.alphaTest) {
			shaderMaterial.uniforms.alphaTest.value = pv.alphaTest;
		}
		mat.alphaTest = pv.alphaTest;

		const customMaterials = (mat as ShaderMaterialWithCustomMaterials).customMaterials;
		if (customMaterials) {
			const customNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
			for (let customName of customNames) {
				const customMaterial = customMaterials[customName];
				if (customMaterial) {
					this._updateCommon(customMaterial as ShaderMaterial, pv);
				}
			}
		}
	}
}
