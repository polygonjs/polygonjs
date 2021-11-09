import {Constructor} from '../../../../types/GlobalTypes';
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {NODE_PATH_DEFAULT} from '../../../../core/Walker';
import {Color} from 'three/src/math/Color';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {IUniformColor, IUniformN, IUniformV2} from '../../utils/code/gl/Uniforms';

interface MeshPhysicalWithUniforms extends ShaderMaterial {
	uniforms: {
		clearcoat: IUniformN;
		clearcoatNormalScale: IUniformV2;
		clearcoatRoughness: IUniformN;
		reflectivity: IUniformN;
		transmission: IUniformN;
		thickness: IUniformN;
		attenuationDistance: IUniformN;
		attenuationTint: IUniformColor;
		sheen: IUniformN;
		sheenRoughness: IUniformN;
		sheenTint: IUniformColor;
		specularTint: IUniformColor;
		ior: IUniformN;
	};
}

export function MeshPhysicalParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param Represents the thickness of the clear coat layer, from 0.0 to 1.0 */
		clearcoat = ParamConfig.FLOAT(0, {separatorBefore: true});
		/** @param toggle if you want to use a roughness map */
		useClearCoatMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(MeshPhysicalController, 'useClearCoatMap')
		);
		/** @param toggle if you want to use a clear coat normal map */
		useClearCoatNormalMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatNormalMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(MeshPhysicalController, 'useClearCoatNormalMap')
		);
		/** @param How much the normal map affects the material. Typical ranges are 0-1 */
		clearcoatNormalScale = ParamConfig.VECTOR2([1, 1], {visibleIf: {useClearCoatNormalMap: 1}});
		/** @param clearcoatRoughness */
		clearcoatRoughness = ParamConfig.FLOAT(0);
		/** @param toggle if you want to use a clear cloat map */
		useClearCoatRoughnessMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatRoughnessMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(MeshPhysicalController, 'useClearCoatRoughnessMap')
		);

		/** @param toggle if you want to use sheen */
		useSheen = ParamConfig.BOOLEAN(0);
		/** @param The intensity of the sheen layer, from 0.0 to 1.0. Default is 0.0. */
		sheen = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [true, false],
			visibleIf: {useSheen: 1},
		});
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheenRoughness = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [true, false],
			visibleIf: {useSheen: 1},
		});
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheenColor = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {useSheen: 1},
		});

		/** @param Degree of transmission (or optical transparency), from 0.0 to 1.0. Default is 0.0.
Thin, transparent or semitransparent, plastic or glass materials remain largely reflective even if they are fully transmissive. The transmission property can be used to model these materials.
When transmission is non-zero, opacity should be set to 1.  */
		transmission = ParamConfig.FLOAT(0, {
			range: [0, 1],
		});
		/** @param toggle if you want to use a transmission map */
		useTransmissionMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		transmissionMap = ParamConfig.NODE_PATH(NODE_PATH_DEFAULT.NODE.EMPTY, {visibleIf: {useTransmissionMap: 1}});
		/** @param Index-of-refraction for non-metallic materials */
		ior = ParamConfig.FLOAT(1.5, {
			range: [1, 2.3333],
			rangeLocked: [true, true],
		});

		/** @param thickness  */
		thickness = ParamConfig.FLOAT(0.01, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param toggle if you want to use a thickness map */
		useThicknessMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		thicknessMap = ParamConfig.NODE_PATH(NODE_PATH_DEFAULT.NODE.EMPTY, {visibleIf: {useThicknessMap: 1}});
		/** @param attenuation distance */
		attenuationDistance = ParamConfig.FLOAT(0, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param attenuation color */
		attenuationColor = ParamConfig.COLOR([1, 1, 1]);
	};
}

type CurrentMaterial = MeshPhysicalMaterial | ShaderMaterial;
class TextureClearCoatMapParamsConfig extends MeshPhysicalParamConfig(NodeParamsConfig) {}
interface Controllers {
	physical: MeshPhysicalController;
}
abstract class TextureClearCoatMapMatNode extends TypedMatNode<CurrentMaterial, TextureClearCoatMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

const meshPhysical = new MeshPhysicalMaterial();

