import {Object3D, SpotLight} from 'three';
import {ColorConversion} from '../../../../src/core/Color';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

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
	const object = coreGroup?.objects()[0]!;
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
		'SpotLight_spotLight1',
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
		'SpotLight_spotLight1',
		'VolumetricSpotLight_spotLight1',
		'SpotLightDefaultTarget_spotLight1',
		'CoreSpotLightHelper_spotLight1',
		'CoreSpotLightHelperCone_spotLight1',
	]);
	assert.deepEqual((object2.children[0] as SpotLight).color.toArray(), [0.2, 0.4, 0.7]);
});
