import {Grid} from '../../Grid';
import {NodeSourceElement} from '../Common';

function* interval(s: string) {
	if (s.includes('..')) {
		const bounds = s.split('..');
		const min = parseInt(bounds[0]);
		const max = parseInt(bounds[1]);
		for (let i = min; i <= max; i++) yield i;
	} else yield parseInt(s);
}

export class ConvolutionRule {
	public input: number = -1;
	public output: number = -1;
	public values?: Uint8Array;
	public sums?: Uint8Array;
	public p: number = 1;

	public load(elem: NodeSourceElement, grid: Grid) {
		const inStr = elem.getAttribute('in');
		const outStr = elem.getAttribute('out');
		this.input = inStr ? grid.values.get(inStr.charCodeAt(0)) || -1 : -1;
		this.output = outStr ? grid.values.get(outStr.charCodeAt(0)) || -1 : -1;
		const valueString = elem.getAttribute('values');
		const sumsString = elem.getAttribute('sum');

		if (valueString && !sumsString) {
			console.error(elem, 'missing "sum" attribute');
			return false;
		}

		if (!valueString && sumsString) {
			console.error(elem, 'missing "value" attribute');
			return false;
		}

		if (valueString)
			this.values = new Uint8Array(
				Array.from({length: valueString.length}, (_, i) => {
					const v = grid.values.get(valueString.charCodeAt(i));
					if (v == null) {
						return -1;
					}
					return v;
				})
			);

		this.p = parseFloat(elem.getAttribute('p') || '1') || 1;

		if (sumsString) {
			this.sums = new Uint8Array(28);
			const intervals = sumsString.split(',');
			for (const s of intervals) for (const i of interval(s)) this.sums[i] = 1;
		}

		return true;
	}
}
