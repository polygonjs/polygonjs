import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {WFCSolver} from './WFCSolver';
import {WFCBuilder} from './WFCBuilder';

let _nextId = 0;
const SOLVER_ID_KEY = '__wfcSolverId__';
const BUILDER_ID_KEY = '__wfcBuilderId__';
const WFCSolverById = new Map<number, WFCSolver>();
const WFCBuilderById = new Map<number, WFCBuilder>();

export function registerWFCSolver(solver: WFCSolver, object: ObjectContent<CoreObjectType>) {
	const id = _nextId++;
	WFCSolverById.set(id, solver);
	object.userData[SOLVER_ID_KEY] = id;
}
export function getWFCSolver(object: ObjectContent<CoreObjectType>) {
	const id = object.userData[SOLVER_ID_KEY];
	if (id != null) {
		return WFCSolverById.get(id);
	}
}
export function registerWFCBuilder(solver: WFCBuilder, object: ObjectContent<CoreObjectType>) {
	const id = _nextId++;
	WFCBuilderById.set(id, solver);
	object.userData[BUILDER_ID_KEY] = id;
}
export function getWFCBuilder(object: ObjectContent<CoreObjectType>) {
	const id = object.userData[BUILDER_ID_KEY];
	if (id != null) {
		return WFCBuilderById.get(id);
	}
}
