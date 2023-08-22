// import {vec3} from 'gl-matrix';
import {Field} from '../Field';
import {Grid} from '../Grid';
import {Array2D, BoolArray2D} from '../helpers/DataStructures';
import {Helper} from '../helpers/Helper';
import {SymmetryHelper} from '../helpers/Symmetry';
import {Observation} from '../Observation';
import {Rule} from '../Rule';
import {Search} from '../Search';

// import {NativeObserve} from '../wasm/observe';
// import {Optimization} from '../wasm/optimization';
// import {NativeSearch} from '../wasm/search';

import {RunState, OPTIMIZATION_INLINE_LIMIT} from './Common';
import {Node} from './Node';
import {AllNode} from './All';

export abstract class RuleNode extends Node {
	public readonly rules: Rule[] = [];
	public counter: number = 0;
	public steps: number = 0;

	public matches!: Uint32Array;
	public matchCount: number = 0;
	protected lastMatchedTurn: number = -1;
	protected matchMask!: BoolArray2D;

	protected potentials!: Array2D<Int32Array>;

	public fields: Field[] = [];
	public observations?: Observation[];
	public temperature: number = 0;

	public search: boolean = false;
	protected futureComputed: boolean = false;
	protected future!: Int32Array;
	protected trajectory: Array2D<Uint8Array> | null = null;

	private limit: number = -1;
	private depthCoefficient: number = 0.5;

	public last: number = 0;

	public visited = NaN;
	private searching: Generator<number, Uint8Array[] | null> | null = null;
	private searchTries = 0;

	private preObserve: Uint8Array | null = null;
	// private native: NativeObserve;

	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		const symmetryString = elem.getAttribute('symmetry');
		const symmetry = SymmetryHelper.getSymmetry(grid.MZ === 1, symmetryString, parentSymmetry);
		if (!symmetry) {
			console.error(elem, `unknown symmetry ${symmetryString}`);
			return null;
		}

		const rules = [...Helper.childrenByTag(elem, 'rule')];
		console.log('rules', elem, rules, rules.length);
		const ruleElements = rules.length > 0 ? rules : [elem];

		const tasks: Promise<Rule[] | null>[] = ruleElements.map(async (e) => {
			const rule = await Rule.load(e, grid, grid);
			if (!rule) return null;

			rule.original = true;
			const ruleList: Rule[] = [];

			const ruleSymmetryString = e.getAttribute('symmetry');
			const ruleSymmetry = SymmetryHelper.getSymmetry(grid.MZ === 1, ruleSymmetryString, symmetry);
			if (!ruleSymmetry) {
				console.error(e, `unknown rule symmetry ${ruleSymmetryString}`);
				return null;
			}
			for (const r of rule.symmetries(ruleSymmetry, grid.MZ === 1)) {
				ruleList.push(r);
				RuleNode.compile(r, grid.MX, grid.MY, grid.MZ);
			}

			return ruleList;
		});

		const ruleLists = await Promise.all(tasks);
		if (ruleLists.some((list) => !list)) return false;
		this.rules.splice(0, this.rules.length, ...(ruleLists.flat() as Rule[]));
		console.log('2 rules', elem, this.rules, rules.length);

		this.last = 0;

		this.steps = parseInt(elem.getAttribute('steps') || '0') || 0;
		this.temperature = parseFloat(elem.getAttribute('temperature') || '0') || 0;

		const efields = [...Helper.matchTags(elem, 'field')];

		if (efields.length) {
			this.fields = Array.from({length: grid.C});
			for (const efield of efields) {
				const charCode = efield?.getAttribute('for')?.charCodeAt(0);
				if (efield && charCode != null) {
					const index = grid.values.get(charCode);
					if (index != null) {
						this.fields[index] = new Field(efield, grid);
					}
				}
			}

			this.potentials = new Array2D(Int32Array, grid.state.length, grid.C);
			this.potentials.fill(0);
		}

