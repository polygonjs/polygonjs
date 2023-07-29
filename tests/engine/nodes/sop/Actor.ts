import type {QUnit} from '../../../helpers/QUnit';
import {OnTickJsNodeOuput} from '../../../../src/engine/nodes/js/OnTick';
import {Mesh, Object3D} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
// import {ActorSopNode} from '../../../../src/engine/nodes/sop/Actor';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {ActorBuilderNode} from '../../../../src/engine/scene/utils/ActorsManager';
export function testenginenodessopActor(qUnit: QUnit) {

function createBasicActorNodes(actor1: ActorBuilderNode) {
	const onTick1 = actor1.createNode('onTick');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const floatToVec3_1 = actor1.createNode('floatToVec3');
	const sin1 = actor1.createNode('sin');

	sin1.setInput(0, onTick1, OnTickJsNodeOuput.TIME);
	floatToVec3_1.setInput('y', sin1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setObjectPosition1.setInput('position', floatToVec3_1);

	return {onTick1, setObjectPosition1, floatToVec3_1, sin1};
}

qUnit.test('sop/actor with objectsMask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const hierarchy1 = geo1.createNode('hierarchy');
	const hierarchy2 = geo1.createNode('hierarchy');
	const actor1 = geo1.createNode('actor');

	hierarchy1.setInput(0, box1);
	hierarchy1.setInput(1, box2);
	hierarchy2.setInput(0, hierarchy1);
	hierarchy2.setInput(1, box3);
	actor1.setInput(0, hierarchy2);

	const actorsManager = window.scene.actorsManager;
	async function _objectNamesWithActor() {
		const container = await actor1.compute();
		const coreGroup = container.coreContent()!;
		const objects = coreGroup.threejsObjects();
		const names: string[] = [];

		for (let object of objects) {
			object.traverse((child: Object3D) => {
				if (actorsManager.objectActorNodeIds(child)?.includes(actor1.graphNodeId())) {
					names.push(child.name);
				}
			});
		}
		return names;
	}

	assert.deepEqual(await _objectNamesWithActor(), ['box3']);

	actor1.p.objectsMask.set('*box2');
	assert.deepEqual(await _objectNamesWithActor(), ['box2']);
});

qUnit.test('sop/actor removing children resets the evaluator', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	// create children
	createBasicActorNodes(actor1);
	const children = [...actor1.children()];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(200);
		assert.more_than(object.position.y, 0.1, 'object moved up');

		scene.batchUpdates(() => {
			for (let child of children) {
				actor1.removeNode(child);
			}
		});
		assert.equal(actor1.children().length, 0);
		await CoreSleep.sleep(100);
		const currentPos = object.position.y;
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, currentPos, 'object is not moving anymore');
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, currentPos, 'object is not moving anymore');
	});
});

qUnit.test('sop/actor persisted_config', async (assert) => {
	const scene = window.scene;
	const perspective_camera1_1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	// create children
	const {floatToVec3_1} = createBasicActorNodes(actor1);
	const param1 = actor1.createNode('param');
	param1.setJsType(JsConnectionPointType.FLOAT);
	param1.p.name.set('mult');
	floatToVec3_1.setInput('x', param1);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);
	const multParam1 = actor1.params.get('mult')! as FloatParam;
	assert.ok(multParam1);
	assert.equal(multParam1.type(), ParamType.FLOAT);
	multParam1.set(3);

	const container = await actor1.compute();
	container.coreContent()!.threejsObjects()[0] as Mesh;

	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(actor1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const perspective_camera2 = scene2.node(perspective_camera1_1.path()) as PerspectiveCameraObjNode;
		const actor2 = scene2.node(actor1.path()) as ActorBuilderNode;

		const multParam2 = actor2.params.get('mult')! as FloatParam;
		assert.ok(multParam2);
		assert.equal(multParam2.type(), ParamType.FLOAT);
		assert.equal(multParam2.value, 3);

		const container = await actor2.compute();
		const object2 = container.coreContent()!.threejsObjects()[0] as Mesh;

		await RendererUtils.withViewer({cameraNode: perspective_camera2}, async (args) => {
			assert.equal(object2.position.x, 0);
			assert.equal(object2.position.y, 0);
			scene2.play();
			assert.equal(scene2.time(), 0);
			await CoreSleep.sleep(200);
			assert.equal(object2.position.x, 3);
			assert.more_than(object2.position.y, 0.1, 'object moved up');

			multParam2.set(6);
			await CoreSleep.sleep(200);
			assert.equal(object2.position.x, 6);
		});
	});

	RendererUtils.dispose();
});

