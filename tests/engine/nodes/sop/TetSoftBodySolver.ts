import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {stringTailDigits} from '../../../../src/core/String';
import type {ActorSopNode} from '../../../../src/engine/nodes/sop/Actor';
import type {TetSoftBodySolverSopNode} from '../../../../src/engine/nodes/sop/TetSoftBodySolver';
import type {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {SoftBodyVariable} from '../../../../src/engine/nodes/js/code/assemblers/softBody/SoftBodyAssembler';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Mesh, Vector3} from 'three';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

const ACTOR_NODE_BASE_NAME = 'actor_softBody';

async function tetsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	const objects = coreGroup.tetObjects()!;
	const object = objects[0];
	const geometry = object.geometry;
	return geometry.tetsCount();
}

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
	}
	function createActorNode(geoNode: GeoObjNode) {
		const actor1 = geoNode.createNode('actor');
		actor1.setName(`${ACTOR_NODE_BASE_NAME}${stringTailDigits(node.name())}`);

		const nodePos = node.uiData.position();
		actor1.uiData.setPosition(nodePos.x, nodePos.y + 200);

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

	const {actor1} = _onCreatePrepareActorNode(node);
	actor1.setInput(0, node);

	return {actor1, output1};
}

const _v = new Vector3();
QUnit.test('sop/tetSoftBodySolver low res only', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);
	scene.root().createNode('hemisphereLight');

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const tetrahedralize1 = geo1.createNode('tetrahedralize');
	const tetSoftBodySolver1 = geo1.createNode('tetSoftBodySolver');

	const createdNode = onCreateHook(tetSoftBodySolver1);
	assert.ok(createdNode, 'createdNode');
	const {actor1} = createdNode!;

	tetSoftBodySolver1.setInput(0, tetrahedralize1);
	tetrahedralize1.setInput(0, transform1);
	transform1.setInput(0, box1);

	transform1.p.t.set([0, 2, 0]);
	transform1.p.r.set([45, 0, 0]);

	actor1.flags.display.set(true);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	assert.equal(await tetsCount(tetrahedralize1), 28, 'tets count');

	async function getGeometryBoundingBoxY() {
		const geometry = object.geometry;
		geometry.computeBoundingBox();
		const box = geometry.boundingBox!;
		return box.getCenter(_v).y;
	}

	assert.in_delta(await getGeometryBoundingBoxY(), 2, 0.1, 'object is at the top');

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(2000);
		assert.in_delta(await getGeometryBoundingBoxY(), 0.5, 0.2, 'object has fallen');
	});
});

QUnit.test('sop/tetSoftBodySolver low res only with SDFSphere', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(10);
	cameraNode.p.t.y.set(4);
	cameraNode.p.t.x.set(10);
	cameraNode.p.r.y.set(45);
	scene.root().createNode('hemisphereLight');

	const geo2 = scene.root().createNode('geo');
	geo2.createNode('planeHelper');

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const tetrahedralize1 = geo1.createNode('tetrahedralize');
	const tetSoftBodySolver1 = geo1.createNode('tetSoftBodySolver');

	const createdNode = onCreateHook(tetSoftBodySolver1);
	assert.ok(createdNode, 'createdNode');
	const {actor1, output1} = createdNode!;

	const SDFSphere1 = tetSoftBodySolver1.createNode('SDFSphere');
	output1.setInput(SoftBodyVariable.COLLISION_SDF, SDFSphere1);

	tetSoftBodySolver1.setInput(0, tetrahedralize1);
	tetrahedralize1.setInput(0, transform1);
	transform1.setInput(0, box1);

	transform1.p.t.set([0, 2, 0.5]);
	transform1.p.r.set([45, 0, 0]);

	actor1.flags.display.set(true);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	assert.equal(await tetsCount(tetrahedralize1), 28, 'tets count');

	async function getGeometryBoundingBoxY() {
		const geometry = object.geometry;
		geometry.computeBoundingBox();
		const box = geometry.boundingBox!;
		const y = box.getCenter(_v).y;
		return y;
	}

	assert.in_delta(await getGeometryBoundingBoxY(), 2, 0.1, 'object is at the top');

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(3000);
		assert.in_delta(await getGeometryBoundingBoxY(), -6, 3, 'object has fallen');
	});
});

QUnit.test('sop/tetSoftBodySolver high res', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);
	scene.root().createNode('hemisphereLight');

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const tetrahedralize1 = geo1.createNode('tetrahedralize');
	const tetEmbed1 = geo1.createNode('tetEmbed');
	const tetSoftBodySolver1 = geo1.createNode('tetSoftBodySolver');
	const sphere1 = geo1.createNode('sphere');

	const createdNode = onCreateHook(tetSoftBodySolver1);
	assert.ok(createdNode, 'createdNode');
	const {actor1} = createdNode!;

	transform1.setInput(0, box1);
	transform2.setInput(0, sphere1);
	tetrahedralize1.setInput(0, transform1);
	tetEmbed1.setInput(0, tetrahedralize1);
	tetEmbed1.setInput(1, transform2);
	tetSoftBodySolver1.setInput(0, tetEmbed1);

	sphere1.p.radius.set(0.5);
	for (let transform of [transform1, transform2]) {
		transform.p.t.set([0, 2, 0]);
		transform.p.r.set([45, 0, 0]);
	}
	tetEmbed1.p.padding.set(0.16);

	actor1.flags.display.set(true);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	assert.equal(await tetsCount(tetrahedralize1), 28, 'tets count');

	async function getGeometryBoundingBoxY() {
		const geometry = object.geometry;
		geometry.computeBoundingBox();
		const box = geometry.boundingBox!;
		return box.getCenter(_v).y;
	}

	assert.in_delta(await getGeometryBoundingBoxY(), 2, 0.1, 'object is at the top');

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(2000);
		assert.in_delta(await getGeometryBoundingBoxY(), 0.5, 0.2, 'object has fallen');
	});
});
