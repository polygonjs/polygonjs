import {ShaderName} from 'src/engine/nodes/utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {LinesController} from './LinesController';
import {BaseGlNodeType} from '../../_Base';

export class ShadersCollectionController {
	private _lines_controller_by_shader_name: Map<ShaderName, LinesController> = new Map();
	constructor(private _shader_names: ShaderName[], private _current_shader_name: ShaderName) {
		for (let shader_name of this._shader_names) {
			this._lines_controller_by_shader_name.set(shader_name, new LinesController(shader_name));
		}
	}

	get shader_names() {
		return this._shader_names;
	}

	set_current_shader_name(shader_name: ShaderName) {
		this._current_shader_name = shader_name;
	}
	get current_shader_name() {
		return this._current_shader_name;
	}

	add_definitions(node: BaseGlNodeType, definitions: BaseGLDefinition[], shader_name?: ShaderName) {
		if (definitions.length == 0) {
			return;
		}
		shader_name = shader_name || this._current_shader_name;
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			lines_controller.add_definitions(node, definitions);
		}
	}
	definitions(shader_name: ShaderName, node: BaseGlNodeType) {
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			return lines_controller.definitions(node);
		}
	}

	add_body_lines(node: BaseGlNodeType, lines: string[], shader_name?: ShaderName) {
		if (lines.length == 0) {
			return;
		}
		shader_name = shader_name || this._current_shader_name;
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			lines_controller.add_body_lines(node, lines);
		}
	}
	body_lines(shader_name: ShaderName, node: BaseGlNodeType) {
		const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
		if (lines_controller) {
			return lines_controller.body_lines(node);
		}
	}
}
