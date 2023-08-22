/**
 * Creates a markov solver.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Interpreter} from '../../../core/mjr/Interpreter';
import {Object3D, BoxGeometry} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {arrayUniq} from '../../../core/ArrayUtils';
// import {BASIC} from '../../../core/mjr/models/basic';
// import {BASIC_DJIKSTRA_DUNGEON} from '../../../core/mjr/models/basicDjikstraDungeon';
import {BASIC_DIJKSTRA_DUNGEON_DEBUG} from '../../../core/mjr/models/basicDijkstraDungeonDebug';

class MarkovSolverSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.VECTOR3([5, 5, 5]);
	/** @param seed */
	seed = ParamConfig.INTEGER(0, {
		range: [-10000, 10000],
		rangeLocked: [false, false],
	});
	/** @param steps */
	steps = ParamConfig.INTEGER(100, {
		range: [0, 10000],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new MarkovSolverSopParamsConfig();

export class MarkovSolverSopNode extends TypedSopNode<MarkovSolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'markovSolver';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	// public nodes: NodeStateInfo[] = [];
	// protected _seed: number = 0;
	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		// const elem = document.createElement('div');
		// elem.innerHTML = BASIC_DJIKSTRA_DUNGEON;
		// const child = elem.children[0];
		// console.log(child);
		const parser = new DOMParser();
		const doc = parser.parseFromString(BASIC_DIJKSTRA_DUNGEON_DEBUG, 'text/xml');
		const elem = doc.documentElement;
		console.log(elem);
		const interpreter = await Interpreter.load(elem, this.pv.size.x, this.pv.size.y, this.pv.size.z);
		if (!interpreter) {
			this.setCoreGroup(coreGroup);
			return;
		}
		// runInAction(() => {
		// 	this.nodes = NodeState.traverse(interpreter) || [];
		// 	console.log('runInAction', this.nodes);
		// 	for (const {state} of this.nodes) state.sync();

		// 	// this.renderer.palette = customPalette;

		// 	// const qs = new URLSearchParams(location.search);
		// 	// const qsSeed = parseInt(qs.get("seed"));

		// 	// this._seed = this.pv.seed;
		// });

		// this.renderer.setCharacters(chars);
		// this.renderer.update(FX, FY, FZ);
		// this.renderer.render(state);

		const steps = this.pv.steps;
		const runner = interpreter.run(this.pv.seed, steps);
		let result = runner.next();
		for (let i = 0; i < steps; i++) {
			result = runner.next();
		}
		// for (const {state} of this.nodes) state.sync();
		const [state, chars, FX, FY, FZ] = interpreter.state();
		console.log(state, chars, FX, FY, FZ, result);
		const newObjects: Object3D[] = [];
		const mult = 1;
		const geometry = new BoxGeometry(mult, mult, mult, 2, 2, 2);
		for (let x = 0; x < FX; x++) {
			for (let y = 0; y < FY; y++) {
				for (let z = 0; z < FZ; z++) {
					const index = x + y * FX + z * FX * FY;
					const value = state[index];
					if (value) {
						const object = this.createObject(geometry, ObjectType.MESH);
						object.position.set(x * mult, y * mult, z * mult);
						newObjects.push(object);
					}
				}
			}
		}
		const uniqueValues = arrayUniq([...state] as number[]);
		console.log(uniqueValues);

		this.setObjects(newObjects);
	}
	// private _paused = false;
	// private _loop(once = false, render = true) {
	// 	if (!once && this._paused) return;

	// 	const start = performance.now();

	// 	if (!this._curr) this._curr = this.ip?.run(this._seed, this._steps);
	// 	if (!this._curr) return;

	// 	let result = this._curr.next();
	// 	let dt = this.lastLoop ? start - this.lastLoop : 0;
	// 	this.ip.time += this.scaleTime(dt);

	// 	if (!once && this._speed > 0 && dt <= 20) {
	// 		for (let i = 0; i < this._speed; i++) {
	// 			result = this._curr.next();

	// 			dt = performance.now() - start;
	// 			this.ip.time += this.scaleTime(dt);
	// 			// Cap per frame execution to 20ms/50fps
	// 			if (dt > 20) break;
	// 		}
	// 	}

	// 	const end = performance.now();
	// 	this._timer += end - start;
	// 	this.lastLoop = end;

	// 	if (result.done) {
	// 		this._curr = null;

	// 		const [state, chars, FX, FY, FZ] = this.ip.state();

	// 		this.ip.onRender();

	// 		if (FZ > 1) {
	// 			const colors = chars.split('').map((c) => this.palette.get(c));

	// 			this.output = {
	// 				name: `${this.name}_${this._seed}.vox`,
	// 				buffer: VoxHelper.serialize(state, FX, FY, FZ, colors),
	// 			};
	// 		}

	// 		console.log(`Time: ${this._timer.toFixed(2)}ms`);
	// 	} else {
	// 		if (!once) {
	// 			this._delay ? setTimeout(() => this.loop(), this._delay) : setImmediate(() => this.loop());
	// 		}

	// 		if (render) {
	// 			const [state, chars, FX, FY, FZ] = result.value;

	// 			this.ip.onRender();
	// 			// TODO: pass state to listener?
	// 		}
	// 	}
	// }
}
