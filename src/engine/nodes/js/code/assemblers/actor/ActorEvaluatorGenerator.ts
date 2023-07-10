import {EvaluatorEventData, ActorEvaluator} from './ActorEvaluator';
import {CoreObjectType, ObjectContent} from '../../../../../../core/geometry/ObjectContent';

type GeneratorFunction = (object: ObjectContent<CoreObjectType>) => ActorEvaluator;
type EvaluatorCallback = (evaluator: ActorEvaluator) => void;

export class ActorEvaluatorGenerator {
	constructor(private _func: GeneratorFunction) {}
	private _evaluatorByObject: Map<ObjectContent<CoreObjectType>, ActorEvaluator> = new Map();
	eventDatas?: Set<EvaluatorEventData>;
	private _createEvaluator(object: ObjectContent<CoreObjectType>) {
		return this._func(object);
	}
	size(): number {
		return this._evaluatorByObject.size;
	}
	deleteEvaluator(object: ObjectContent<CoreObjectType>) {
		this._evaluatorByObject.delete(object);
	}
	findOrCreateEvaluator(object: ObjectContent<CoreObjectType>) {
		let evaluator = this._evaluatorByObject.get(object);
		if (!evaluator) {
			evaluator = this._createEvaluator(object);
			this._evaluatorByObject.set(object, evaluator);
		}
		return evaluator;
	}
	traverseEvaluator(callback: EvaluatorCallback) {
		this._evaluatorByObject.forEach(callback);
	}
	clearObjects() {
		this._evaluatorByObject.forEach((evaluator) => {
			evaluator.dispose();
		});

		this._evaluatorByObject.clear();
	}
}