export class MeshPhysicalController extends BaseTextureMapController {
	constructor(protected node: TextureClearCoatMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useClearCoatMap, this.node.p.clearcoatMap);
		this.add_hooks(this.node.p.useClearCoatNormalMap, this.node.p.clearcoatNormalMap);
		this.add_hooks(this.node.p.useClearCoatRoughnessMap, this.node.p.clearcoatRoughnessMap);
		this.add_hooks(this.node.p.useTransmissionMap, this.node.p.transmissionMap);
		this.add_hooks(this.node.p.useThicknessMap, this.node.p.thicknessMap);
	}
	private _sheenColorClone = new Color();
	async update() {
		this._update(this.node.material, 'clearcoatMap', this.node.p.useClearCoatMap, this.node.p.clearcoatMap);
		this._update(
			this.node.material,
			'clearcoatNormalMap',
			this.node.p.useClearCoatNormalMap,
			this.node.p.clearcoatNormalMap
		);
		this._update(
			this.node.material,
			'clearcoatRoughnessMap',
			this.node.p.useClearCoatRoughnessMap,
			this.node.p.clearcoatRoughnessMap
		);
		this._update(
			this.node.material,
			'transmissionMap',
			this.node.p.useTransmissionMap,
			this.node.p.transmissionMap
		);
		this._update(this.node.material, 'thicknessMap', this.node.p.useThicknessMap, this.node.p.thicknessMap);
		const pv = this.node.pv;

		// this is to get the reflectivity value
		meshPhysical.ior = pv.ior;
		const reflectivity = meshPhysical.reflectivity;

		if (this._update_options.uniforms) {
			const mat = this.node.material as MeshPhysicalWithUniforms;
			mat.uniforms.clearcoat.value = pv.clearcoat;
			mat.uniforms.clearcoatNormalScale.value.copy(pv.clearcoatNormalScale);
			mat.uniforms.clearcoatRoughness.value = pv.clearcoatRoughness;
			mat.uniforms.reflectivity.value = reflectivity;
			mat.uniforms.transmission.value = pv.transmission;
			mat.uniforms.thickness.value = pv.thickness;
			mat.uniforms.attenuationDistance.value = pv.attenuationDistance;
			mat.uniforms.attenuationTint.value = pv.attenuationColor;

			if (isBooleanTrue(pv.useSheen)) {
				this._sheenColorClone.copy(pv.sheenColor);
				mat.uniforms.sheen.value = pv.sheen;
				mat.uniforms.sheenRoughness.value = pv.sheenRoughness;
				mat.uniforms.sheenTint.value = this._sheenColorClone;
			} else {
				mat.uniforms.sheen.value = 0;
			}
			mat.uniforms.ior.value = pv.ior;

			// to ensure compilation goes through
			(mat as any).specularTint = mat.uniforms.specularTint.value;
			(mat as any).ior = mat.uniforms.ior.value;

			// mat.defines['CLEARCOAT'] = isBooleanTrue(this.node.pv.useClearCoatNormalMap);
			// mat.defines['USE_CLEARCOAT_ROUGHNESSMAP'] = isBooleanTrue(this.node.pv.useClearCoatRoughnessMap);
			// mat.defines['TRANSMISSION'] = isBooleanTrue(this.node.pv.useTransmissionMap);
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshPhysicalMaterial;
			mat.clearcoat = pv.clearcoat;
			if (mat.clearcoatNormalScale != null) {
				mat.clearcoatNormalScale.copy(pv.clearcoatNormalScale);
			}
			mat.clearcoatRoughness = pv.clearcoatRoughness;
			mat.reflectivity = reflectivity;
			// ior is currently a getter/setter wrapper to set reflectivity, so currently conflicts with 'mat.reflectivity ='
			// mat.ior = this.node.pv.ior;
			if (isBooleanTrue(pv.useSheen)) {
				this._sheenColorClone.copy(pv.sheenColor);
				mat.sheen = pv.sheen;
				mat.sheenRoughness = pv.sheenRoughness;
				mat.sheenTint = this._sheenColorClone;
			} else {
				mat.sheen = 0;
			}
			mat.transmission = pv.transmission;
			mat.thickness = pv.thickness;
			mat.attenuationDistance = pv.attenuationDistance;
			mat.attenuationTint = pv.attenuationColor;
		}
	}
	static async update(node: TextureClearCoatMapMatNode) {
		node.controllers.physical.update();
	}
}