		const eobs = [...Helper.childrenByTag(elem, 'observe')];
		if (eobs.length) {
			this.observations = Array.from({length: grid.C});
			for (const eob of eobs) {
				const charCode = eob.getAttribute('value')?.charCodeAt(0);
				if (charCode) {
					const value = grid.values.get(charCode);
					if (value != null) {
						this.observations[value] = new Observation(
							eob.getAttribute('from')?.charCodeAt(0) || grid.characters.charCodeAt(value),
							eob.getAttribute('to') || 'to attribute not provided',
							grid
						);
					}
				}
			}

			this.search = elem.getAttribute('search') === 'True';
			if (this.search) {
				this.limit = parseInt(elem.getAttribute('limit') || '-1') || -1;
				this.depthCoefficient = parseFloat(elem.getAttribute('depthCoefficient') || '0.5') || 0.5;
			} else if (!this.potentials) {
				console.error(elem, 'no potentials');
				// if (Optimization.supported) {
				// 	const lib = await Optimization.module.init();
				// 	this.native = new NativeObserve(lib, grid, this);

				// 	this.potentials = new Array2D(this.native.potentials, grid.state.length, grid.C);
				// 	this.future = this.native.future;
				// } else {
				// 	this.potentials = new Array2D(Int32Array, grid.state.length, grid.C);
				// }
			}

			if (!this.future) this.future = new Int32Array(grid.state.length);
		}

