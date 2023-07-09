import {SoftBodyVariable} from '../../../../src/engine/nodes/js/code/assemblers/softBody/SoftBodyAssembler';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Mesh, Vector3} from 'three';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {TetSoftBodySolverSopOnCreateRegister} from '../../../../src/core/hooks/onCreate/sop/TetSoftBodySolver';

async function tetsCount(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	const objects = coreGroup.tetObjects()!;
	const object = objects[0];
	const geometry = object.geometry;
	return geometry.tetsCount();
}

const _v = new Vector3();

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

	const hookController = new TetSoftBodySolverSopOnCreateRegister();
	const createdNode = hookController.onCreate(tetSoftBodySolver1);
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

	const hookController = new TetSoftBodySolverSopOnCreateRegister();
	const createdNode = hookController.onCreate(tetSoftBodySolver1);
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
