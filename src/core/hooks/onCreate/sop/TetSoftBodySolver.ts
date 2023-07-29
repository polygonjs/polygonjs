import type {TetSoftBodySolverSopNode} from '../../../../engine/nodes/sop/TetSoftBodySolver';
import type {ActorSopNode} from '../../../../engine/nodes/sop/Actor';
import type {GeoObjNode} from '../../../../engine/nodes/obj/Geo';
import {SopOnCreateHookRegister} from './_Base';
import {SopType} from '../../../../engine/poly/registers/nodes/types/Sop';
import {JsConnectionPointType} from '../../../../engine/nodes/utils/io/connections/Js';
import {stringTailDigits} from '../../../String';
import {SoftBodyVariable} from '../../../../engine/nodes/js/code/assemblers/softBody/SoftBodyAssembler';

const ACTOR_NODE_BASE_NAME = 'actor_softBody';

function _onCreatePrepareActorNode(node: TetSoftBodySolverSopNode) {
	function createActorNodeChildren(actorNode: ActorSopNode) {
		// const particlesSystemReset = actorNode.createNode('particlesSystemReset');
		// const onScenePause = actorNode.createNode('onScenePause');
		const softBodySolverStepSimulation1 = actorNode.createNode('softBodySolverStepSimulation');
		const onTick = actorNode.createNode('onTick');

		// particlesSystemReset.setInput(0, onScenePause);
		softBodySolverStepSimulation1.setInput(JsConnectionPointType.TRIGGER, onTick);

		// onScenePause.uiData.setPosition(-100, -100);
		// particlesSystemReset.uiData.setPosition(100, -100);
		onTick.uiData.setPosition(-100, 100);
		softBodySolverStepSimulation1.uiData.setPosition(100, 100);

		return {onTick};
	}
	function createActorNode(geoNode: GeoObjNode) {
		const actor1 = geoNode.createNode('actor');
		actor1.setName(`${ACTOR_NODE_BASE_NAME}${stringTailDigits(node.name())}`);

		const nodePos = node.uiData.position();
		actor1.uiData.setPosition(nodePos.x, nodePos.y + 200);

		const {onTick} = createActorNodeChildren(actor1);

		return {actor1, onTick};
	}

	const geoNode = node.parent() as GeoObjNode;
	const {actor1, onTick} = createActorNode(geoNode);

	return {actor1, onTick};
	// const pointsMat = MAT.node(particlesMatName) || createMat(MAT);
	// if (pointsMat) {
	// 	node.p.material.setNode(pointsMat, {relative: true});
	// }
}

function onCreateHook(node: TetSoftBodySolverSopNode) {
	const current_global = node.nodesByType('globals')[0];
	const current_output = node.nodesByType('output')[0];
	if (current_global || current_output) {
		return;
	}
	const globals = node.createNode('globals');
	const output1 = node.createNode('output');

	const computeVelocity1 = node.createNode('computeVelocity');
	const SDFPlane1 = node.createNode('SDFPlane');
	const constant1 = node.createNode('constant');

	constant1.setName('constant_GRAVITY');
	constant1.setJsType(JsConnectionPointType.VECTOR3);
	constant1.p.vector3.set([0, -9.8, 0]);

	output1.setInput(SoftBodyVariable.V, computeVelocity1);
	output1.setInput(SoftBodyVariable.COLLISION_SDF, SDFPlane1);
	computeVelocity1.setInput(computeVelocity1.p.forces.name(), constant1);
	computeVelocity1.setInput(computeVelocity1.p.velocity.name(), globals, SoftBodyVariable.V);
	computeVelocity1.setInput(computeVelocity1.p.delta.name(), globals, SoftBodyVariable.DELTA);

	globals.uiData.setPosition(-200, 0);
	output1.uiData.setPosition(200, 0);
	constant1.uiData.setPosition(-200, -200);
	computeVelocity1.uiData.setPosition(0, 0);
	SDFPlane1.uiData.setPosition(0, 200);

	const {actor1, onTick} = _onCreatePrepareActorNode(node);
	actor1.setInput(0, node);

	return {actor1, onTick, globals, output1};
}

export class TetSoftBodySolverSopOnCreateRegister extends SopOnCreateHookRegister<SopType.TET_SOFT_BODY_SOLVER> {
	override type(): SopType.TET_SOFT_BODY_SOLVER {
		return SopType.TET_SOFT_BODY_SOLVER;
	}
	override onCreate(node: TetSoftBodySolverSopNode) {
		return onCreateHook(node);
	}
}
