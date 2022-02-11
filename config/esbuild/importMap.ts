//
// converted to typescript from https://github.com/trygve-lie/esbuild-plugin-import-map
//

import * as path from 'path';
import * as fs from 'fs';

const isBare = (str: string) => {
	if (
		str.startsWith('/') ||
		str.startsWith('./') ||
		str.startsWith('../') ||
		str.substr(0, 7) === 'http://' ||
		str.substr(0, 8) === 'https://'
	) {
		return false;
	}
	return true;
};

function isString(value: any): value is string {
	return typeof value == 'string';
}

const validate = (map: any) =>
	Object.keys(map.imports).map((key) => {
		const value = map.imports[key];

		if (isBare(value)) {
			throw Error(
				`Import specifier can NOT be mapped to a bare import statement. Import specifier "${key}" is being wrongly mapped to "${value}"`
			);
		}

		return {key, value};
	});

const fileReader = (pathname = '') =>
	new Promise((resolve, reject) => {
		const filepath = path.normalize(pathname);
		const file = fs.readFileSync(filepath, 'utf-8');
		try {
			const obj = JSON.parse(file);
			resolve(validate(obj));
		} catch (error) {
			reject(error);
		}
	});

const CACHE = new Map();

export interface ImportDictionary {
	[Key: string]: string;
}

export async function load(importMaps: any) {
	const maps = Array.isArray(importMaps) ? importMaps : [importMaps];

	const mappings = maps.map((item) => {
		if (isString(item)) {
			return fileReader(item);
		}
		return validate(item);
	});

	await Promise.all(mappings).then((items) => {
		items.forEach((item: any) => {
			item.forEach((obj: any) => {
				CACHE.set(obj.key, obj.value);
			});
		});
	});
}

export function clear() {
	CACHE.clear();
}

export function plugin() {
	return {
		name: 'importMap',
		setup(build: any) {
			build.onResolve({filter: /.*?/}, (args: any) => {
				if (CACHE.has(args.path)) {
					return {
						path: CACHE.get(args.path),
						namespace: args.path,
						external: true,
					};
				}
				return {};
			});
		},
	};
}
