import {BaseMethod} from './_Base';

export class PadzeroExpression extends BaseMethod {
	static required_arguments() {
		return [['string', 'number']];
	}

	process_arguments(args: any[]): Promise<string> {
		return new Promise((resolve) => {
			const pad: number = args[0] || 2;
			const src_number: number = args[1] || 0;
			const unpadded = `${src_number}`;
			const padded = unpadded.padStart(pad, '0');
			resolve(padded);
		});
	}
}
