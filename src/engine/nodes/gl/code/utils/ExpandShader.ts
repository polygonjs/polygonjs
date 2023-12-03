import {ShaderChunk} from 'three';

export function expandShader(shaderString: string) {
	function parseIncludes(string: string) {
		const pattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
		function replace(match: string, include: string): string {
			const replace = ShaderChunk[include as keyof typeof ShaderChunk];

			if (replace === undefined) {
				throw new Error('Can not resolve #include <' + include + '>');
			}

			return parseIncludes(replace);
		}

		return string.replace(pattern, replace);
	}
	return parseIncludes(shaderString);
}
