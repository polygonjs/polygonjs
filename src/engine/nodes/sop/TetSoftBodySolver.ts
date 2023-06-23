/**
 * Create a soft body solver
 *
 *
 */
import {Object3D} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PolyScene} from '../../scene/PolyScene';
import {CoreType, isArray} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CoreObject} from '../../../core/geometry/Object';
import {DEFAULT as DEFAULT_TESSELATION_PARAMS} from '../../../core/geometry/tet/utils/TesselationParamsConfig';
import {SoftBodyIdAttribute} from '../../../core/softBody/SoftBodyAttribute';
import {
	createOrFindSoftBodyController,
	softBodyControllerNodeIdFromObject,
} from '../../../core/softBody/SoftBodyControllerRegister';
import {TetSopNode} from './_BaseTet';
import {TetObject} from '../../../core/geometry/tet/TetObject';

class TetSoftBodySolverSopParamsConfig extends NodeParamsConfig {
	/** @param gravity */
	gravity = ParamConfig.VECTOR3([0.0, -9.8, 0.0]);
}
const ParamsConfig = new TetSoftBodySolverSopParamsConfig();

export class TetSoftBodySolverSopNode extends TetSopNode<TetSoftBodySolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.TET_SOFT_BODY_SOLVER {
		return SopType.TET_SOFT_BODY_SOLVER;
	}

	private _nextId = 0;
	private _tetObjectByThreejsObjectEphemeralId: Map<number, TetObject> = new Map();

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		// set to always clone, so that we reset the solver
		// by simply setting this node to dirty
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		// this.compilationController.compileIfRequired();
		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));

		// const solverObject = new Group();
		// solverObject.name = this.name();
		// solverObject.matrixAutoUpdate = false;
		// CoreObject.addAttribute(solverObject, SoftBodyIdAttribute.OBJECT, this.graphNodeId());
		// actor
		// const actorNode = this._findActorNode();
		// this.scene().actorsManager.assignActorBuilder(solverObject, actorNode);
		// add input objects as children
		const coreGroup = inputCoreGroups[0];
		const inputTetObjects = coreGroup.tetObjects();
		if (inputTetObjects) {
			const newThreejsObjects: Object3D[] = [];
			for (let tetObject of inputTetObjects) {
				const threejsObjectsFromTetObject = tetObject.toObject3D({
					...DEFAULT_TESSELATION_PARAMS,
					displayTetMesh: false,
					displayOuterMesh: true,
				});
				if (threejsObjectsFromTetObject) {
					const threejsObject = isArray(threejsObjectsFromTetObject)
						? threejsObjectsFromTetObject[0]
						: threejsObjectsFromTetObject;
					newThreejsObjects.push(threejsObject);
					CoreObject.addAttribute(threejsObject, SoftBodyIdAttribute.SOLVER_NODE, this.graphNodeId());
					const nextId = this._nextId++;
					CoreObject.addAttribute(threejsObject, SoftBodyIdAttribute.EPHEMERAL_ID, nextId);
					this._tetObjectByThreejsObjectEphemeralId.set(nextId, tetObject);
				}

				// solverObject.add(inputObject);
			}
			this.setObjects(newThreejsObjects);
		} else {
			this.states.error.set(`no tet objects found in input`);
			this.setObjects([]);
		}
	}
	traverseObjectOnSopGroupAdd(object: Object3D, parent: Object3D) {
		//
		const solverNodeId = CoreObject.attribValue(object, SoftBodyIdAttribute.SOLVER_NODE);
		if (solverNodeId != null) {
			if (solverNodeId != this.graphNodeId()) {
				return;
			}
			const ephemeralId = CoreObject.attribValue(object, SoftBodyIdAttribute.EPHEMERAL_ID) as number;
			if (ephemeralId == null) {
				console.error('no ephemeralId found on object', object);
			}
			const tetObject = this._tetObjectByThreejsObjectEphemeralId.get(ephemeralId);
			if (!tetObject) {
				console.error('no tetObject found from object', object);
				return;
			}
			createOrFindSoftBodyController(this.scene(), this, {
				tetObject,
				threejsObject: object,
			});
		}
	}
	// private _findActorNode() {
	// 	// if (isBooleanTrue(this.pv.useThisNode)) {
	// 	return this;
	// 	// } else {
	// 	// 	return this.pv.node.node() as ActorBuilderNode | undefined;
	// 	// }
	// }
}

export function getSoftBodyControllerNodeFromSolverObject(
	solverObject: Object3D,
	scene: PolyScene
): TetSoftBodySolverSopNode | undefined {
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
	if (node.type() != SopType.TET_SOFT_BODY_SOLVER) {
		return;
	}
	return node as TetSoftBodySolverSopNode;
}
