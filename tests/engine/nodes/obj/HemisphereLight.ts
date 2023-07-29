import type {QUnit} from '../../../helpers/QUnit';
// import {Color} from 'three';
export function testenginenodesobjHemisphereLight(qUnit: QUnit) {

qUnit.test('obj/hemisphereLight simple', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const hemisphere_light1 = scene.root().createNode('hemisphereLight');
	assert.equal(hemisphere_light1.name(), 'hemisphereLight1');
	assert.equal(main_group.children.length, 3);

	assert.deepEqual(hemisphere_light1.p.skyColor.valuePreConversionSerialized(), [1, 1, 1], '1');
	assert.deepEqual(hemisphere_light1.p.groundColor.valuePreConversionSerialized(), [0, 0, 0], '0');

	hemisphere_light1.p.skyColor.set([0.2, 0.7, 1]);
	hemisphere_light1.p.groundColor.set([0.1, 0.1, 0.25]);
	assert.deepEqual(hemisphere_light1.p.skyColor.valuePreConversionSerialized(), [0.2, 0.7, 1], '0.2');
	assert.deepEqual(hemisphere_light1.p.groundColor.valuePreConversionSerialized(), [0.1, 0.1, 0.25], '0.1');
	// const tmp = new Color();
	// tmp.copy(hemisphere_light1.p.skyColor.valuePreConversion());
	// tmp.convertSRGBToLinear();
	// assert.deepEqual(hemisphere_light1.pv.skyColor.toArray(), tmp.toArray());
	// tmp.copy(hemisphere_light1.p.groundColor.valuePreConversion());
	// tmp.convertSRGBToLinear();
	// assert.deepEqual(hemisphere_light1.pv.groundColor.toArray(), tmp.toArray());

	const hemisphere_light2 = scene.root().createNode('hemisphereLight');
	assert.equal(hemisphere_light2.name(), 'hemisphereLight2');
	assert.equal(main_group.children.length, 4);

	assert.equal(main_group.children[2].name, '/hemisphereLight1');
	assert.equal(main_group.children[3].name, '/hemisphereLight2');

	assert.equal(hemisphere_light1.graphAllSuccessors().length, 0);

	window.scene.performance.start();

	assert.equal(hemisphere_light1.cookController.cooksCount(), 0);
	const light_object1 = main_group.children[2];
	const light_from_light_object1 = light_object1.children[1];
	hemisphere_light1.p.intensity.set(2);
	await scene.waitForCooksCompleted();
	assert.equal(light_from_light_object1.uuid, hemisphere_light1.light.uuid);
	assert.equal(hemisphere_light1.light.intensity, 2, 'intensity should be 2');
	assert.equal(hemisphere_light1.cookController.cooksCount(), 2, 'cooks count should be 2');

	window.scene.performance.stop();
});

qUnit.test('hemisphere light params update as expected', async (assert) => {
	const scene = window.scene;
	const root = scene.root();
	const hemisphere_light = root.createNode('hemisphereLight');
	assert.equal(hemisphere_light.light.color.r, 1);
	hemisphere_light.p.skyColor.r.set(0.5);
	await scene.waitForCooksCompleted();
	assert.in_delta(hemisphere_light.light.color.r, 0.5, 0.05);
});

}