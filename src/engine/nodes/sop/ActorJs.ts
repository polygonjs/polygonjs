/**
 * Assigns actor nodes to input objects
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseJsNodeType} from '../js/_Base';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerActor} from '../js/code/assemblers/actor/ActorAssembler';
import {Poly} from '../../Poly';
import {ActorEvaluator} from '../js/code/assemblers/actor/Evaluator';
import {isBooleanTrue} from '../../../core/Type';
import {CorePath} from '../../../core/geometry/CorePath';
import {ActorBuilderNode} from '../../scene/utils/ActorsManager';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ActorEvaluatorGenerator} from '../js/code/assemblers/actor/EvaluatorGenerator';
class ActorJsSopParamsConfig extends NodeParamsConfig {
	/** @param select which objects this applies the actor behavior to */
	objectsMask = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param build actor from child nodes */
	useThisNode = ParamConfig.BOOLEAN(1);
	/** @param actor node */
	node = ParamConfig.NODE_PATH('', {
		visibleIf: {useThisNode: 0},
		nodeSelection: {
			types: [NetworkNodeType.ACTOR],
		},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new ActorJsSopParamsConfig();

export class ActorJsSopNode extends TypedSopNode<ActorJsSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ACTOR_JS;
	}

	//
	// ASSEMBLERS
	//
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_ACTOR> {
		return AssemblerName.JS_ACTOR;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerActor> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	//
	// INIT
	//
	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	//
	// CHILDREN
	//
	protected override _childrenControllerContext = NodeContext.JS;
	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseJsNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		return true;
	}

	//
	//
	//

	override cook(inputCoreGroups: CoreGroup[]) {
		// compile
		this.compileIfRequired();

		//
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.threejsObjects();
		// if (this._evaluator) {
		// 	const inputObjects = coreGroup.threejsObjects();
		// 	for (let inputObject of inputObjects) {
		// 		if (this._evaluator.onTick) {
		// 			this._evaluator.onTick({Object3D: inputObject});
		// 		}
		// 	}
		// }
		const actorNode = this._findActorNode();
		if (actorNode) {
			const objectsMask = this.pv.objectsMask.trim();
			if (objectsMask == '') {
				for (let object of objects) {
					this.scene().actorsManager.assignActorBuilder(object, actorNode);
				}
			} else {
				for (let object of objects) {
					const children = CorePath.objectsByMaskInObject(objectsMask, object);
					for (let child of children) {
						this.scene().actorsManager.assignActorBuilder(child, actorNode);
					}
				}
			}
		}

		this.setCoreGroup(coreGroup);
	}
	private _findActorNode() {
		if (isBooleanTrue(this.pv.useThisNode)) {
			return this;
		} else {
			return this.pv.node.node() as ActorBuilderNode | undefined;
		}
	}
	async compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			await this.compile();
		}
	}

	private _evaluatorGenerator = new ActorEvaluatorGenerator((object) => new ActorEvaluator(this.scene(), object));
	evaluatorGenerator() {
		return this._evaluatorGenerator;
	}
	setEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.scene().actorsManager.unregisterEvaluatorGenerator(this._evaluatorGenerator);
		this._evaluatorGenerator.dispose();
		this._evaluatorGenerator = evaluatorGenerator;
		this.scene().actorsManager.registerEvaluatorGenerator(evaluatorGenerator);
	}
	async compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}

		// main compilation
		assemblerController.assembler.updateEvaluator();
	}
}
