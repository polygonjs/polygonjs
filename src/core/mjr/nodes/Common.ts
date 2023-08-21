// import type {Interpreter} from '../Interpreter';
// import type {Grid} from '../Grid';
import type {Node} from './Node';

export type AvailableName =
	| 'one'
	| 'all'
	| 'prl'
	| 'and'
	| 'scope'
	| 'markov'
	| 'sequence'
	| 'path'
	| 'map'
	| 'convolution'
	| 'convchain'
	| 'wfc';
export const AVAILABLE_NAMES: AvailableName[] = [
	'one',
	'all',
	'prl',
	'and',
	'scope',
	'markov',
	'sequence',
	'path',
	'map',
	'convolution',
	'convchain',
	'wfc',
];

export const VALID_TAGS: Set<string> = new Set(AVAILABLE_NAMES);

export const EXT: {[tag: string]: () => Node} = {};
// public static registerExt(name: string, type: NodeConstructor) {
// 	if (this.VALID_TAGS.has(name)) throw new Error(`Tag <${name}> already exists`);
// 	this.VALID_TAGS.add(name);
// 	this.EXT[name] = () => new type();
// }

// public static isValidTag(tag: string) {
// 	return this.VALID_TAGS.has(tag);
// }

export enum RunState {
	SUCCESS = 0,
	FAIL = 1,
	HALT = 2,
}
export type NodeOptionsElement = Element & {lineNumber: number; columnNumber: number};

// export interface NodeOptions<T extends Node> {
// 	source: NodeOptionsElement;
// 	comment: string | null;
// 	sync: boolean;
// 	ip: Interpreter;
// 	grid: Grid;
// 	// found in Markov
// 	child?: T;
// }

export const OPTIMIZATION_INLINE_LIMIT = 128;

export type NodeSourceElement = Element;
