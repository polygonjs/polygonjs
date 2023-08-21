import {PRNG} from 'seedrandom';
import {Field} from '../Field';
import {Grid} from '../Grid';
import {BoolArray2D} from '../helpers/DataStructures';
import {range, vec4} from '../helpers/Helper';
import {Observation} from '../Observation';
import {RuleNode} from './Rule';
import {RunState} from './Common';

const INVALID: vec4 = [-1, -1, -1, -1];

export class OneNode extends RuleNode {
	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		if (!(await super.load(elem, parentSymmetry, grid))) return false;
		this.matches = new Uint32Array(8 * 1024);
		this.matchMask = new BoolArray2D(grid.state.length, this.rules.length);
		this.matchMask.clear();
		return true;
	}

	public override reset(): void {
		super.reset();
		if (this.matchCount) {
			this.matchMask.clear();
			this.matchCount = 0;
		}
	}

	public override run() {
		const status = super.run();
		if (status !== RunState.SUCCESS) return status;
		if (!(this.grid && this.ip)) {
			return RunState.FAIL;
		}

		this.lastMatchedTurn = this.ip.counter;

		if (this.trajectory) {
			if (this.counter >= this.trajectory.ROWS) return RunState.FAIL;

			this.grid.state.set(this.trajectory.row(this.counter));
			this.counter++;
			return RunState.SUCCESS;
		}

		const [r, x, y, z] = this.randomMatch(this.ip.rng);
		if (r < 0) return RunState.FAIL;
		else {
			this.last |= 1 << r;
			const rule = this.rules[r];
			if (rule.jit_apply_kernel) {
				rule.jit_apply_kernel(this.grid.state, this.grid.state, x, y, z, this.ip.changes);
			}
			this.counter++;
			return RunState.SUCCESS;
		}
	}

	randomMatch(rng: PRNG): vec4 {
		const {grid, matchMask, matches} = this;
		if (!grid) {
			return [-1, -1, -1, -1];
		}

		if (this.potentials) {
			if (this.observations && Observation.IsGoalReached(grid.state, this.future)) {
				this.futureComputed = false;
				return INVALID;
			}
			let max = -1000;
			let argmax = -1;

			let firstHeuristic = 0;
			let firstHeuristicComputed = false;

			for (let k = 0; k < this.matchCount; k++) {
				const offset0 = k << 2;

				const r = matches[offset0 + 0];
				const x = matches[offset0 + 1];
				const y = matches[offset0 + 2];
				const z = matches[offset0 + 3];

				let i = x + y * grid.MX + z * grid.MX * grid.MY;
				const rule = this.rules[r];
				if (!(rule.jit_match_kernel && rule.jit_match_kernel(grid.state, x, y, z))) {
					this.matchMask.set(i, r, false);
					this.matchCount--;

					const offset1 = this.matchCount << 2;
					this.matches.copyWithin(offset0, offset1, offset1 + 4);

					k--;
				} else {
					const heuristic = Field.deltaPointwise(
						grid.state,
						this.rules[r],
						x,
						y,
						z,
						this.fields,
						this.potentials,
						grid.MX,
						grid.MY
					);
					if (heuristic === null) continue;
					if (!firstHeuristicComputed) {
						firstHeuristic = heuristic;
						firstHeuristicComputed = true;
					}
					const u = rng.double();
					const key =
						this.temperature > 0
							? Math.pow(u, Math.exp((heuristic - firstHeuristic) / this.temperature))
							: -heuristic + 0.001 * u;
					if (key > max) {
						max = key;
						argmax = k;
					}
				}
			}

			if (argmax < 0) return INVALID;
			const o = argmax << 2;
			return [matches[o + 0], matches[o + 1], matches[o + 2], matches[o + 3]];
		} else {
			while (this.matchCount > 0) {
				const matchIndex = range(rng, this.matchCount);
				const offset0 = matchIndex << 2;

				const r = matches[offset0 + 0];
				const x = matches[offset0 + 1];
				const y = matches[offset0 + 2];
				const z = matches[offset0 + 3];

				const i = x + y * grid.MX + z * grid.MX * grid.MY;

				matchMask.set(i, r, false);
				this.matchCount--;

				const offset1 = this.matchCount << 2;
				this.matches.copyWithin(offset0, offset1, offset1 + 4);

				const rule = this.rules[r];
				if (rule.jit_match_kernel && rule.jit_match_kernel(grid.state, x, y, z)) {
					return [r, x, y, z];
				}
			}
			return INVALID;
		}
	}
}
