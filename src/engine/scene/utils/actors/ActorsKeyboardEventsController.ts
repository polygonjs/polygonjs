import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';
import {ActorEvaluatorGenerator} from '../../../nodes/js/code/assemblers/actor/ActorEvaluatorGenerator';
import {EvaluatorKeyboardMethod} from '../../../nodes/js/code/assemblers/actor/ActorEvaluator';
import {addToSetAtEntry} from '../../../../core/MapUtils';

export class ActorKeyboardEventsController {
	protected _scene: PolyScene;
	private _triggeredEvaluatorGeneratorsByMethodName: Map<EvaluatorKeyboardMethod, Set<ActorEvaluatorGenerator>> =
		new Map();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	addTriggeredEvaluators(evaluatorGenerators: Set<ActorEvaluatorGenerator>, methodName: EvaluatorKeyboardMethod) {
		evaluatorGenerators.forEach((evaluatorGenerator) => {
			addToSetAtEntry(this._triggeredEvaluatorGeneratorsByMethodName, methodName, evaluatorGenerator);
		});
	}
	runTriggers() {
		this._triggeredEvaluatorGeneratorsByMethodName.forEach((evaluatorGenerators, methodName) => {
			evaluatorGenerators.forEach((evaluatorGenerator) => {
				evaluatorGenerator.traverseEvaluator((evaluator) => {
					if (evaluator[methodName]) {
						evaluator[methodName]!();
					}
				});
			});
		});

		this._triggeredEvaluatorGeneratorsByMethodName.clear();
	}
}
