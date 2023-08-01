import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from './../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {createPhysicsWorldNodes} from './physics/PhysicsHelper';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
export function testenginenodessopPhysicsWorld(qUnit: QUnit) {
	qUnit.test('sop/physicsWorld simple', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const plane1 = geo1.createNode('plane');
		const box1 = geo1.createNode('box');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		copy1.setInput(0, box1);
		copy1.setInput(1, plane1);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		box1.p.size.set(0.25);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		for (let object of objects) {
			assert.in_delta(object.position.y, 0, 0.01);
		}
		await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
			scene.play();
			await CoreSleep.sleep(500);
			for (let object of objects) {
				assert.less_than(object.position.y, -0.1);
			}
		});
	});

	qUnit.test('sop/physicsWorld with actor/setPhysicsWorldGravity', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const plane1 = geo1.createNode('plane');
		const box1 = geo1.createNode('box');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		const setPhysicsWorldGravity1 = physicsWorld1.createNode('setPhysicsWorldGravity');
		const onManualTrigger1 = physicsWorld1.createNode('onManualTrigger');
		setPhysicsWorldGravity1.setInput(0, onManualTrigger1);

		copy1.setInput(0, box1);
		copy1.setInput(1, plane1);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		box1.p.size.set(0.25);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		for (let object of objects) {
			assert.in_delta(object.position.y, 0, 0.01);
		}
		await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
			scene.play();
			await CoreSleep.sleep(500);
			for (let object of objects) {
				assert.less_than(object.position.y, -0.1);
			}

			setPhysicsWorldGravity1.p.gravity.set([0, 100, 0]);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(1000);
			for (let object of objects) {
				assert.more_than(object.position.y, 0);
			}
		});
	});

	qUnit.test('sop/physicsWorld can be cloned', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const box1 = geo1.createNode('box');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');
		const null1 = geo1.createNode('null');

		physicsRBDAttributes1.setInput(0, box1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		null1.setInput(0, physicsWorld1);
		createPhysicsWorldNodes(physicsWorld1);
		null1.flags.display.set(true);

		const container = await null1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		assert.equal(objects.length, 1);
		const object = objects[0];

		await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
			scene.play();
			await CoreSleep.sleep(200);
			assert.less_than(object.position.y, -0.1);
			assert.more_than(object.position.y, -1);

			await CoreSleep.sleep(1000);
			assert.less_than(object.position.y, -1.0);
		});
	});

	qUnit.test('sop/physicsWorld persisted config is saved after scene play', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const physicsWorld1 = geo1.createNode('physicsWorld');
		physicsWorld1.setInput(0, box1);
		physicsWorld1.flags.display.set(true);

		createPhysicsWorldNodes(physicsWorld1);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			await CoreSleep.sleep(100);

			const data = await new SceneJsonExporter(scene).data();
			assert.ok(data);
			const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
			assert.deepEqual(functionNodeNames, [physicsWorld1.path()], 'actor is saved');
		});
		RendererUtils.dispose();
	});
	qUnit.test('sop/physicsWorld persisted config is saved without requiring scene play', async (assert) => {
		const scene = window.scene;
		// const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const physicsWorld1 = geo1.createNode('physicsWorld');
		physicsWorld1.setInput(0, box1);
		physicsWorld1.flags.display.set(true);

		createPhysicsWorldNodes(physicsWorld1);

		const data = await new SceneJsonExporter(scene).data();
		assert.ok(data);
		const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
		assert.deepEqual(functionNodeNames, [physicsWorld1.path()], 'actor is saved');
	});
}
