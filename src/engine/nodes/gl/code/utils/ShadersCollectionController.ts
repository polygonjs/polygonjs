import {ShaderName} from '../../../utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {LinesController} from './LinesController';
import {BaseGlNodeType} from '../../_Base';
import {TypedAssembler} from '../../../utils/shaders/BaseAssembler';
import {NodeContext} from '../../../../poly/NodeContext';

export class ShadersCollectionController {
	private _lines_controller_by_shader_name: Map<ShaderName, LinesController> = new Map();

	constructor(
		private _shader_names: ShaderName[],
		private _current_shader_name: ShaderName,
		private _assembler: TypedAssembler<NodeContext.GL>
	) {
		for (let shader_name of this._shader_names) {
			this._lines_controller_by_shader_name.set(shader_name, new LinesController(shader_name));
		}
	}

	assembler() {
		return this._assembler;
	}

	// merge(shaders_collection_controller: ShadersCollectionController, scene: PolyScene) {
	// 	for (let shader_name of this._shader_names) {
	// 		// merge definitions
	// 		const definition_nodes = shaders_collection_controller.all_definition_nodes(shader_name, scene);
	// 		for (let node of definition_nodes) {
	// 			const definitions = shaders_collection_controller.definitions(shader_name, node);
	// 			if (definitions) {
	// 				this.addDefinitions(node, definitions, shader_name);
	// 			}
	// 		}

	// 		// merge body lines
	// 		const body_line_nodes = shaders_collection_controller.all_body_line_nodes(shader_name, scene);
	// 		console.log('body_line_nodes', body_line_nodes);
	// 		for (let node of body_line_nodes) {
	// 			const body_lines = shaders_collection_controller.body_lines(shader_name, node);
	// 			console.log(node.path(), body_lines);
	// 			if (body_lines) {
	// 				this.addBodyLines(node, body_lines, shader_name);
	// 			}
	// 		}
	// 	}
	// }

	shaderNames() {
		return this._shader_names;
	}

	set_current_shader_name(shader_name: ShaderName) {
		this._current_shader_name = shader_name;
	}
	get current_shader_name() {
		return this._current_shader_name;
	}

	addDefinitions(node: BaseGlNodeType, definitions: BaseGLDefinition[], shader_name?: ShaderName) {
		if (definitions.length == 0) {
			return;
		}

		shader_name = shader_name || this._current_shader_name;
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			lines_controller.addDefinitions(node, definitions);
		}
	}
	definitions(shader_name: ShaderName, node: BaseGlNodeType) {
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			return lines_controller.definitions(node);
		}
	}
	// all_definition_nodes(shader_name: ShaderName, scene: PolyScene) {
	// 	return this._lines_controller_by_shader_name.get(shader_name)?.all_definition_nodes(scene) || [];
	// }

	addBodyLines(node: BaseGlNodeType, lines: string[], shader_name?: ShaderName) {
		if (lines.length == 0) {
			return;
		}
		shader_name = shader_name || this._current_shader_name;
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			lines_controller.addBodyLines(node, lines);
		}
	}
	body_lines(shader_name: ShaderName, node: BaseGlNodeType) {
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			return lines_controller.body_lines(node);
		}
	}
	// all_body_line_nodes(shader_name: ShaderName, scene: PolyScene) {
	// 	return this._lines_controller_by_shader_name.get(shader_name)?.all_body_line_nodes(scene) || [];
	// }
}
