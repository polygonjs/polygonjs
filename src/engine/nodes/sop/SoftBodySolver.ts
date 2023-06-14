/**
 * Create a soft body solver
 *
 *
 */
import {Object3D, Group} from 'three';
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
import {SoftBodyIdAttribute} from '../../../core/softBody/SoftBodyAttribute';
import {
	createOrFindSoftBodyController,
	softBodyControllerNodeIdFromObject,
} from '../../../core/softBody/SoftBodyControllerRegister';
import {TypedActorSopNode} from './_BaseActor';

class SoftBodySolverSopParamsConfig extends NodeParamsConfig {
	/** @param gravity */
	gravity = ParamConfig.VECTOR3([0.0, -9.8, 0.0]);
}
const ParamsConfig = new SoftBodySolverSopParamsConfig();

export class SoftBodySolverSopNode extends TypedActorSopNode<SoftBodySolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.SOFT_BODY_SOLVER {
		return SopType.SOFT_BODY_SOLVER;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		// set to always clone, so that we reset the solver
		// by simply setting this node to dirty
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		this.compilationController.compileIfRequired();
		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));

		const solverObject = new Group();
		solverObject.name = this.name();
		solverObject.matrixAutoUpdate = false;
		CoreObject.addAttribute(solverObject, SoftBodyIdAttribute.OBJECT, this.graphNodeId());
		// actor
		const actorNode = this._findActorNode();
		this.scene().actorsManager.assignActorBuilder(solverObject, actorNode);
		// add input objects as children
		const coreGroup = inputCoreGroups[0];
		const inputObjects = coreGroup.threejsObjects();
		for (let inputObject of inputObjects) {
			solverObject.add(inputObject);
		}

		this.setObject(solverObject);
	}
	traverseObjectOnSopGroupAdd(object: Object3D) {
		//
		const solverNodeId = CoreObject.attribValue(object, SoftBodyIdAttribute.OBJECT);
		if (solverNodeId != null) {
			if (solverNodeId != this.graphNodeId()) {
				return;
			}
			const solverObject = object;
			createOrFindSoftBodyController(this.scene(), this, solverObject);
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

export function getSoftBodyControllerNodeFromSolverObject(
	solverObject: Object3D,
	scene: PolyScene
): SoftBodySolverSopNode | undefined {
	const nodeId = softBodyControllerNodeIdFromObject(solverObject);
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
	if (node.type() != SopType.SOFT_BODY_SOLVER) {
		return;
	}
	return node as SoftBodySolverSopNode;
}
