const path = require('path');
const fs = require('fs');
type FileCallback = (path: string) => boolean;
export function walk(dir: string, filterCallback: FileCallback) {
	const files_list: string[] = [];
	const list = fs.readdirSync(dir);
	for (let item of list) {
		const file_path = path.resolve(dir, item);
		const stat = fs.statSync(file_path);
		if (stat && stat.isDirectory()) {
			const sub_list = walk(file_path, filterCallback);
			for (let sub_item of sub_list) {
				files_list.push(sub_item);
			}
		} else {
			files_list.push(file_path);
		}
	}

	const accepted_file_list = files_list.filter(filterCallback);

	return accepted_file_list;
}
