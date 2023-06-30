import {Object3D, SpotLight} from 'three';
import {ColorConversion} from '../../../../src/core/Color';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

function objectsCount(object: Object3D, countStart: number = 0) {
	countStart += 1;
	for (let child of object.children) {
		countStart += objectsCount(child);
	}
	return countStart;
}
function objectNames(object: Object3D, names: string[] = []) {
	names.push(object.name);
	for (let child of object.children) {
		objectNames(child, names);
	}
	return names;
}
async function getObject(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent();
	const object = coreGroup?.threejsObjects()[0]!;
	return object;
}

QUnit.test('sop/spotLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const spotLight1 = geo1.createNode('spotLight');
	const transform1 = geo1.createNode('transform');

	spotLight1.p.showHelper.set(true);
	spotLight1.p.tvolumetric.set(true);
	spotLight1.p.color.set([0.2, 0.4, 0.7]);
	spotLight1.p.color.options.setOption('conversion', ColorConversion.NONE);
	transform1.setInput(0, spotLight1);

	const object1 = await getObject(spotLight1);
	assert.equal(objectsCount(object1), 6);
	assert.deepEqual(objectNames(object1), [
		'SpotLightContainer_spotLight1',
		'spotLight1',
		'VolumetricSpotLight_spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);
	assert.deepEqual((object1.children[0] as SpotLight).color.toArray(), [0.2, 0.4, 0.7]);

	const object2 = await getObject(transform1);
	assert.equal(objectsCount(object2), 6);
	assert.deepEqual(objectNames(object2), [
		'SpotLightContainer_spotLight1',
		'spotLight1',
		'VolumetricSpotLight_spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);
	assert.deepEqual((object2.children[0] as SpotLight).color.toArray(), [0.2, 0.4, 0.7]);
});

QUnit.test('sop/spotLight name change is maintained', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const spotLight1 = geo1.createNode('spotLight');
	const transform1 = geo1.createNode('transform');
	const objectProperties1 = geo1.createNode('objectProperties');
	const transform2 = geo1.createNode('transform');

	transform1.setInput(0, spotLight1);
	objectProperties1.setInput(0, transform1);
	transform2.setInput(0, objectProperties1);

	objectProperties1.p.tname.set(true);
	objectProperties1.p.name.set('myLight');

	const object1 = await getObject(transform2);
	assert.equal(objectsCount(object1), 3);
	assert.deepEqual(objectNames(object1), ['myLight', 'spotLight1', 'SpotLightDefaultTarget_spotLight1']);

	spotLight1.p.showHelper.set(true);
	const object2 = await getObject(transform2);
	assert.equal(objectsCount(object2), 5);
	assert.deepEqual(objectNames(object2), [
		'myLight',
		'spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);

	spotLight1.p.tvolumetric.set(true);
	const object3 = await getObject(transform2);
	assert.equal(objectsCount(object3), 6);
	assert.deepEqual(objectNames(object3), [
		'myLight',
		'spotLight1',
		'VolumetricSpotLight_spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);
});

QUnit.test('sop/spotLight maintain map over cloning', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const image1 = window.COP.createNode('image');
	image1.p.url.set(`${ASSETS_ROOT}/textures/uv.webp`);

	const spotLight1 = geo1.createNode('spotLight');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const transform3 = geo1.createNode('transform');

	transform1.setInput(0, spotLight1);
	transform2.setInput(0, transform1);
	transform3.setInput(0, transform2);

	spotLight1.p.tmap.set(true);
	spotLight1.p.map.setNode(image1);

	async function spotLightMap() {
		const container = await transform3.compute();
		const coreGroup = container.coreContent();
		const object = coreGroup?.threejsObjects()[0]!;
		return (object.children[0] as SpotLight).map;
	}

	assert.ok(await spotLightMap(), 'map is set on spotLight');
	assert.equal((await spotLightMap())!.uuid, image1.__textureSync__()!.uuid, 'map is the same');

	// remove map
	spotLight1.p.tmap.set(false);
	assert.notOk(await spotLightMap(), 'map is removed');

	// remove map
	spotLight1.p.tmap.set(true);
	assert.ok(await spotLightMap(), 'map is re-added');
});
