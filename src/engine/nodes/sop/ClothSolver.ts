/**
 * Create a cloth solver
 *
 *
 */
import {Object3D, WebGLRenderer} from 'three';
import {TypedActorSopNode} from './_BaseActor';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PolyScene} from '../../scene/PolyScene';
import {CoreType} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CoreObject} from '../../../core/geometry/Object';
import {ClothIdAttribute, ClothSolverAttribute} from '../../../core/cloth/ClothAttribute';
import {
	createOrFindClothController,
	clothControllerNodeIdFromObject,
} from '../../../core/cloth/ClothControllerRegister';
class ClothSolverSopParamsConfig extends NodeParamsConfig {
	/** @param steps */
	steps = ParamConfig.INTEGER(40, {
		range: [6, 50],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ClothSolverSopParamsConfig();

export class ClothSolverSopNode extends TypedActorSopNode<ClothSolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.CLOTH_SOLVER {
		return SopType.CLOTH_SOLVER;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		// set to always clone, so that we reset the solver
		// by simply setting this node to dirty
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		this.compilationController.compileIfRequired();
		//
		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));
		const coreGroup = inputCoreGroups[0];

		const objects: Object3D[] = coreGroup.threejsObjects();

		const actorNode = this._findActorNode();
		for (let object of objects) {
			CoreObject.addAttribute(object, ClothIdAttribute.OBJECT, this.graphNodeId());
			CoreObject.addAttribute(object, ClothSolverAttribute.STEPS_COUNT, this.pv.steps);
			this.scene().actorsManager.assignActorBuilder(object, actorNode);
		}

		this.setObjects(objects);
	}
	traverseObjectOnSopGroupAdd(object: Object3D) {
		//
		const clothSolverNodeId = CoreObject.attribValue(object, ClothIdAttribute.OBJECT);
		if (clothSolverNodeId != null) {
			if (clothSolverNodeId != this.graphNodeId()) {
				return;
			}
			const clothObject = object;
			const result = createOrFindClothController(clothObject);
			if (!result) {
				return;
			}
			const {controller} = result;

			this.scene()
				.renderersRegister.waitForRenderer()
				.then((renderer) => {
					if (!renderer) {
						console.warn('no renderer');
						return;
					}
					if (!(renderer instanceof WebGLRenderer)) {
						console.warn('not a WebGLRenderer');
						return;
					}
					controller.init(renderer);
				});
		}
	}

	private _findActorNode() {
		// if (isBooleanTrue(this.pv.useThisNode)) {
		return this;
		// } else {
		// 	return this.pv.node.node() as ActorBuilderNode | undefined;
		// }
	}
}

export function getClothControllerNodeFromWorldObject(
	clothObject: Object3D,
	scene: PolyScene
): ClothSolverSopNode | undefined {
	const nodeId = clothControllerNodeIdFromObject(clothObject);
	if (nodeId == null) {
		return;
	}
	const graphNode = scene.graph.nodeFromId(nodeId);
	if (!graphNode) {
		return;
	}
	const node: BaseNodeType | null = CoreType.isFunction((graphNode as BaseNodeType).context)
		? (graphNode as BaseNodeType)
		: null;
	if (!node) {
		return;
	}
	if (node.context() != NodeContext.SOP) {
		return;
	}
	if (node.type() != SopType.CLOTH_SOLVER) {
		return;
	}
	return node as ClothSolverSopNode;
}
