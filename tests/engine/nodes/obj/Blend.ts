import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesobjBlend(qUnit: QUnit) {

qUnit.test('blend obj simple', async (assert) => {
	const scene = window.scene;
	const root = window.root;

	const geo1 = window.geo1;
	const geo2 = root.createNode('geo');
	const geo3 = root.createNode('geo');
	geo1.p.t.x.set(1);
	geo2.p.t.y.set(1);
	geo3.p.t.z.set(5);

	await scene.waitForCooksCompleted();

	// move camera so that blend node is in the frustum
	// and its .onBeforeRender is called
	window.perspective_camera1.p.t.z.set(100);
	window.perspective_camera1.p.far.set(1000);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (viewer) => {
		scene.threejsScene().updateMatrixWorld(true);

		const blend1 = root.createNode('blend');
		blend1.dirtyController.addPostDirtyHook('a', (triggerNode) => {
			// console.log('triggered by', (triggerNode as any).path());
		});

		blend1.p.object0.setNode(geo1);
		blend1.p.object1.setNode(geo2);
		blend1.p.blend.set(0.5);
		await scene.waitForCooksCompleted();
		assert.deepEqual(blend1.object.position.toArray(), [0.5, 0.5, 0]);

		blend1.p.blend.set(0);
		await scene.waitForCooksCompleted();
		assert.deepEqual(blend1.object.position.toArray(), [1, 0, 0]);

		blend1.p.blend.set(1);
		await scene.waitForCooksCompleted();
		assert.deepEqual(blend1.object.position.toArray(), [0, 1, 0]);

		blend1.p.object0.set(geo3.path());
		blend1.p.blend.set(0);
		await scene.waitForCooksCompleted();
		assert.deepEqual(blend1.object.position.toArray(), [0, 0, 5]);

		// move obj0
		blend1.p.blend.set(0.5);
		assert.deepEqual(blend1.object.position.toArray(), [0, 0, 5]);
		geo3.p.t.y.set(2);
		await CoreSleep.sleep(50);
		assert.deepEqual(blend1.object.position.toArray(), [0, 1.5, 2.5]);

		// add parent to obj0
		geo3.setInput(0, geo2);
		await CoreSleep.sleep(50);
		assert.deepEqual(blend1.object.position.toArray(), [0, 2, 2.5]);

		// move parent
		geo2.p.t.set([-10, -20, 40]);
		await CoreSleep.sleep(50);
		// TODO: investigate why blend cook is still triggered here, when it should not,
		// as it should not depend on geo2
		assert.deepEqual(blend1.object.position.toArray(), [-10, -19, 42.5]);

		// toggle updateOnRender off
		blend1.p.updateOnRender.set(0);
		await CoreSleep.sleep(50);
		geo2.p.t.set([-1, -2, 4]);
		await CoreSleep.sleep(50);
		assert.deepEqual(blend1.object.position.toArray(), [-1, -1, 6.5]);

		// update blend param
		blend1.p.blend.set(0.8);
		await CoreSleep.sleep(50);
		assert.deepEqual(blend1.object.position.toArray(), [-1, -1.6, 5]);

		// move obj0

		// toggle updateOnRender back on
		blend1.p.updateOnRender.set(1);
	});
});

}