import seedrandom, {PRNG} from 'seedrandom';
import {Grid} from '../grid';
import {Array3D, BoolArray2D} from '../helpers/DataStructures';
import {Helper} from '../helpers/helper';
import {Wave} from './wfc/Wave';
import {Branch} from './Branch';
import {SequenceNode} from './Sequence';
import {RunState} from './Common';

export abstract class WFCNode extends Branch {
	protected wave: Wave;
	protected propagator: Int32Array[][];
	protected P = 1;
	protected N = 1;

	private stack: Uint16Array | Uint32Array;
	private stacksize = 0;

	protected weights: Float64Array;
	private weightLogWeights: Float64Array;

	private sumOfWeights = 0;
	private sumOfWeightLogWeights = 0;
	private startingEntropy = 0;

	protected newgrid: Grid;
	private startwave: Wave;

	protected map: Map<number, Uint8Array> = new Map();
	protected periodic: boolean;
	protected shannon: boolean;

	private distribution: Float64Array;
	private tries: number;

	public name: string;

	private firstgo = true;
	protected rng: PRNG;

	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		this.shannon = elem.getAttribute('shannon') === 'True';
		this.tries = parseInt(elem.getAttribute('tries') || '1000') || 1000;

		this.wave = new Wave(grid.state.length, this.P, this.propagator.length, this.shannon);

		this.startwave = new Wave(grid.state.length, this.P, this.propagator.length, this.shannon);

		this.stack =
			this.wave.data.ROWS >= 65536 || this.P >= 65536
				? new Uint32Array(this.wave.data.ROWS * this.P * 2)
				: new Uint16Array(this.wave.data.ROWS * this.P * 2);

		if (this.shannon) {
			this.weightLogWeights = new Float64Array(this.P);

			for (let t = 0; t < this.P; t++) {
				this.weightLogWeights[t] = this.weights[t] * Math.log(this.weights[t]);
				this.sumOfWeights += this.weights[t];
				this.sumOfWeightLogWeights += this.weightLogWeights[t];
			}

			this.startingEntropy = Math.log(this.sumOfWeights) - this.sumOfWeightLogWeights / this.sumOfWeights;
		}