		return true;
	}

	public override reset() {
		this.lastMatchedTurn = -1;
		this.counter = 0;
		this.futureComputed = false;
		this.searchTries = 0;
		this.last = 0;

		try {
			this.searching?.throw(new Error('reset'));
		} catch {}
		this.searching = null;
		this.preObserve = null;
	}

	protected add(r: number, x: number, y: number, z: number) {
		if (!this.grid) {
			return;
		}
		this.matchMask.set(x + y * this.grid.MX + z * this.grid.MX * this.grid.MY, r, true);

		// Reuse array
		const offset = this.matchCount << 2;
		if (offset + 4 < this.matches.length) {
			this.matches[offset + 0] = r;
			this.matches[offset + 1] = x;
			this.matches[offset + 2] = y;
			this.matches[offset + 3] = z;
		} else {
			// Realloc
			const old = this.matches;
			this.matches = new Uint32Array((old.length + 4) << 1);
			this.matches.set(old);
			this.matches[offset + 0] = r;
			this.matches[offset + 1] = x;
			this.matches[offset + 2] = y;
			this.matches[offset + 3] = z;
		}
		this.matchCount++;
	}

	private observe() {
		const {grid, ip /*native*/} = this;
		if (!(grid && ip)) {
			return;
		}
		const {MX, MY, MZ} = grid;

		if (this.observations && !this.futureComputed) {
			if (!this.search) {
				// const start = performance.now();

				// Wasm version
				// if (native) {
				// 	console.error('native not implemented');
				// 	// if (!native.computeFutureSetPresent(grid.state)) return RunState.FAIL;

				// 	// native.computeBackwardPotentials(MX, MY, MZ);
				// } else {
				if (!Observation.computeFutureSetPresent(this.future, grid.state, this.observations)) {
					return RunState.FAIL;
				}

				Observation.computeBackwardPotentials(this.potentials, this.future, MX, MY, MZ, this.rules);
				// }
				this.futureComputed = true;

				// wasm x2 speedup over js, tested on Island (seed=112716328)
				// const end = performance.now();
				// console.log(
				//     `${this.native ? "wasm version: " : "js version: "} ${(
				//         end - start
				//     ).toFixed(2)}ms`
				// );
			} else {
				if (!this.searching) {
					if (!this.preObserve) {
						this.preObserve = new Uint8Array(grid.state.length);
						this.preObserve.set(grid.state);
					} else {
						grid.state.set(this.preObserve);
					}

					if (!Observation.computeFutureSetPresent(this.future, grid.state, this.observations)) {
						this.preObserve = null;
						return RunState.FAIL;
					}

					this.trajectory = null;
					// start searching
					this.searching = /*Optimization.supported
						? new NativeSearch(
								grid.state,
								this.future,
								this.rules,
								grid.MX,
								grid.MY,
								grid.MZ,
								grid.C,
								this instanceof AllNode,
								this.limit,
								this.depthCoefficient,
								this.ip.rng.int32(),
								true // viz
						  ).run()
						:*/ Search.run(
						grid.state,
						this.future,
						this.rules,
						grid.MX,
						grid.MY,
						grid.MZ,
						grid.C,
						this instanceof AllNode,
						this.limit,
						this.depthCoefficient,
						ip.rng.int32(),
						true // viz
					);
				}

				let result = this.searching.next();

				if (!result.done && typeof result.value === 'number') {
					this.visited = result.value;
					return RunState.HALT;
				} else if (result.done && typeof result.value === 'number') {
					this.searching = null;
					this.trajectory = Array2D.from(Uint8Array, result.value);

					if (!this.trajectory) {
						this.searchTries++;

						const limit = this.limit < 0 ? 1 : 20;
						if (this.searchTries >= limit) {
							console.error(`no trajectory found after ${this.searchTries} attempts`);
							return RunState.FAIL;
						} else {
							// Program.instance.renderer.forcedState = null;
							console.log(`[${this.searchTries}/${limit}] failed`);
							return RunState.HALT;
						}
					} else {
						this.preObserve = null;
						this.futureComputed = true;
					}
				} else {
					console.error(result);
				}
			}
		}

		return null;
	}

	public override run() {
		this.last = 0;

		if (this.steps > 0 && this.counter >= this.steps) return RunState.FAIL;

		const {grid, matchMask} = this;
		if (!(grid && this.ip)) {
			return RunState.FAIL;
		}
		const {MX, MY, MZ, state} = grid;

		const status = this.observe();
		console.log('run 1', status);
		if (status != null) return status;
		console.log('this.lastMatchedTurn', this.lastMatchedTurn);
		if (this.lastMatchedTurn >= 0) {
			const ip = this.ip;
			for (let n = ip.first[this.lastMatchedTurn]; n < ip.changes.length; n++) {
				const [x, y, z] = ip.changes[n];
				const value = grid.state[x + y * MX + z * MX * MY];
				for (let r = 0; r < this.rules.length; r++) {
					const rule = this.rules[r];
					const shifts = rule.ishifts[value];
					for (const [shiftx, shifty, shiftz] of shifts) {
						const sx = x - shiftx;
						const sy = y - shifty;
						const sz = z - shiftz;

						if (
							sx < 0 ||
							sy < 0 ||
							sz < 0 ||
							sx + rule.IMX > MX ||
							sy + rule.IMY > MY ||
							sz + rule.IMZ > MZ
						)
							continue;
						const si = sx + sy * MX + sz * MX * MY;

						if (!matchMask.get(si, r) && rule.jit_match_kernel && rule.jit_match_kernel(state, sx, sy, sz))
							this.add(r, sx, sy, sz);
					}
				}
			}
		} else {
			this.matchCount = 0;
			console.log('this.rules', this.rules);
			for (let r = 0; r < this.rules.length; r++) {
				const rule = this.rules[r];
				for (let z = rule.IMZ - 1; z < MZ; z += rule.IMZ)
					for (let y = rule.IMY - 1; y < MY; y += rule.IMY)
						for (let x = rule.IMX - 1; x < MX; x += rule.IMX) {
							const offset = x + y * MX + z * MX * MY;
							const value = grid.state[offset];
							const shifts = rule.ishifts[value];
							for (const [shiftx, shifty, shiftz] of shifts) {
								const sx = x - shiftx;
								const sy = y - shifty;
								const sz = z - shiftz;
								if (
									sx < 0 ||
									sy < 0 ||
									sz < 0 ||
									sx + rule.IMX > MX ||
									sy + rule.IMY > MY ||
									sz + rule.IMZ > MZ
								) {
									continue;
								}

								console.log(
									'rule.jit_match_kernel',
									rule.jit_match_kernel,
									rule.jit_match_kernel ? rule.jit_match_kernel(state, sx, sy, sz) : null
								);
								if (rule.jit_match_kernel && rule.jit_match_kernel(state, sx, sy, sz)) {
									console.log(r, sx, sy, sz);
									this.add(r, sx, sy, sz);
								}
							}
						}
			}
		}
		console.log('this.fields', this.fields);
		if (this.fields) {
			let anysuccess = false;
			let anycomputation = false;

			for (let c = 0; c < this.fields.length; c++) {
				const field = this.fields[c];
				if (field && (!this.counter || field.recompute)) {
					const success = field.compute(this.potentials.row(c), grid);
					if (!success && field.essential) return RunState.FAIL;
					anysuccess ||= success;
					anycomputation = true;
				}
			}
			if (anycomputation && !anysuccess) return RunState.FAIL;
			console.log({anysuccess, anycomputation});
		}

		return RunState.SUCCESS;
	}

	private static compile(rule: Rule, MX: number, MY: number, MZ: number) {
		const {input, output, IO_DIM} = rule;

		const [IMX, IMY, _, OMX, OMY, OMZ] = IO_DIM;

		// jit_match_kernel
		if (input.length <= OPTIMIZATION_INLINE_LIMIT /*Optimization.inline_limit*/) {
			let dz = 0;
			let dy = 0;
			let dx = 0;

			const code: string[] = [];

			for (let di = 0; di < input.length; di++) {
				code.push(
					`if ((${input[di]} & (1 << state[x + ${dx} + (y + ${dy}) * ${MX} + (z + ${dz}) * ${
						MX * MY
					}])) === 0) return false;`
				);

				dx++;
				if (dx === IMX) {
					dx = 0;
					dy++;
					if (dy === IMY) {
						dy = 0;
						dz++;
					}
				}
			}

			code.push('return true;');
			rule.jit_match_kernel = <typeof rule.jit_match_kernel>(
				new Function('state', 'x', 'y', 'z', code.map((line) => ' '.repeat(4) + line).join('\n'))
			);
		} else {
			rule.jit_match_kernel = (state: Uint8Array, x, y, z) => {
				let dz = 0,
					dy = 0,
					dx = 0;

				for (let di = 0; di < input.length; di++) {
					if ((input[di] & (1 << state[x + dx + (y + dy) * MX + (z + dz) * MX * MY])) === 0) return false;

					dx++;
					if (dx === IMX) {
						dx = 0;
						dy++;
						if (dy === IMY) {
							dy = 0;
							dz++;
						}
					}
				}
				return true;
			};
		}

		// jit_apply_kernel
		if (output.length <= OPTIMIZATION_INLINE_LIMIT /*Optimization.inline_limit*/) {
			const code: string[] = [];
			for (let dz = 0; dz < OMZ; dz++) {
				for (let dy = 0; dy < OMY; dy++) {
					for (let dx = 0; dx < OMX; dx++) {
						const newValue = output[dx + dy * OMX + dz * OMX * OMY];
						if (newValue !== 0xff) {
							code.push(`
        {
            const sx = x + ${dx};
            const sy = y + ${dy};
            const sz = z + ${dz};
            const si = sx + sy * ${MX} + sz * ${MX * MY};
            const oldValue = state_in[si];
            if (oldValue != ${newValue}) {
                state_out[si] = ${newValue};
                changes.push([sx, sy, sz]);
            }
        }`);
						}
					}
				}
			}
			rule.jit_apply_kernel = <typeof rule.jit_apply_kernel>(
				new Function('state_in', 'state_out', 'x', 'y', 'z', 'changes', code.join('\n'))
			);
		} else {
			rule.jit_apply_kernel = (state_in, state_out, x, y, z, changes) => {
				for (let dz = 0; dz < rule.OMZ; dz++) {
					for (let dy = 0; dy < rule.OMY; dy++) {
						for (let dx = 0; dx < rule.OMX; dx++) {
							const newValue = rule.output[dx + dy * rule.OMX + dz * rule.OMX * rule.OMY];
							if (newValue !== 0xff) {
								const sx = x + dx;
								const sy = y + dy;
								const sz = z + dz;
								const si = sx + sy * MX + sz * MX * MY;
								const oldValue = state_in[si];
								if (oldValue !== newValue) {
									state_out[si] = newValue;
									changes.push([sx, sy, sz]);
								}
							}
						}
					}
				}
			};
		}
	}
}
