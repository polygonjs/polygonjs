import {Object3D} from 'three';
import {EvaluatorEventData, ActorEvaluator} from './Evaluator';

type GeneratorFunction = (object3D: Object3D) => ActorEvaluator;
type EvaluatorCallback = (evaluator: ActorEvaluator) => void;

export class ActorEvaluatorGenerator {
	constructor(private _func: GeneratorFunction) {}
	private _evaluatorByObject: Map<Object3D, ActorEvaluator> = new Map();
	eventDatas?: Set<EvaluatorEventData>;
	private _createEvaluator(object3D: Object3D) {
		return this._func(object3D);
	}
	findOrCreateEvaluator(object3D: Object3D) {
		let evaluator = this._evaluatorByObject.get(object3D);
		if (!evaluator) {
			evaluator = this._createEvaluator(object3D);
			this._evaluatorByObject.set(object3D, evaluator);
		}
		return evaluator;
	}
	traverseEvaluator(callback: EvaluatorCallback) {
		this._evaluatorByObject.forEach(callback);
	}
	dispose() {
		this._evaluatorByObject.clear();
	}
}
