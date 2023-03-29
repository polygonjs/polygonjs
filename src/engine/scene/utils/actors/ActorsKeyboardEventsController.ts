// import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';
import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';

import type {OnKeydownJsNode} from '../../../nodes/js/OnKeydown';
import type {OnKeypressJsNode} from '../../../nodes/js/OnKeypress';
import type {OnKeyupJsNode} from '../../../nodes/js/OnKeyup';
import {ActorEvaluatorGenerator} from '../../../nodes/js/code/assemblers/actor/EvaluatorGenerator';
import {EvaluatorKeyboardMethod} from '../../../nodes/js/code/assemblers/actor/Evaluator';
import {MapUtils} from '../../../../core/MapUtils';
export type KeyboardEventActorNode = OnKeypressJsNode | OnKeydownJsNode | OnKeyupJsNode;

export class ActorKeyboardEventsController {
	protected _scene: PolyScene;
	private _triggeredEvaluatorGeneratorsByMethodName: Map<EvaluatorKeyboardMethod, Set<ActorEvaluatorGenerator>> =
		new Map();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	addTriggeredEvaluators(evaluatorGenerators: Set<ActorEvaluatorGenerator>, methodName: EvaluatorKeyboardMethod) {
		evaluatorGenerators.forEach((evaluatorGenerator) => {
			MapUtils.addToSetAtEntry(this._triggeredEvaluatorGeneratorsByMethodName, methodName, evaluatorGenerator);
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
