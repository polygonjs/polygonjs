import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
export function TextureDisplacementMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a displacement map */
		useDisplacementMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureDisplacementMapController));
		/** @param specify the displacement map COP node */
		displacementMap = ParamConfig.OPERATOR_PATH(
			'',
			OperatorPathOptions(TextureDisplacementMapController, 'useDisplacementMap')
		);
		/** @param displacement scale */
		displacementScale = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [false, false],
			...OperatorPathOptions(TextureDisplacementMapController, 'useDisplacementMap'),
		});
		/** @param displacement bias */
		displacementBias = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [false, false],
			...OperatorPathOptions(TextureDisplacementMapController, 'useDisplacementMap'),
		});
	};
}
type CurrentMaterial = MeshStandardMaterial | ShaderMaterial;
class TextureDisplacementMapParamsConfig extends TextureDisplacementMapParamConfig(NodeParamsConfig) {}
abstract class TextureDisplacementMapMatNode extends TypedMatNode<CurrentMaterial, TextureDisplacementMapParamsConfig> {
	texture_displacement_map_controller!: TextureDisplacementMapController;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureDisplacementMapController extends BaseTextureMapController {
	constructor(protected node: TextureDisplacementMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useDisplacementMap, this.node.p.displacementMap);
	}
	async update() {
		this._update(
			this.node.material,
			'displacementMap',
			this.node.p.useDisplacementMap,
			this.node.p.displacementMap
		);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.displacementScale.value = this.node.pv.displacementScale;
			mat.uniforms.displacementBias.value = this.node.pv.displacementBias;
		}
		if (this._update_options.direct_params) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.displacementScale = this.node.pv.displacementScale;
			mat.displacementBias = this.node.pv.displacementBias;
		}
	}
	static async update(node: TextureDisplacementMapMatNode) {
		node.texture_displacement_map_controller.update();
	}
}
