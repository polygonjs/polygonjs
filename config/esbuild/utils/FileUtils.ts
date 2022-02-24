import * as fs from 'fs';
import * as path from 'path';

type FileCallback = (path: string) => boolean;
export function walk(dir: string, filter_callback: FileCallback) {
	const files_list: string[] = [];
	const list = fs.readdirSync(dir);
	for (let item of list) {
		const file_path = path.resolve(dir, item);
		const stat = fs.statSync(file_path);
		if (stat && stat.isDirectory()) {
			const sub_list = walk(file_path, filter_callback);
			for (let sub_item of sub_list) {
				files_list.push(sub_item);
			}
		} else {
			files_list.push(file_path);
		}
	}

	const accepted_file_list = files_list.filter(filter_callback);

	return accepted_file_list;
}

const disallowed_long_extensions = ['d.ts'];
const allowed_extensions = ['js', 'ts', 'glsl'];
export function has_allowed_extension(file_path: string) {
	const elements = file_path.split('.');
	elements.shift();
	const long_ext = elements.join('.');
	const short_ext = elements[elements.length - 1];
	return allowed_extensions.includes(short_ext) && !disallowed_long_extensions.includes(long_ext);
}
