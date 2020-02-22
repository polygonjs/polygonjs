import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ColorParamConfig} from './utils/ColorsController';
import {SideParamConfig} from './utils/SideController';
import {SkinningParamConfig} from './utils/SkinningController';
import {TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {ShaderAssemblerBasic} from '../gl/code/assemblers/Basic';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {GlAssemblerController} from '../gl/code/Controller';
import {NodeContext} from 'src/engine/poly/NodeContext';
class MeshBasicMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

export class MeshBasicBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerBasic, MeshBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_basic_builder';
	}

	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
		this.children_controller?.init();

		// this.add_post_dirty_hook('gl compile', (trigger_node?: CoreGraphNode) => {

		// 	console.log('gl dirty');
		// });
	}

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerBasic>(this, ShaderAssemblerBasic);
	}

	async cook() {
		this.compile_if_required();

		// ColorsController.update(this);
		// SideController.update(this);
		// SkinningController.update(this);
		// await TextureMapController.update(this);
		// await TextureAlphaMapController.update(this);

		this.set_material(this._material);
	}

	async compile_if_required() {
		if (this.assembler_controller.compile_required()) {
			await this.assembler_controller.assembler.compile_material(this._material);
			await this.assembler_controller.post_compile();

			console.log(this._material.vertexShader);
			// console.log(this._material.fragmentShader);
		}
	}
}
