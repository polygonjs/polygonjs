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
		/** @param toggle if you want to use a roughness map */
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
		/** @param toggle if you want to use a roughness map */
		useClearCoatRoughnessMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatRoughnessMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(MeshPhysicalController, 'useClearCoatRoughnessMap')
		);
		/** @param Index-of-refraction for non-metallic materials, from 1.0 to 2.333 */
		ior = ParamConfig.FLOAT(1.5, {
			separatorBefore: true,
			range: [1, 2.333],
			rangeLocked: [true, true],
		});
		/** @param Degree of reflectivity, from 0.0 to 1.0. Default is 0.5, which corresponds to an index-of-refraction of 1.5.
This models the reflectivity of non-metallic materials. It has no effect when metalness is 1.0 */
		reflectivity = ParamConfig.FLOAT(0.5, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param toggle if you want to use a roughness map */
		useSheen = ParamConfig.BOOLEAN(0);
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheen = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {useSheen: 1},
		});
		/** @param Degree of transmission (or optical transparency), from 0.0 to 1.0. Default is 0.0.
Thin, transparent or semitransparent, plastic or glass materials remain largely reflective even if they are fully transmissive. The transmission property can be used to model these materials.
When transmission is non-zero, opacity should be set to 1.  */
		transmission = ParamConfig.FLOAT(0, {
			range: [0, 1],
		});
		/** @param toggle if you want to use a roughness map */
		useTransmissionMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		transmissionMap = ParamConfig.NODE_PATH(NODE_PATH_DEFAULT.NODE.EMPTY, {visibleIf: {useTransmissionMap: 1}});
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

export class MeshPhysicalController extends BaseTextureMapController {
	constructor(protected node: TextureClearCoatMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useClearCoatMap, this.node.p.clearcoatMap);
		this.add_hooks(this.node.p.useClearCoatNormalMap, this.node.p.clearcoatNormalMap);
		this.add_hooks(this.node.p.useClearCoatRoughnessMap, this.node.p.clearcoatRoughnessMap);
		this.add_hooks(this.node.p.useTransmissionMap, this.node.p.transmissionMap);
	}
	private _sheenClone = new Color();
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
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.roughness.value = this.node.pv.roughness;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshPhysicalMaterial;
			mat.clearcoat = this.node.pv.clearcoat;
			mat.clearcoatNormalScale.copy(this.node.pv.clearcoatNormalScale);
			mat.clearcoatRoughness = this.node.pv.clearcoatRoughness;
			mat.ior = this.node.pv.ior;
			mat.reflectivity = this.node.pv.reflectivity;
			if (this.node.pv.useSheen) {
				this._sheenClone.copy(this.node.pv.sheen);
				mat.sheen = this._sheenClone;
			} else {
				mat.sheen = null;
			}
			mat.transmission = this.node.pv.transmission;
		}
	}
	static async update(node: TextureClearCoatMapMatNode) {
		node.controllers.physical.update();
	}
}
