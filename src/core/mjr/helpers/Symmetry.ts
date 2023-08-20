// import {Rule} from '../Rule';

declare type Self<T> = (arg: T) => T;
declare type IsSame<T> = (arg0: T, arg1: T) => boolean;

const cubeFunc = (func: (n: number) => boolean) =>
	new Uint8Array(Array.from({length: 48}, (_, k) => (func(k) ? 1 : 0)));

export class SymmetryHelper {
	public static squareSubgroups = new Map([
		['()', new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0])],
		['(x)', new Uint8Array([1, 1, 0, 0, 0, 0, 0, 0])],
		['(y)', new Uint8Array([1, 0, 0, 0, 0, 1, 0, 0])],
		['(x)(y)', new Uint8Array([1, 1, 0, 0, 1, 1, 0, 0])],
		['(xy+)', new Uint8Array([1, 0, 1, 0, 1, 0, 1, 0])],
		['(xy)', new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1])],
	]);

	public static squareSymmetries<T>(
		thing: T,
		rotate: Self<T>,
		reflect: Self<T>,
		same: IsSame<T>,
		subgroup: Uint8Array | null = null
	) {
		const things: T[] = new Array<T>(8);

		things[0] = thing; // e
		things[1] = reflect(things[0]); // b
		things[2] = rotate(things[0]); // a
		things[3] = reflect(things[2]); // ba
		things[4] = rotate(things[2]); // a2
		things[5] = reflect(things[4]); // ba2
		things[6] = rotate(things[4]); // a3
		things[7] = reflect(things[6]); // ba3

		const result: T[] = [];
		for (let i = 0; i < 8; i++) {
			if ((!subgroup || subgroup[i]) && !result.some((t) => same(t, things[i]))) {
				result.push(things[i]);
			} else {
				// const idx = result.findIndex((t) => same(t, things[i]));
				// if (i === 6) console.log(idx, things[idx], 6, things[i]);
				// if (i === 4) console.log(4, things[4]);
			}
		}
		return result;
	}

	public static cubeSubgroups = new Map([
		['()', cubeFunc((l) => l === 0)],
		['(x)', cubeFunc((l) => l === 0 || l === 1)],
		['(z)', cubeFunc((l) => l === 0 || l === 17)],
		['(xy)', cubeFunc((l) => l < 8)],
		['(xyz+)', cubeFunc((l) => l % 2 === 0)],
		['(xyz)', cubeFunc((_) => true)],
	]);

	public static cubeSymmetries<T>(
		thing: T,
		a: Self<T>,
		b: Self<T>,
		r: Self<T>,
		same: IsSame<T>,
		subgroup: Uint8Array | null = null
	) {
		const s: T[] = new Array<T>(48);

		s[0] = thing; // e
		s[1] = r(s[0]);
		s[2] = a(s[0]); // a
		s[3] = r(s[2]);
		s[4] = a(s[2]); // a2
		s[5] = r(s[4]);
		s[6] = a(s[4]); // a3
		s[7] = r(s[6]);
		s[8] = b(s[0]); // b
		s[9] = r(s[8]);
		s[10] = b(s[2]); // b a
		s[11] = r(s[10]);
		s[12] = b(s[4]); // b a2
		s[13] = r(s[12]);
		s[14] = b(s[6]); // b a3
		s[15] = r(s[14]);
		s[16] = b(s[8]); // b2
		s[17] = r(s[16]);
		s[18] = b(s[10]); // b2 a
		s[19] = r(s[18]);
		s[20] = b(s[12]); // b2 a2
		s[21] = r(s[20]);
		s[22] = b(s[14]); // b2 a3
		s[23] = r(s[22]);
		s[24] = b(s[16]); // b3
		s[25] = r(s[24]);
		s[26] = b(s[18]); // b3 a
		s[27] = r(s[26]);
		s[28] = b(s[20]); // b3 a2
		s[29] = r(s[28]);
		s[30] = b(s[22]); // b3 a3
		s[31] = r(s[30]);
		s[32] = a(s[8]); // a b
		s[33] = r(s[32]);
		s[34] = a(s[10]); // a b a
		s[35] = r(s[34]);
		s[36] = a(s[12]); // a b a2
		s[37] = r(s[36]);
		s[38] = a(s[14]); // a b a3
		s[39] = r(s[38]);
		s[40] = a(s[24]); // a3 b a2 = a b3
		s[41] = r(s[40]);
		s[42] = a(s[26]); // a3 b a3 = a b3 a
		s[43] = r(s[42]);
		s[44] = a(s[28]); // a3 b = a b3 a2
		s[45] = r(s[44]);
		s[46] = a(s[30]); // a3 b a = a b3 a3
		s[47] = r(s[46]);

		const result: T[] = [];
		for (let i = 0; i < 48; i++) {
			if ((!subgroup || subgroup[i]) && !result.some((t) => same(t, s[i]))) result.push(s[i]);
		}
		return result;
	}

	public static getSymmetry(d2: boolean, s: string | null, dflt: Uint8Array) {
		if (!s) return dflt;
		return d2 ? this.squareSubgroups.get(s) : this.cubeSubgroups.get(s);
	}
}
