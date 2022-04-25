export class GLSLHelper {
	static compress(content: string): string {
		return content
			.trim()
			.replace(/\r/g, '')
			.replace(/[ \t]*\/\/.*\n/g, '') // remove //
			.replace(/[ \t]*\/\*[\s\S]*?\*\//g, '') // remove /* */
			.replace(/\n{2,}/g, '\n'); // # \n+ to \n
	}
}
