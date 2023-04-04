import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';

export class PrettierController {
	static formatJs(JSContent: string) {
		try {
			return prettier.format(JSContent, {
				parser: 'babel',
				plugins: [parserBabel],
				printWidth: 120,
			});
		} catch (err) {
			console.log(err);
			return JSContent;
		}
	}
}
