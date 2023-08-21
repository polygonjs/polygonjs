import seedrandom, {PRNG} from 'seedrandom';
import {Grid} from './Grid';
import {vec3} from './helpers/Helper';
import {SymmetryHelper} from './helpers/Symmetry';
import {nodeFactory} from './nodes/Factory';
import {Branch} from './nodes/Branch';
import {MarkovNode} from './nodes/Markov';
import {EventNode} from './nodes/extensions/Event';
import {WFCNode} from './nodes/WFC';

interface InterpreterOptions {
	origin: boolean;
	grid: Grid;
	startgrid: Grid;
}

export class Interpreter {
	public root: Branch | null = null;
	public current: Branch | null = null;
	public listener: EventNode | null = null;
	public blocking = false;

	public grid: Grid;
	public startgrid: Grid;

	origin: boolean;
	public rng!: PRNG;
	public time = 0;

	public readonly changes: vec3[] = [];
	public readonly first: number[] = [];
	public counter = 0;

	constructor(options: InterpreterOptions) {
		this.origin = options.origin;
		this.grid = options.grid;
		this.startgrid = options.startgrid;
	}

	public static async load(elem: Element, MX: number, MY: number, MZ: number) {
		const origin = elem.getAttribute('origin') === 'True';
		const grid = Grid.build(elem, MX, MY, MZ);
		if (!grid) {
			console.error('Failed to load grid');
			return null;
		}
		const startgrid = grid;

		const symmetryString = elem.getAttribute('symmetry');

		const dflt = new Uint8Array(grid.MZ === 1 ? 8 : 48);
		dflt.fill(1);

		const symmetry = SymmetryHelper.getSymmetry(grid.MZ === 1, symmetryString, dflt);
		if (!symmetry) {
			console.error(elem, `unknown symmetry ${symmetryString}`);
			return null;
		}
		const ip = new Interpreter({
			origin,
			grid,
			startgrid,
		});

		const topnode = await nodeFactory(elem, symmetry, ip, ip.grid);
		if (!topnode) return null;
		console.log({topnode});

		const root = topnode instanceof Branch ? topnode : new MarkovNode(topnode, ip);
		ip.root = root;
		return ip;
	}

	public *run(seed: number, steps: number): Generator<[Uint8Array, string, number, number, number]> {
		this.rng = seedrandom(seed.toString());
		this.grid = this.startgrid;
		this.grid.clear();

		if (this.origin) {
			const center =
				(this.grid.MX >>> 1) +
				(this.grid.MY >>> 1) * this.grid.MX +
				(this.grid.MZ >>> 1) * this.grid.MX * this.grid.MY;
			this.grid.state[center] = 1;
		}

		this.changes.splice(0, this.changes.length);
		this.first.splice(0, this.first.length);
		this.first.push(0);

		this.time = 0;
		if (!this.root) {
			console.error('no root');
			return;
		}
		this.root.reset();
		this.current = this.root;

		this.counter = 0;

		while (this.current && (steps <= 0 || this.counter < steps)) {
			if (!this.blocking) yield this.state();

			this.current.run();
			this.increChanges();
		}

		yield this.state();
	}

	public increChanges() {
		this.counter++;
		this.first.push(this.changes.length);
	}

	public onRender() {
		if (this.current instanceof WFCNode && this.current.n < 0) {
			this.current.updateState();
		}
	}

	public state(): [Uint8Array, string, number, number, number] {
		const grid = this.grid;
		return [grid.padded, grid.characters, grid.MX, grid.MY, grid.MZ];
	}
}
