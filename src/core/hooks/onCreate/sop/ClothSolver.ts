import {JsConnectionPointType} from '../../../../engine/nodes/utils/io/connections/Js';
import {ClothSolverSopNode} from '../../../../engine/nodes/sop/ClothSolver';
import {ClothSolverStepSimulationOutput} from '../../../../engine/nodes/js/ClothSolverStepSimulation';
import {ActorSopNode} from '../../../../engine/nodes/sop/Actor';
import {stringTailDigits} from '../../../String';
import {GeoObjNode} from '../../../../engine/nodes/obj/Geo';
import {SopOnCreateHookRegister} from './_Base';
import {SopType} from '../../../../engine/poly/registers/nodes/types/Sop';
import {BaseMatNodeType} from '../../../../engine/nodes/mat/_Base';
import {MaterialsNetworkSopNode} from '../../../../engine/nodes/sop/MaterialsNetwork';

const ACTOR_NODE_BASE_NAME = 'actor_clothSolver';
const MAT_NAME = 'MAT';
const MESH_PHYSICAL_MAT_NAME = 'meshPhysical_CLOTH';

function _onCreatePrepareActorNode(node: ClothSolverSopNode) {
	function createActorNodeChildren(actorNode: ActorSopNode) {
		const onScenePause = actorNode.createNode('onScenePause');
		const onTick = actorNode.createNode('onTick');
		const clothSolverReset1 = actorNode.createNode('clothSolverReset');
		const softBodySolverStepSimulation1 = actorNode.createNode('clothSolverStepSimulation');
		const clothSolverUpdateMaterial1 = actorNode.createNode('clothSolverUpdateMaterial');

		clothSolverReset1.setInput(0, onScenePause);
		softBodySolverStepSimulation1.setInput(JsConnectionPointType.TRIGGER, onTick);
		const sharedInputs = [
			JsConnectionPointType.TRIGGER,
			ClothSolverStepSimulationOutput.TEXTURE_SIZE,
			ClothSolverStepSimulationOutput.TEXTURE_POSITION0,
			ClothSolverStepSimulationOutput.TEXTURE_POSITION1,
			ClothSolverStepSimulationOutput.TEXTURE_NORMAL,
		];
		for (const sharedInput of sharedInputs) {
			clothSolverUpdateMaterial1.setInput(sharedInput, softBodySolverStepSimulation1, sharedInput);
		}

		onScenePause.uiData.setPosition(-100, -100);
		clothSolverReset1.uiData.setPosition(100, -100);
		onTick.uiData.setPosition(-100, 100);
		softBodySolverStepSimulation1.uiData.setPosition(100, 100);
		clothSolverUpdateMaterial1.uiData.setPosition(300, 100);
	}
	function createActorNode(geoNode: GeoObjNode) {
		const actor1 = geoNode.createNode('actor');
		actor1.setName(`${ACTOR_NODE_BASE_NAME}${stringTailDigits(node.name())}`);

		const nodePos = node.uiData.position();
		actor1.uiData.setPosition(nodePos.x, nodePos.y - 200);

		createActorNodeChildren(actor1);

		return actor1;
	}

	const geoNode = node.parent() as GeoObjNode;
	const actor1: ActorSopNode = /*geoNode.nodesByType('actor')[0] ||*/ createActorNode(geoNode);

	return {actor1};
	// const pointsMat = MAT.node(particlesMatName) || createMat(MAT);
	// if (pointsMat) {
	// 	node.p.material.setNode(pointsMat, {relative: true});
	// }
}
function _createGlNodes(node: ClothSolverSopNode) {
	//
	const current_global = node.nodesByType('globals')[0];
	const current_output = node.nodesByType('output')[0];
	if (current_global || current_output) {
		return;
	}
	const globals1 = node.createNode('globals');
	const output1 = node.createNode('output');

	output1.setInput(0, globals1);

	globals1.uiData.setPosition(-200, 0);
	output1.uiData.setPosition(200, 0);

	return {globals1, output1};
}
function _createMat(node: ClothSolverSopNode) {
	const nodePos = node.uiData.position();
	const geoNode = node.parent() as GeoObjNode;
	const materialNode = geoNode.createNode('material');

	function createMatNetwork(geoNode: GeoObjNode) {
		const MAT = geoNode.createNode('materialsNetwork');
		MAT.setName(MAT_NAME);

		const nodePos = node.uiData.position();
		MAT.uiData.setPosition(nodePos.x - 200, nodePos.y);

		return MAT;
	}

	const MAT = geoNode.nodesByType('materialsNetwork')[0] || createMatNetwork(geoNode);

	function createMeshMaterial(MAT: MaterialsNetworkSopNode) {
		// ensure we don't link to a CopNetwork for instance
		const existingMatNodes = MAT.children().filter(
			(node: BaseMatNodeType) => node.name() == MESH_PHYSICAL_MAT_NAME
		);
		function _createMatBuilder() {
			const matBuilder = MAT.createNode('meshPhysicalBuilder');

			const globals = matBuilder.createNode('globals');
			const output1 = matBuilder.createNode('output');
			const clothSolverPosition1 = matBuilder.createNode('clothSolverPosition');
			const attribute1 = matBuilder.createNode('attribute');

			output1.setInput(0, clothSolverPosition1);
			clothSolverPosition1.setInput(0, attribute1);
			attribute1.setAttribSize(1);
			attribute1.p.name.set('id');

			globals.uiData.setPosition(-400, 0);
			output1.uiData.setPosition(400, 0);
			clothSolverPosition1.uiData.setPosition(100, 0);
			attribute1.uiData.setPosition(-100, 0);

			matBuilder.setName(MESH_PHYSICAL_MAT_NAME);
			return matBuilder;
		}
		const materialNode = existingMatNodes[0] || _createMatBuilder();

		return materialNode;
	}
	const matNode = MAT.node(MESH_PHYSICAL_MAT_NAME) || createMeshMaterial(MAT);

	materialNode.p.material.setNode(matNode, {relative: true});
	materialNode.setInput(0, node);
	materialNode.uiData.setPosition(nodePos.x, nodePos.y + 200);

	return {materialNode};
}

function onCreateHook(node: ClothSolverSopNode) {
	const geoNode = node.parent() as GeoObjNode;
	const nodePos = node.uiData.position();
	//
	const clothPrepare1 = geoNode.createNode('clothPrepare');
	clothPrepare1.uiData.setPosition(nodePos.x, nodePos.y - 400);

	const glNodes = _createGlNodes(node);
	const matNodes = _createMat(node);

	const {actor1} = _onCreatePrepareActorNode(node);
	actor1.setInput(0, clothPrepare1);
	node.setInput(0, actor1);

	return {actor1, clothPrepare1, matNodes, glNodes};
}

export class ClothSolverSopOnCreateRegister extends SopOnCreateHookRegister<SopType.CLOTH_SOLVER> {
	override type(): SopType.CLOTH_SOLVER {
		return SopType.CLOTH_SOLVER;
	}
	override onCreate(node: ClothSolverSopNode) {
		return onCreateHook(node);
	}
}