		this.distribution = new Float64Array(this.P);
		return await super.load(elem, parentSymmetry, this.newgrid);
	}

	public override reset(): void {
		super.reset();
		this.n = -1;
		this.firstgo = true;
	}

	public override run() {
		if (this.n >= 0) return SequenceNode.prototype.run.apply(this);

		if (this.firstgo) {
			this.wave.init(
				this.propagator,
				this.sumOfWeights,
				this.sumOfWeightLogWeights,
				this.startingEntropy,
				this.shannon
			);

			for (let i = 0; i < this.wave.data.ROWS; i++) {
				const value = this.grid.state[i];
				const startWave = this.map.get(value);
				if (startWave) {
					for (let t = 0; t < this.P; t++)
						if (!startWave[t]) {
							this.ban(i, t);
						}
				}
			}

			const firstSuccess = this.propagate();
			if (!firstSuccess) {
				console.error('WFC initial conditions are contradictive');
				return RunState.FAIL;
			}
			this.startwave.copyFrom(this.wave, this.shannon);
			const goodseed = this.goodSeed();
			if (goodseed === null) return RunState.FAIL;

			this.rng = seedrandom(goodseed.toString());
			this.stacksize = 0;
			this.wave.copyFrom(this.startwave, this.shannon);
			this.firstgo = false;

			this.newgrid.clear();
			this.ip.grid = this.newgrid;

			return RunState.SUCCESS;
		} else {
			const node = this.nextUnobservedNode(this.rng);
			if (node >= 0) {
				this.observe(node, this.rng);
				this.propagate();
			} else this.n++;

			if (this.n >= 0) {
				this.updateState();
			}
			return RunState.SUCCESS;
		}
	}

	goodSeed(): number {
		for (let k = 0; k < this.tries; k++) {
			let obs = 0;
			const seed = this.ip.rng.int32();
			this.rng = seedrandom(seed.toString());
			this.stacksize = 0;
			this.wave.copyFrom(this.startwave, this.shannon);

			while (true) {
				const node = this.nextUnobservedNode(this.rng);

				if (node >= 0) {
					this.observe(node, this.rng);
					obs++;
					const success = this.propagate();
					if (!success) {
						console.warn(`CONTRADICTION on try#${k} with ${obs} observations`);
						break;
					}
				} else {
					console.log(`WFC found a good seed ${seed} on try#${k} with ${obs} observations`);
					return seed;
				}
			}
		}

		console.error(`WFC failed to find a good seed in ${this.tries} tries`);
		return null;
	}

	nextUnobservedNode(rng: PRNG) {
		const {grid, wave, periodic, shannon} = this;
		const {MX, MY, MZ} = grid;

		const N = this.N;
		let min = 1e4;
		let argmin = -1;

		for (let z = 0; z < MZ; z++)
			for (let y = 0; y < MY; y++)
				for (let x = 0; x < MX; x++) {
					if (!periodic && (x + N > MX || y + N > MY || z + 1 > MZ)) continue;
					const i = x + y * MX + z * MX * MY;
					const remainingValues = wave.sumsOfOnes[i];
					const entropy = shannon ? wave.entropies[i] : remainingValues;
					if (remainingValues > 1 && entropy <= min) {
						const noise = 1e-6 * rng.double();
						if (entropy + noise < min) {
							min = entropy + noise;
							argmin = i;
						}
					}
				}
		return argmin;
	}

	observe(node: number, rng: PRNG) {
		const w = this.wave.data.row(node);
		for (let t = 0; t < this.P; t++) this.distribution[t] = w.get(t) ? this.weights[t] : 0;
		const r = Helper.sampleWeights(this.distribution, rng.double());
		for (let t = 0; t < this.P; t++) if (w.get(t) !== (t === r)) this.ban(node, t);
	}

	// Could be unrolled/rewrote in webassembly
	// Very cache sensitive (context switch = runtime go boom)
	propagate(): boolean {
		const {N, grid, periodic, propagator, stack, wave} = this;
		const {MX, MY, MZ} = grid;

		while (this.stacksize > 0) {
			const i1 = stack[this.stacksize - 2];
			const p1 = stack[this.stacksize - 1];
			this.stacksize -= 2;

			const x1 = i1 % MX,
				y1 = ~~((i1 % (MX * MY)) / MX),
				z1 = ~~(i1 / (MX * MY));

			for (let d = 0; d < propagator.length; d++) {
				const dx = WFCNode.DX[d],
					dy = WFCNode.DY[d],
					dz = WFCNode.DZ[d];
				let x2 = x1 + dx,
					y2 = y1 + dy,
					z2 = z1 + dz;
				if (!periodic && (x2 < 0 || y2 < 0 || z2 < 0 || x2 + N > MX || y2 + N > MY || z2 + 1 > MZ)) continue;

				x2 = (x2 + MX) % MX;
				y2 = (y2 + MY) % MY;
				z2 = (z2 + MZ) % MZ;

				const i2 = x2 + y2 * MX + z2 * MX * MY;
				const p = propagator[d][p1];

				for (const t2 of p) {
					if (!wave.compatible.postDecre(d, t2, i2)) this.ban(i2, t2);
				}
			}
		}

		return wave.sumsOfOnes[0] > 0;
	}

	ban(i: number, t: number) {
		const {wave, stack, weights, weightLogWeights, propagator, shannon} = this;
		wave.data.set(t, i, false);

		for (let d = 0; d < propagator.length; d++) wave.compatible.set(d, t, i, 0);

		stack[this.stacksize + 0] = i;
		stack[this.stacksize + 1] = t;
		this.stacksize += 2;

		wave.sumsOfOnes[i] -= 1;

		if (shannon) {
			let sum = wave.sumsOfWeights[i];
			wave.entropies[i] += wave.sumsOfWeightLogWeights[i] / sum - Math.log(sum);

			wave.sumsOfWeights[i] -= weights[t];
			wave.sumsOfWeightLogWeights[i] -= weightLogWeights[t];

			sum = wave.sumsOfWeights[i];
			wave.entropies[i] -= wave.sumsOfWeightLogWeights[i] / sum - Math.log(sum);
		}
	}

	public abstract updateState();

	protected static DX = new Int8Array([1, 0, -1, 0, 0, 0]);
	protected static DY = new Int8Array([0, 1, 0, -1, 0, 0]);
	protected static DZ = new Int8Array([0, 0, 0, 0, 1, -1]);
}
