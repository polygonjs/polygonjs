import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';
import {ActorEvaluatorGenerator} from '../../../nodes/js/code/assemblers/actor/EvaluatorGenerator';
import {EvaluatorPointerMethod} from '../../../nodes/js/code/assemblers/actor/Evaluator';
import {MapUtils} from '../../../../core/MapUtils';

export class ActorPointerEventsController {
	protected _scene: PolyScene;
	private _triggeredEvaluatorGeneratorsByMethodName: Map<EvaluatorPointerMethod, Set<ActorEvaluatorGenerator>> =
		new Map();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	addTriggeredEvaluators(evaluatorGenerators: Set<ActorEvaluatorGenerator>, methodName: EvaluatorPointerMethod) {
		evaluatorGenerators.forEach((evaluatorGenerator) => {
			MapUtils.addToSetAtEntry(this._triggeredEvaluatorGeneratorsByMethodName, methodName, evaluatorGenerator);
		});
	}
	runTriggers() {
		this._triggeredEvaluatorGeneratorsByMethodName.forEach((evaluatorGenerators, methodName) => {
			evaluatorGenerators.forEach((evaluatorGenerator) => {
				evaluatorGenerator.traverseEvaluator((evaluator) => {
					if ((evaluator as any)[methodName]) {
						(evaluator as any)[methodName]!();
					}
				});
			});
		});

		this._triggeredEvaluatorGeneratorsByMethodName.clear();
	}
}
