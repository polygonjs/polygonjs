import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from './../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {createPhysicsWorldNodes, createPhysicsDebugNodes} from './physics/PhysicsHelper';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
export function testenginenodessopPhysicsDebug(qUnit: QUnit) {
	qUnit.test('sop/physicsDebug persisted config is saved after scene play', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const physicsWorld1 = geo1.createNode('physicsWorld');
		const physicsDebug1 = geo1.createNode('physicsDebug');
		physicsWorld1.setInput(0, box1);
		physicsDebug1.setInput(0, physicsWorld1);
		physicsDebug1.flags.display.set(true);

		createPhysicsWorldNodes(physicsWorld1);
		createPhysicsDebugNodes(physicsDebug1);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			await CoreSleep.sleep(100);

			const data = await new SceneJsonExporter(scene).data();
			assert.ok(data);
			const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
			assert.deepEqual(functionNodeNames, [physicsWorld1.path(), physicsDebug1.path()], 'actor is saved');
		});
		RendererUtils.dispose();
	});
	qUnit.test('sop/physicsDebug persisted config is saved without requiring scene play', async (assert) => {
		const scene = window.scene;
		// const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const physicsWorld1 = geo1.createNode('physicsWorld');
		const physicsDebug1 = geo1.createNode('physicsDebug');
		physicsWorld1.setInput(0, box1);
		physicsDebug1.setInput(0, physicsWorld1);
		physicsDebug1.flags.display.set(true);

		createPhysicsWorldNodes(physicsWorld1);
		createPhysicsDebugNodes(physicsDebug1);

		const data = await new SceneJsonExporter(scene).data();
		assert.ok(data);
		const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
		assert.deepEqual(functionNodeNames, [physicsWorld1.path(), physicsDebug1.path()], 'actor is saved');
	});
}
