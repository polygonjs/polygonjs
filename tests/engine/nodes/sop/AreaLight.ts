import {Object3D, RectAreaLight} from 'three';
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
	const object = coreGroup?.threejsObjects()[0]!;
	return object;
}

QUnit.test('sop/areaLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const areaLight1 = geo1.createNode('areaLight');
	const transform1 = geo1.createNode('transform');

	areaLight1.p.showHelper.set(true);
	areaLight1.p.color.set([0.2, 0.4, 0.7]);
	areaLight1.p.color.options.setOption('conversion', ColorConversion.NONE);
	areaLight1.p.width.set(3);
	areaLight1.p.height.set(2);
	transform1.setInput(0, areaLight1);

	const object1 = await getObject(areaLight1);
	assert.equal(objectsCount(object1), 5);
	assert.deepEqual(objectNames(object1), [
		'AreaLightGroup_areaLight1',
		'areaLight1',
		'CoreRectAreaLightHelper_areaLight1',
		'CoreRectAreaLightHelperChildMesh_areaLight1',
		'CoreRectAreaLightHelperChildLine_areaLight1',
	]);
	assert.deepEqual((object1.children[0] as RectAreaLight).color.toArray(), [0.2, 0.4, 0.7]);
	assert.equal((object1.children[0] as RectAreaLight).width, 3);
	assert.deepEqual(object1.children[1].scale.toArray(), [3, 2, 1]);

	const object2 = await getObject(transform1);
	assert.equal(objectsCount(object2), 5);
	assert.deepEqual(objectNames(object2), [
		'AreaLightGroup_areaLight1',
		'areaLight1',
		'CoreRectAreaLightHelper_areaLight1',
		'CoreRectAreaLightHelperChildMesh_areaLight1',
		'CoreRectAreaLightHelperChildLine_areaLight1',
	]);
	assert.deepEqual((object2.children[0] as RectAreaLight).color.toArray(), [0.2, 0.4, 0.7]);
	assert.equal((object2.children[0] as RectAreaLight).width, 3);
	assert.deepEqual(object2.children[1].scale.toArray(), [3, 2, 1]);
});
