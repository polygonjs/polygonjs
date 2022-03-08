const disallowed_long_extensions = ['d.ts'];
const allowed_extensions = ['js', 'ts', 'glsl'];
export function has_allowed_extension(file_path: string) {
	const elements = file_path.split('.');
	elements.shift();
	const long_ext = elements.join('.');
	const short_ext = elements[elements.length - 1];
	return allowed_extensions.includes(short_ext) && !disallowed_long_extensions.includes(long_ext);
}
