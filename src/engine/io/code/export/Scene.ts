import {PolyScene} from '../../../scene/PolyScene';
import {CodeExporterDispatcher} from './Dispatcher';
import {CoreString} from '../../../../core/String';

export class SceneCodeExporter {
	constructor(private _scene: PolyScene) {}

	process(): string {
		const lines: string[] = [];

		this._scene.nodes_controller.reset_node_context_signatures();

		CodeExporterDispatcher.dispatch_node(this._scene.root)
			.create()
			.forEach((root_line) => {
				lines.push(root_line);
			});

		lines.push(`${this.var_name()}.set_frame(${this._scene.frame || 1})`);
		lines.push(`${this.var_name()}.set_frame_range(${this._scene.frame_range.join(',')})`);
		// lines.push(`${this.var_name()}.time_controller.set_fps(${this._scene.time_controller.fps})`);

		const camera_path = this._scene.cameras_controller.master_camera_node_path;
		if (camera_path) {
			lines.push(`${this.var_name()}.cameras_controller.set_master_camera_node_path('${camera_path}')`);
		}
		this.add_semi_colons(lines);
		return lines.join('\n');
	}
	private add_semi_colons(lines: string[]) {
		const characters_without_semi_colon = '{}';
		lines.forEach((line, i) => {
			const last_char = line[line.length - 1];
			if (!characters_without_semi_colon.includes(last_char)) {
				lines[i] = `${line};`;
			}
		});
	}

	var_name() {
		//"window.scenes_by_uuid['#{this.name()}']"
		return 'scene';
	}
	static sanitize_string(word: string): string {
		word = word.replace(/'/g, "\\'"); // escapes ' (uses 2 \, as opposed to the json exporter which uses only 1)
		word = CoreString.escape_line_breaks(word); // escapes line breaks (for shader code for instance)
		return word;
	}
}
