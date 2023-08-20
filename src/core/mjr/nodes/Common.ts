import type {Interpreter} from '../Interpreter';
import type {Grid} from '../Grid';
import type {Node} from './Node';

export enum RunState {
	SUCCESS = 0,
	FAIL = 1,
	HALT = 2,
}

export interface NodeOptions<T extends Node> {
	source: Element & {lineNumber: number; columnNumber: number};
	comment: string | null;
	sync: boolean;
	ip: Interpreter;
	grid: Grid;
	// found in Markov
	child?: T;
}
