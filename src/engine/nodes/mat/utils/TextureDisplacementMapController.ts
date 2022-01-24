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
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
export function DisplacementMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a displacement map */
		useDisplacementMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureDisplacementMapController),
		});
		/** @param specify the displacement map COP node */
		displacementMap = ParamConfig.NODE_PATH(
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
class TextureDisplacementMaterial extends Material {
	displacementMap!: Texture | null;
	displacementScale!: number;
	displacementBias!: number;
}
type CurrentMaterial = TextureDisplacementMaterial | ShaderMaterial;
class TextureDisplacementMapParamsConfig extends DisplacementMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	displacementMap: TextureDisplacementMapController;
}
abstract class TextureDisplacementMapMatNode extends TypedMatNode<CurrentMaterial, TextureDisplacementMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureDisplacementMapController extends BaseTextureMapController {
	constructor(protected override node: TextureDisplacementMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useDisplacementMap, this.node.p.displacementMap);
	}
	override async update() {
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
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.displacementScale = this.node.pv.displacementScale;
			mat.displacementBias = this.node.pv.displacementBias;
		}
	}
	static override async update(node: TextureDisplacementMapMatNode) {
		node.controllers.displacementMap.update();
	}
}
