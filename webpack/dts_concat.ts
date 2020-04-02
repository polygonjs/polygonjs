/*
TO EXPORT THE BUNDLED TYPES:
- the declaration flag needs to be true in tsconfig
- but be careful, as not all files are exported, since some have errors, such as nodes/gl/_Math_Arg2
*/

import path from 'path';
import fs from 'fs';

// const ENTRY = path.resolve(__dirname, '../dist/engine/index.d.ts')
const ENTRY = path.resolve(__dirname, '../dist/src/engine/nodes/event/Code.d.ts');
const OUT_D_TS = path.resolve(__dirname, '../dist/bundled_types.d.ts');

const EXCLUDED_FOLDER = path.resolve(__dirname, '../dist/modules');
const IGNORED_NODE_MODULES = ['@dagrejs'];
const NODE_MODULES = ['three', 'lodash'].concat(IGNORED_NODE_MODULES);
const IGNORED_NODE_MODULE_PATHS = IGNORED_NODE_MODULES.map((name) => {
	return path.resolve(__dirname, '../node_modules', name);
});

class Controller {
	assembled_lines: string[] = [];
	private _files_count = 0;
	visited_file_trackers_by_path: Map<string, FileTracker> = new Map();
	constructor() {}
	resolve_path(path: string, level: number) {
		if (level > 20) {
			console.warn('reached max level');
			return;
		}

		const existing = this.visited_file_trackers_by_path.get(path);
		if (existing) {
			return existing;
		} else {
			const file_tracker = new FileTracker(path, this, level);
			this.visited_file_trackers_by_path.set(path, file_tracker);
			this._files_count++;
			this.resolve_tracker(file_tracker);
			return file_tracker;
		}
	}
	resolve_tracker(file_tracker: FileTracker) {
		file_tracker.resolve(this.assembled_lines);
	}

	files_count() {
		return this._files_count;
	}
}

class FileTracker {
	private _lines: string[];
	private _import_lines_indices: number[] = [];
	constructor(public path: string, public controller: Controller, public level: number) {
		this._lines = fs.readFileSync(path, 'utf8').split('\n');
	}

	resolve(assembled_lines: string[]) {
		let line: string;
		for (let i = 0; i < this._lines.length; i++) {
			line = this._lines[i];
			if (line.startsWith('import {')) {
				this._import_lines_indices.push(i);
				const import_relative_path = this._import_relative_path(i);
				let full_path = path.resolve(this.path, '..', import_relative_path);

				const first_folder = import_relative_path.split('/')[0];
				if (NODE_MODULES.includes(first_folder)) {
					full_path = path.resolve(__dirname, '../node_modules', import_relative_path);
				}
				if (!this._ignore_file(full_path)) {
					// if (!fs.existsSync(full_path)) {
					// 	console.log(`file does not exist`, full_path, 'from', this.path, 'line:', line, i);
					// 	throw 'bad file import';
					// }
					if (fs.existsSync(full_path)) {
						this.controller.resolve_path(full_path, this.level + 1);
					}
				}
			} else {
				assembled_lines.push(line);
			}
		}
	}

	private _ignore_file(path: string): boolean {
		if (path.startsWith(EXCLUDED_FOLDER)) {
			return true;
		}
		for (let m of IGNORED_NODE_MODULE_PATHS) {
			if (path.startsWith(m)) {
				return true;
			}
		}
		return false;
	}

	private _import_relative_path(line_index: number): string {
		const line = this._lines[line_index];
		if (line.includes(';')) {
			const line_elements = line.split("'");
			const import_relative_path = line_elements[line_elements.length - 2] + '.d.ts';
			return import_relative_path;
		} else {
			return this._import_relative_path(line_index + 1);
		}
	}
}

const controller = new Controller();
controller.resolve_path(ENTRY, 0);
fs.writeFileSync(OUT_D_TS, controller.assembled_lines.join('\n'));
console.log(`written ${controller.assembled_lines.length} lines fom ${controller.files_count()} files in `, OUT_D_TS);
