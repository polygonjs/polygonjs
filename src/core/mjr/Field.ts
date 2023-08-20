import {Grid} from './Grid';
import {Array2D} from './helpers/DataStructures';
import {vec4} from './helpers/Helper';
import {Rule} from './Rule';

export class Field {
	public readonly recompute: boolean;
	public readonly inversed: boolean;
	public readonly essential: boolean;

	public readonly zero: number = 0;
	public readonly substrate: number;

	constructor(elem: Element, grid: Grid) {
		this.recompute = elem.getAttribute('recompute') === 'True';
		this.essential = elem.getAttribute('essential') === 'True';
		const on = elem.getAttribute('on') || '';
		this.substrate = grid.wave(on);

		let zeroSymbols = elem.getAttribute('from');
		if (zeroSymbols) {
			this.inversed = true;
		} else {
			this.inversed = false;
			zeroSymbols = elem.getAttribute('to');
		}
		if (zeroSymbols) {
			this.zero = grid.wave(zeroSymbols);
		}
	}

	public compute(potential: Int32Array, grid: Grid) {
		const {zero, substrate} = this;
		const {MX, MY, MZ, state} = grid;
		const queue: vec4[] = [];

		let ix = 0,
			iy = 0,
			iz = 0;
		for (let i = 0; i < state.length; i++) {
			potential[i] = -1;
			const value = state[i];
			if (zero & (1 << value)) {
				potential[i] = 0;
				queue.push([0, ix, iy, iz]);
			}

			ix++;
			if (ix === MX) {
				ix = 0;
				iy++;
				if (iy === MY) {
					iy = 0;
					iz++;
				}
			}
		}

		if (!queue.length) return false;
		while (queue.length) {
			const [t, x, y, z] = queue.shift()!;
			Field.neighbors(x, y, z, MX, MY, MZ, (nx, ny, nz) => {
				const i = nx + ny * MX + nz * MX * MY;
				const value = state[i];
				if (potential[i] === -1 && substrate & (1 << value)) {
					queue.push([t + 1, nx, ny, nz]);
					potential[i] = t + 1;
				}
			});
		}

		return true;
	}

	static neighbors(
		x: number,
		y: number,
		z: number,
		MX: number,
		MY: number,
		MZ: number,
		cb: (nx: number, ny: number, nz: number) => void
	) {
		if (x > 0) cb(x - 1, y, z);
		if (x < MX - 1) cb(x + 1, y, z);
		if (y > 0) cb(x, y - 1, z);
		if (y < MY - 1) cb(x, y + 1, z);
		if (z > 0) cb(x, y, z - 1);
		if (z < MZ - 1) cb(x, y, z + 1);
	}

	static deltaPointwise(
		state: Uint8Array,
		rule: Rule,
		x: number,
		y: number,
		z: number,
		fields: Field[],
		potentials: Array2D<Int32Array>,
		MX: number,
		MY: number
	) {
		let sum = 0;
		let dz = 0,
			dy = 0,
			dx = 0;
		for (let di = 0; di < rule.input.length; di++) {
			const newValue = rule.output[di];
			if (newValue != 0xff && (rule.input[di] & (1 << newValue)) == 0) {
				let i = x + dx + (y + dy) * MX + (z + dz) * MX * MY;
				let newPotential = potentials.get(i, newValue);
				if (newPotential == -1) return null;

				const oldValue = state[i];
				let oldPotential = potentials.get(i, oldValue);
				sum += newPotential - oldPotential;

				if (fields) {
					const oldField = fields[oldValue];
					if (oldField && oldField.inversed) sum += 2 * oldPotential;
					const newField = fields[newValue];
					if (newField && newField.inversed) sum -= 2 * newPotential;
				}
			}

			dx++;
			if (dx == rule.IMX) {
				dx = 0;
				dy++;
				if (dy == rule.IMY) {
					dy = 0;
					dz++;
				}
			}
		}
		return sum;
	}
}