qUnit.test('sop/actor using actorsNetwork', async (assert) => {
	const scene = window.scene;
	const perspective_camera1_1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	const ANIM = scene.createNode('animationsNetwork');
	const AUDIO = scene.createNode('audioNetwork');
	const EVENTS = scene.createNode('eventsNetwork');
	const COP = scene.createNode('copNetwork');
	const MAT = scene.createNode('materialsNetwork');
	const POST = scene.createNode('postProcessNetwork');
	const ROP = scene.createNode('renderersNetwork');
	const ACTORS_NETWORKS = [
		geo1.createNode('actorsNetwork'),
		ANIM.createNode('actorsNetwork'),
		AUDIO.createNode('actorsNetwork'),
		COP.createNode('actorsNetwork'),
		EVENTS.createNode('actorsNetwork'),
		MAT.createNode('actorsNetwork'),
		scene.createNode('actorsNetwork'),
		POST.createNode('actorsNetwork'),
		ROP.createNode('actorsNetwork'),
	];

	for (let actorsNetwork1 of ACTORS_NETWORKS) {
		actor1.p.useThisNode.set(0);
		actor1.p.node.setNode(actorsNetwork1);

		actor1.setInput(0, box1);
		actor1.flags.display.set(true);

		// create children
		const {floatToVec3_1} = createBasicActorNodes(actorsNetwork1);
		const param1 = actorsNetwork1.createNode('param');
		param1.setJsType(JsConnectionPointType.FLOAT);
		param1.p.name.set('mult');
		floatToVec3_1.setInput('x', param1);

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);
		const multParam1 = actorsNetwork1.params.get('mult')! as FloatParam;
		assert.ok(multParam1);
		assert.equal(multParam1.type(), ParamType.FLOAT);
		multParam1.set(3);

		const container = await actor1.compute();
		container.coreContent()!.threejsObjects()[0] as Mesh;

		const data = await new SceneJsonExporter(scene).data();
		await AssemblersUtils.withUnregisteredAssembler(actor1.usedAssembler(), async () => {
			const scene2 = await SceneJsonImporter.loadData(data);
			await scene2.waitForCooksCompleted();
			const perspective_camera2 = scene2.node(perspective_camera1_1.path()) as PerspectiveCameraObjNode;
			const actor2 = scene2.node(actor1.path()) as ActorBuilderNode;
			const actorsNetwork2 = scene2.node(actorsNetwork1.path()) as ActorBuilderNode;

			const multParam2 = actorsNetwork2.params.get('mult')! as FloatParam;
			assert.ok(multParam2);
			assert.equal(multParam2.type(), ParamType.FLOAT);
			assert.equal(multParam2.value, 3);

			const container = await actor2.compute();
			const object2 = container.coreContent()!.threejsObjects()[0] as Mesh;

			await RendererUtils.withViewer({cameraNode: perspective_camera2}, async (args) => {
				assert.equal(object2.position.x, 0);
				assert.equal(object2.position.y, 0);
				scene2.play();
				assert.equal(scene2.time(), 0);
				await CoreSleep.sleep(200);
				assert.equal(object2.position.x, 3);
				assert.more_than(object2.position.y, 0.1, 'object moved up');

				multParam2.set(6);
				await CoreSleep.sleep(200);
				assert.equal(object2.position.x, 6);
			});
		});
	}

	RendererUtils.dispose();
});

qUnit.test('sop/actor removes unused objects', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');
	const null1 = geo1.createNode('null');

	actor1.setInput(0, box1);
	null1.setInput(0, actor1);
	null1.flags.display.set(true);

	const onObjectClick1 = actor1.createNode('onObjectClick');
	const setObjectPosition = actor1.createNode('setObjectPosition');
	setObjectPosition.setInput(0, onObjectClick1);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(100);

		assert.equal(actor1.compilationController.evaluatorGenerator().size(), 1);

		null1.setDirty();
		await CoreSleep.sleep(100);
		assert.equal(actor1.compilationController.evaluatorGenerator().size(), 1);
	});
	RendererUtils.dispose();
});

}