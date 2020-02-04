import {Scene} from 'src/Engine/Scene'
import lodash_includes from 'lodash/includes'
import {CodeExporterVisitor} from './Visitor'
import {CoreString} from 'src/Core/String'

export class SceneCodeExporter {
	constructor(private _scene: Scene){}

	process (): string {
		const lines: string[] = []

		this._scene.reset_node_context_signatures()

		this._scene.root().visit(CodeExporterVisitor).create().forEach(root_line=>{
			lines.push(root_line)
		})

		lines.push(`${this.var_name()}.set_frame(${this._scene.frame() || 1})`);
		lines.push(`${this.var_name()}.set_frame_range(${this._scene.frame_range().join(',')})`);
		lines.push(`${this.var_name()}.set_fps(${this._scene.fps()})`);

		const camera_path: string = this._scene.master_camera_node_path();
		if (camera_path != null) {
			lines.push(`${this.var_name()}.set_master_camera_node_path('${camera_path}')`);
		}
		this.add_semi_colons(lines)
		return lines.join("\n");
	}
	add_semi_colons(lines: string[]){
		const characters_without_semi_colon = '{}'
		lines.forEach((line, i)=>{
			const last_char = line[line.length-1]
			if (!lodash_includes(characters_without_semi_colon, last_char)){
				lines[i] = `${line};`
			}
		})
	}

	var_name() {
		//"window.scenes_by_uuid['#{this.name()}']"
		return "scene";
	}
	static sanitize_string(word: string):string{
		word = word.replace(/'/g, "\\'"); // escapes ' (uses 2 \, as opposed to the json exporter which uses only 1)
		word = CoreString.escape_line_breaks(word); // escapes line breaks (for shader code for instance)
		return word
	}
}

