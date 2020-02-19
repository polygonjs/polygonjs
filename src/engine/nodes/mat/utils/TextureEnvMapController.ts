// import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
// import {NodeContext} from 'src/engine/poly/NodeContext';
// import {BaseCopNodeType} from '../../cop/_Base';
import {BaseTextureMapController} from './_BaseTextureController';
import {NodeContext} from 'src/engine/poly/NodeContext';
export function TextureEnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_env_map = ParamConfig.BOOLEAN(0);
		env_map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.ENV_MAP, {
			visible_if: {use_env_map: 1},
			node_selection: {context: NodeContext.COP},
		});
		env_map_intensity = ParamConfig.FLOAT(1, {visible_if: {use_env_map: 1}});
	};
}
class TextureEnvMaterial extends Material {
	envMap!: Texture | null;
	envMapIntensity!: number;
}
class TextureEnvMapParamsConfig extends TextureEnvMapParamConfig(NodeParamsConfig) {}
class TextureEnvMapMatNode extends TypedMatNode<TextureEnvMaterial, TextureEnvMapParamsConfig> {
	create_material() {
		return new TextureEnvMaterial();
	}
}

// import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader';
// import {FloatType} from 'three/src/constants';
// import {POLY} from 'src/engine/Poly';
// import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';
export class TextureEnvMapController extends BaseTextureMapController {
	static async update(node: TextureEnvMapMatNode) {
		this._update(node, node.material, 'envMap', node.pv.use_env_map, node.p.env_map);

		node.material.envMapIntensity = node.pv.env_map_intensity;
		// const renderer = POLY.renderers_controller.first_renderer();
		// if (renderer) {
		// 	const pmremGenerator = new PMREMGenerator(renderer);
		// 	console.log(pmremGenerator);

		// 	new EXRLoader().setDataType(FloatType).load('/examples/textures/piz_compressed.exr', function(texture) {
		// 		console.log(texture);
		// 		const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
		// 		const exrBackground = exrCubeRenderTarget.texture;
		// 		node.scene.display_scene.background = exrBackground;
		// 		node.material.envMap = exrBackground;
		// 		node.material.envMapIntensity = 1;
		// 		node.material.needsUpdate = true;

		// 		texture.dispose();
		// 	});
		// 	pmremGenerator.compileEquirectangularShader();
		// }
	}

	// static async update(node: TextureEnvMapMatNode) {
	// 	const material = node.material;

	// 	if (node.pv.use_map) {
	// 		const found_node = node.p.Env_map.found_node();
	// 		if (found_node) {
	// 			if (found_node.node_context() == NodeContext.COP) {
	// 				const texture_node = found_node as BaseCopNodeType;

	// 				// if the texture has already been created, we don't have to wait for request_container
	// 				if (texture_node.texture) {
	// 					texture_node.request_container();
	// 				} else {
	// 					await texture_node.request_container();
	// 				}

	// 				if (texture_node.texture) {
	// 					material.EnvMap = texture_node.texture;
	// 					return;
	// 				}
	// 			} else {
	// 				node.states.error.set(`found map node is not a COP node`);
	// 			}
	// 		} else {
	// 			node.states.error.set(`could not find map node`);
	// 		}
	// 	}
	// 	material.EnvMap = null;
	// }
}
