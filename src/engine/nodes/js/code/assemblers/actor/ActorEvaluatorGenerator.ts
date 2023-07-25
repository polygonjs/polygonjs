import {EvaluatorEventData, ActorEvaluator, EvaluatorMethodName} from './ActorEvaluator';
import {CoreObjectType, ObjectContent} from '../../../../../../core/geometry/ObjectContent';
import {getObjectMethodNames} from '../../../../../../core/ObjectUtils';

type GeneratorFunction = (object: ObjectContent<CoreObjectType>) => ActorEvaluator;
type EvaluatorCallback = (evaluator: ActorEvaluator) => void;

const evaluatorGeneratorByObject: WeakMap<ObjectContent<CoreObjectType>, Set<ActorEvaluatorGenerator>> = new WeakMap();
function registerGeneratorForObject(object: ObjectContent<CoreObjectType>, generator: ActorEvaluatorGenerator) {
	let set = evaluatorGeneratorByObject.get(object);
	if (!set) {
		set = new Set();
		evaluatorGeneratorByObject.set(object, set);
	}
	set.add(generator);
}
function deregisterGeneratorForObject(object: ObjectContent<CoreObjectType>, generator: ActorEvaluatorGenerator) {
	let set = evaluatorGeneratorByObject.get(object);
	if (!set) {
		return;
	}
	set.delete(generator);
}
export function deregisterGeneratorsForObject(object: ObjectContent<CoreObjectType>) {
	let set = evaluatorGeneratorByObject.get(object);
	if (!set) {
		return;
	}
	set.forEach((evaluatorGenerator) => {
		evaluatorGenerator.disposeEvaluator(object);
	});

	evaluatorGeneratorByObject.delete(object);
}
export function generatorsForObject(object: ObjectContent<CoreObjectType>) {
	return evaluatorGeneratorByObject.get(object);
}

const NOT_STORABLE_METHOD_NAMES = new Set([
	'constructor',
	'onDispose',
	'dispose',
	'__defineGetter__',
	'__defineSetter__',
	'hasOwnProperty',
	'__lookupGetter__',
	'__lookupSetter__',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'toString',
	'valueOf',
	'toLocaleString',
]);

export class ActorEvaluatorGenerator {
	// the possible method names are not only EvaluatorMethodName,
	// but can be any string, such as "onManualTrigger1"
	private _expectedEvaluatorMethodNames: Set<string> = new Set();
	constructor(private _func: GeneratorFunction) {}
	private _evaluatorByObject: Map<ObjectContent<CoreObjectType>, ActorEvaluator> = new Map();
	eventDatas?: Set<EvaluatorEventData>;
	private _createEvaluator(object: ObjectContent<CoreObjectType>) {
		return this._func(object);
	}
	setExpectedEvaluatorMethodNames(dummyEvaluator: ActorEvaluator) {
		this._expectedEvaluatorMethodNames.clear();
		const methodNames = getObjectMethodNames(dummyEvaluator);
		for (const methodName of methodNames) {
			if ((dummyEvaluator as any)[methodName] && !NOT_STORABLE_METHOD_NAMES.has(methodName)) {
				this._expectedEvaluatorMethodNames.add(methodName);
			}
		}
	}
	hasExpectedEvaluatorMethodName(methodName: EvaluatorMethodName): boolean {
		return this._expectedEvaluatorMethodNames.has(methodName);
	}
	size(): number {
		return this._evaluatorByObject.size;
	}
	disposeEvaluator(object: ObjectContent<CoreObjectType>) {
		const evaluator = this._evaluatorByObject.get(object);
		if (!evaluator) {
			return;
		}
		evaluator.dispose();
		this._evaluatorByObject.delete(object);
	}
	findOrCreateEvaluator(object: ObjectContent<CoreObjectType>) {
		let evaluator = this._evaluatorByObject.get(object);
		if (!evaluator) {
			evaluator = this._createEvaluator(object);
			this._evaluatorByObject.set(object, evaluator);
			registerGeneratorForObject(object, this);
		}
		return evaluator;
	}
	traverseEvaluator(callback: EvaluatorCallback) {
		this._evaluatorByObject.forEach(callback);
	}
	clearObjects() {
		this._evaluatorByObject.forEach((evaluator, object) => {
			evaluator.dispose();
			deregisterGeneratorForObject(object, this);
		});

		this._evaluatorByObject.clear();
	}
}
