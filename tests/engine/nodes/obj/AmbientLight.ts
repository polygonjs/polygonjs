import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodesobjAmbientLight(qUnit: QUnit) {
	qUnit.test('ambient light simple', async (assert) => {
		const scene = window.scene;
		window.scene.performance.start();

		const main_group = scene.threejsScene();
		assert.equal(main_group.name, '/');
		assert.equal(main_group.children.length, 2, 'world has 2 children');
		assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

		const ambient_light1 = scene.root().createNode('ambientLight');

		assert.equal(ambient_light1.name(), 'ambientLight1');
		assert.equal(main_group.children.length, 3);

		assert.equal(ambient_light1.cookController.cooksCount(), 0, 'cooks count should be 0');
		await CoreSleep.sleep(100);
		assert.equal(ambient_light1.cookController.cooksCount(), 1, 'cooks count should be 1');

		const ambient_light2 = scene.root().createNode('ambientLight');
		assert.equal(ambient_light2.name(), 'ambientLight2');
		assert.equal(main_group.children.length, 4);

		assert.equal(main_group.children[2].name, '/ambientLight1');
		assert.equal(main_group.children[3].name, '/ambientLight2');

		assert.equal(ambient_light1.graphAllSuccessors().length, 0);

		assert.equal(ambient_light1.cookController.cooksCount(), 1);
		const light_object1 = main_group.children[2];
		const light_from_light_object1 = light_object1.children[1];
		ambient_light1.p.intensity.set(2);
		await scene.waitForCooksCompleted();
		assert.equal(light_from_light_object1.uuid, ambient_light1.light.uuid);
		assert.equal(ambient_light1.light.intensity, 2, 'intensity should be 2');
		assert.equal(ambient_light1.cookController.cooksCount(), 2, 'cooks count should be 2');

		window.scene.performance.stop();
	});

	qUnit.test('ambient light display flag off removes from scene', async (assert) => {
		const scene = window.scene;
		const main_group = scene.threejsScene();
		assert.equal(main_group.name, '/');
		assert.equal(main_group.children.length, 2);
		assert.equal(
			main_group.children
				.map((c) => c.name)
				.sort()
				.join(':'),
			'/geo1:/perspectiveCamera1'
		);

		const ambient_light1 = scene.root().createNode('ambientLight');
		assert.equal(ambient_light1.name(), 'ambientLight1');
		assert.equal(main_group.children.length, 3);
		const ambient_light_object = main_group.children[2];
		assert.equal(ambient_light_object.uuid, ambient_light1.object.uuid);
		assert.equal(
			main_group.children
				.map((c) => c.name)
				.sort()
				.join(':'),
			'/ambientLight1:/geo1:/perspectiveCamera1'
		);
		assert.equal(ambient_light_object.children.length, 2);

		ambient_light1.flags.display.set(false);
		assert.equal(main_group.children.length, 3);
		assert.equal(
			main_group.children
				.map((c) => c.name)
				.sort()
				.join(':'),
			'/ambientLight1:/geo1:/perspectiveCamera1'
		);
		assert.equal(ambient_light_object.children.length, 1);

		ambient_light1.flags.display.set(true);
		assert.equal(ambient_light_object.children.length, 2);
	});

	qUnit.test('ambient light display flag off still cooks', async (assert) => {
		const scene = window.scene;
		const main_group = scene.threejsScene();
		assert.equal(main_group.name, '/');
		assert.equal(main_group.children.length, 2);
		assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

		const ambient_light1 = scene.root().createNode('ambientLight');
		assert.equal(ambient_light1.name(), 'ambientLight1');
		assert.equal(main_group.children.length, 3);

		await scene.waitForCooksCompleted();
		ambient_light1.flags.display.set(false);
		assert.equal(main_group.children.length, 3);

		window.scene.performance.start();

		assert.equal(ambient_light1.cookController.cooksCount(), 0);
		ambient_light1.p.intensity.set(2);
		await scene.waitForCooksCompleted();
		assert.equal(ambient_light1.light.intensity, 2, 'intensity is updated');
		assert.equal(ambient_light1.cookController.cooksCount(), 1, 'has cooked');

		window.scene.performance.stop();
	});

	qUnit.test('ambient light is removed from scene when node is deleted', async (assert) => {
		const scene = window.scene;
		const main_group = scene.threejsScene();
		assert.equal(main_group.name, '/');
		assert.equal(main_group.children.length, 2);
		assert.equal(
			main_group.children
				.map((c) => c.name)
				.sort()
				.join(':'),
			'/geo1:/perspectiveCamera1'
		);

		const ambient_light1 = scene.root().createNode('ambientLight');
		assert.equal(ambient_light1.name(), 'ambientLight1');
		assert.equal(main_group.children.length, 3);
		assert.equal(
			main_group.children
				.map((c) => c.name)
				.sort()
				.join(':'),
			'/ambientLight1:/geo1:/perspectiveCamera1'
		);

		scene.root().removeNode(ambient_light1);
		assert.equal(main_group.children.length, 2);
		assert.equal(
			main_group.children
				.map((c) => c.name)
				.sort()
				.join(':'),
			'/geo1:/perspectiveCamera1'
		);
	});

	qUnit.test('ambient light cooks only once when multiple params are updated', async (assert) => {
		const scene = window.scene;
		const main_group = scene.threejsScene();
		assert.equal(main_group.name, '/');
		assert.equal(main_group.children.length, 2);
		assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());
		window.scene.performance.start();

		const ambient_light1 = scene.root().createNode('ambientLight');
		assert.equal(ambient_light1.name(), 'ambientLight1');
		assert.equal(main_group.children.length, 3);

		assert.equal(ambient_light1.cookController.cooksCount(), 0);
		await CoreSleep.sleep(100);
		assert.equal(ambient_light1.cookController.cooksCount(), 1);

		const ambient_light_group = main_group.children[2];
		const light_object = ambient_light1.light;
		scene.batchUpdates(() => {
			ambient_light1.p.intensity.set(2);
			ambient_light1.p.color.set([2, 1, 3]);
		});
		await ambient_light1.compute();
		assert.equal(light_object.uuid, ambient_light_group.children[1].uuid);
		assert.equal(light_object.intensity, 2, 'intensity should be 2');
		assert.in_delta(light_object.color.r, 2, 1, 'color should be 2,1,3');
		assert.in_delta(light_object.color.g, 1, 1, 'color should be 2,1,3');
		assert.in_delta(light_object.color.b, 3, 1, 'color should be 2,1,3');
		assert.equal(ambient_light1.cookController.cooksCount(), 2, 'cooks count should be 2');

		window.scene.performance.stop();
	});
}
