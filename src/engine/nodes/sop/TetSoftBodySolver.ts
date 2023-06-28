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
import {SoftBodyIdAttribute, CoreSoftBodyAttribute} from '../../../core/softBody/SoftBodyAttribute';
import {
	createOrFindSoftBodyController,
	softBodyControllerNodeIdFromObject,
} from '../../../core/softBody/SoftBodyControllerRegister';
import {TetSopNode} from './_BaseTet';
import {TetEmbed} from '../../../core/softBody/Common';

class TetSoftBodySolverSopParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param gravity */
	gravity = ParamConfig.VECTOR3([0.0, -9.8, 0.0]);

	/** @param edgeCompliance */
	edgeCompliance = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param volumeCompliance */
	volumeCompliance = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	highresSkinning = ParamConfig.FOLDER();
	/** @param highRes Skinning Lookup Spacing */
	lookupSpacing = ParamConfig.FLOAT(0.05, {
		range: [0, 0.5],
		rangeLocked: [true, false],
	});
	/** @param highRes Skinning Lookup Padding */
	lookupPadding = ParamConfig.FLOAT(0.05, {
		range: [0, 0.5],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TetSoftBodySolverSopParamsConfig();

export class TetSoftBodySolverSopNode extends TetSopNode<TetSoftBodySolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.TET_SOFT_BODY_SOLVER {
		return SopType.TET_SOFT_BODY_SOLVER;
	}

	private _nextId = 0;
	private _tetEmbedByThreejsObjectEphemeralId: Map<number, TetEmbed> = new Map();

	static override displayedInputNames(): string[] {
		return ['tetrahedrons', 'high res geometry'];
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1, 2);
		// set to always clone, so that we reset the solver
		// by simply setting this node to dirty
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const inputTetObjects = inputCoreGroups[0].tetObjects();
		if (inputTetObjects) {
			const newThreejsObjects: Object3D[] = [];
			const inputHighResObjects = inputCoreGroups[1]?.threejsObjects();
			let i = 0;
			for (let tetObject of inputTetObjects) {
				const threejsObjectsFromTetObject = tetObject.toObject3D({
					...DEFAULT_TESSELATION_PARAMS,
					displayTetMesh: false,
					displayOuterMesh: true,
				});
				if (threejsObjectsFromTetObject) {
					const lowResObject = isArray(threejsObjectsFromTetObject)
						? threejsObjectsFromTetObject[0]
						: threejsObjectsFromTetObject;
					const highResObject = inputHighResObjects ? inputHighResObjects[i] : undefined;
					const displayedObject = highResObject ? highResObject : lowResObject;
					CoreObject.addAttribute(displayedObject, SoftBodyIdAttribute.SOLVER_NODE, this.graphNodeId());
					const nextId = this._nextId++;
					CoreObject.addAttribute(displayedObject, SoftBodyIdAttribute.EPHEMERAL_ID, nextId);
					CoreSoftBodyAttribute.setGravity(displayedObject, this.pv.gravity);
					// CoreSoftBodyAttribute.setSubSteps(threejsObject, this.pv.subSteps);
					CoreSoftBodyAttribute.setEdgeCompliance(displayedObject, this.pv.edgeCompliance);
					CoreSoftBodyAttribute.setVolumeCompliance(displayedObject, this.pv.volumeCompliance);
					CoreSoftBodyAttribute.setHighResSkinningLookupSpacing(displayedObject, this.pv.lookupSpacing);
					CoreSoftBodyAttribute.setHighResSkinningLookupPadding(displayedObject, this.pv.lookupPadding);

					const tetEmbed: TetEmbed = {
						tetObject,
						lowResObject,
						highResObject,
					};
					this._tetEmbedByThreejsObjectEphemeralId.set(nextId, tetEmbed);
					Poly.onObjectsAddedHooks.assignHookHandler(displayedObject, this);
					newThreejsObjects.push(displayedObject);
				}

				i++;
			}
			this.setObjects(newThreejsObjects);
		} else {
			this.states.error.set(`no tet objects found in input`);
			this.setObjects([]);
		}
	}
	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
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
			const tetEmbed = this._tetEmbedByThreejsObjectEphemeralId.get(ephemeralId);
			if (!tetEmbed) {
				console.error('no tetObject found from object', object);
				return;
			}
			createOrFindSoftBodyController(this.scene(), this, {
				tetEmbed,
				threejsObjectInSceneTree: object,
			});
		}
	}
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
