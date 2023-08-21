import {Grid} from './Grid';
import {Array2D, BoolArray2D} from './helpers/DataStructures';
import {vec4} from './helpers/Helper';
import {Rule} from './Rule';

export class Observation {
	public readonly from: number;
	public readonly to: number;

	constructor(from: number, to: string, grid: Grid) {
		this.from = grid.values.get(from) || -1;
		this.to = grid.wave(to);
	}

	public static computeFutureSetPresent(future: Int32Array, state: Uint8Array, observations: Observation[]) {
		const mask = new Uint8Array(observations.length);
		for (let k = 0; k < observations.length; k++) if (!observations[k]) mask[k] = 1;

		for (let i = 0; i < state.length; i++) {
			const value = state[i];
			const obs = observations[value];
			mask[value] = 1;

			if (obs) {
				future[i] = obs.to;
				state[i] = obs.from;
			} else future[i] = 1 << value;
		}

		for (let k = 0; k < mask.length; k++) if (!mask[k]) return false;
		return true;
	}

	public static computeForwardPotentials(
		potentials: Array2D<Int32Array>,
		state: Uint8Array,
		MX: number,
		MY: number,
		MZ: number,
		rules: Rule[]
	) {
		potentials.fill(-1);
		for (let i = 0; i < state.length; i++) potentials.set(i, state[i], 0);
		this.computePotentials(potentials, MX, MY, MZ, rules, false);
	}

	public static computeBackwardPotentials(
		potentials: Array2D<Int32Array>,
		future: Int32Array,
		MX: number,
		MY: number,
		MZ: number,
		rules: Rule[]
	) {
		for (let c = 0; c < potentials.ROWS; c++) {
			const potential = potentials.row(c);
			for (let i = 0; i < future.length; i++) potential[i] = (future[i] & (1 << c)) !== 0 ? 0 : -1;
		}
		this.computePotentials(potentials, MX, MY, MZ, rules, true);
	}

	private static computePotentials(
		potentials: Array2D<Int32Array>,
		MX: number,
		MY: number,
		MZ: number,
		rules: Rule[],
		backwards: boolean
	) {
		const queue: vec4[] = [];
		const matchMask = new BoolArray2D(potentials.COLS, rules.length);

		const proc = (value: number, x: number, y: number, z: number) => {
			const i = x + y * MX + z * MX * MY;
			const t = potentials.get(i, value);
			for (let r = 0; r < rules.length; r++) {
				const rule = rules[r];
				const shifts = backwards ? rule.oshifts[value] : rule.ishifts[value];
				for (const [shiftx, shifty, shiftz] of shifts) {
					const sx = x - shiftx;
					const sy = y - shifty;
					const sz = z - shiftz;

					if (sx < 0 || sy < 0 || sz < 0 || sx + rule.IMX > MX || sy + rule.IMY > MY || sz + rule.IMZ > MZ)
						continue;
					let si = sx + sy * MX + sz * MX * MY;
					if (
						!matchMask.get(si, r) &&
						this.forwardMatches(rule, sx, sy, sz, potentials, t, MX, MY, backwards)
					) {
						matchMask.set(si, r, true);
						this.applyForward(rule, sx, sy, sz, potentials, t, MX, MY, queue, backwards);
					}
				}
			}
		};

		// Why queue here when it will be dequeued and execute in the exact same order
		for (let c = 0; c < potentials.ROWS; c++) {
			const potential = potentials.row(c);
			for (let i = 0; i < potential.length; i++) {
				if (!potential[i]) {
					proc(c, i % MX, ~~((i % (MX * MY)) / MX), ~~(i / (MX * MY)));
				}
			}
		}

		while (queue.length) {
			const [value, x, y, z] = queue.shift()!;
			proc(value, x, y, z);
		}
	}

	private static forwardMatches(
		rule: Rule,
		x: number,
		y: number,
		z: number,
		potentials: Array2D<Int32Array>,
		t: number,
		MX: number,
		MY: number,
		backwards: boolean
	) {
		let dz = 0,
			dy = 0,
			dx = 0;
		const a = backwards ? rule.output : rule.binput;
		for (let di = 0; di < a.length; di++) {
			const value = a[di];
			if (value != 0xff) {
				const current = potentials.get(x + dx + (y + dy) * MX + (z + dz) * MX * MY, value);
				if (current > t || current === -1) return false;
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
		return true;
	}

	private static applyForward(
		rule: Rule,
		x: number,
		y: number,
		z: number,
		potentials: Array2D<Int32Array>,
		t: number,
		MX: number,
		MY: number,
		q: vec4[],
		backwards: boolean
	) {
		const a = backwards ? rule.binput : rule.output;
		for (let dz = 0; dz < rule.IMZ; dz++) {
			const zdz = z + dz;
			for (let dy = 0; dy < rule.IMY; dy++) {
				const ydy = y + dy;
				for (let dx = 0; dx < rule.IMX; dx++) {
					const xdx = x + dx;
					const idi = xdx + ydy * MX + zdz * MX * MY;
					const di = dx + dy * rule.IMX + dz * rule.IMX * rule.IMY;
					const o = a[di];
					if (o !== 0xff && potentials.get(idi, o) === -1) {
						potentials.set(idi, o, t + 1);
						q.push([o, xdx, ydy, zdz]);
					}
				}
			}
		}
	}

	public static IsGoalReached(present: Uint8Array, future: Int32Array) {
		for (let i = 0; i < present.length; i++) if (((1 << present[i]) & future[i]) === 0) return false;
		return true;
	}

	public static forwardPointwise(potentials: Array2D<Int32Array>, future: Int32Array) {
		let sum = 0;
		for (let i = 0; i < future.length; i++) {
			let f = future[i];
			let min = 1000,
				argmin = -1;
			for (let c = 0; c < potentials.ROWS; c++, f >>= 1) {
				const potential = potentials.get(i, c);
				if ((f & 1) == 1 && potential >= 0 && potential < min) {
					min = potential;
					argmin = c;
				}
			}
			if (argmin < 0) return -1;
			sum += min;
		}
		return sum;
	}

	public static backwardPointwise(potentials: Array2D<Int32Array>, present: Uint8Array) {
		let sum = 0;
		for (let i = 0; i < present.length; i++) {
			const potential = potentials.get(i, present[i]);
			if (potential < 0) return -1;
			sum += potential;
		}
		return sum;
	}
}
