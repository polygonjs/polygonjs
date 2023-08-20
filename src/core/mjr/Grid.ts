import {Helper} from './helpers/Helper';

interface GridOptions {
	MX: number;
	MY: number;
	MZ: number;
	characters: string;
	values: Map<number, number>;
	waves: Map<number, number>;
	transparent: number;
	padded: Uint8Array;
	state: Uint8Array;
	mask: Uint8Array;
	folder: string;
}

function wave(values: Map<number, number>, valuesString: string) {
	let sum = 0;
	for (let i = 0; i < valuesString.length; i++) {
		const charCode = valuesString.charCodeAt(i);
		const id = values.get(charCode);
		if (id != null) {
			sum += 1 << id;
		}
	}
	return sum;
}

export class Grid {
	public state: Uint8Array;
	public padded: Uint8Array;

	public mask: Uint8Array; // bool array

	public MX: number;
	public MY: number;
	public MZ: number;

	public characters: string;
	public values: Map<number, number> = new Map();
	public waves: Map<number, number> = new Map();
	public folder: string;

	public readonly transparent: number = -1;
	// private statebuffer: Uint8Array;

	constructor(options: GridOptions) {
		this.MX = options.MX;
		this.MY = options.MY;
		this.MZ = options.MZ;
		this.characters = options.characters;

		options.values.forEach((value, key) => {
			this.values.set(key, value);
		});
		options.waves.forEach((value, key) => {
			this.waves.set(key, value);
		});

		this.transparent = options.transparent;
		this.padded = options.padded;
		this.state = options.state;
		this.mask = options.mask;
		this.folder = options.folder;
	}
	public static build(elem: Element, MX: number, MY: number, MZ: number) {
		const valueString = elem.getAttribute('values')?.replace(/\s/g, '');
		if (!valueString) {
			console.error(elem, 'no values specified');
			return null;
		}
		const characters = valueString;
		const charactersCount = characters.length;
		const values: Map<number, number> = new Map();
		const waves: Map<number, number> = new Map();
		for (let i = 0; i < charactersCount; i++) {
			const c = valueString.charCodeAt(i);

			if (values.has(c)) {
				console.error(elem, 'contains repeating value');
				return null;
			}

			values.set(c, i);
			waves.set(c, 1 << i);
		}

		const transparentString = elem.getAttribute('transparent');
		const transparent = transparentString != null ? wave(values, transparentString) : -1;
		// if (transparentString) {g.transparent = g.wave(transparentString);}

		const unions = [...Helper.matchTags(elem, 'markov', 'sequence', 'union')].filter((x) => x?.tagName === 'union');
		waves.set('*'.charCodeAt(0), (1 << charactersCount) - 1);

		for (const union of unions) {
			if (union) {
				const symbol = union.getAttribute('symbol')?.charCodeAt(0);
				if (symbol) {
					if (waves.has(symbol)) {
						console.error(union, `repeating union type "${String.fromCharCode(symbol)}"`);
						return null;
					} else {
						const valuesStr = union.getAttribute('values');
						if (valuesStr) {
							const w = wave(values, valuesStr);
							waves.set(symbol, w);
						}
					}
				}
			}
		}

		let pot = 1;
		while (pot < MX * MY * MZ) pot <<= 2;
		const padded = new Uint8Array(pot);
		const state = padded.subarray(0, MX * MY * MZ);
		// g.statebuffer = new Uint8Array(MX * MY * MZ);
		const mask = new Uint8Array(MX * MY * MZ);
		const folder = elem.getAttribute('folder') || 'no-folder';

		return new Grid({
			MX,
			MY,
			MZ,
			characters: valueString,
			values,
			waves,
			transparent,
			padded,
			state,
			mask,
			folder,
		});
	}

	get C() {
		return this.characters.length;
	}

	public clear() {
		this.state.fill(0);
	}

	public wave(values: string) {
		return wave(this.values, values);
		// let sum = 0;
		// for (let i = 0; i < values.length; i++) sum += 1 << this.values.get(values.charCodeAt(i));
		// return sum;
	}
}
