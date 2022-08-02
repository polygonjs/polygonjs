import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {ObjectsLayoutSopNode} from '../../../../src/engine/nodes/sop/ObjectsLayout';

function createObject(geo1: GeoObjNode, x: number, y: number) {
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');

	transform1.setInput(0, box1);
	transform1.p.s.x.set(x);
	transform1.p.s.y.set(y);

	return transform1;
}

async function getPositions(objectLayout1: ObjectsLayoutSopNode) {
	const container = await objectLayout1.compute();
	const computedObjects = container.coreContent()!.objects();
	return computedObjects.map((object) => object.position.toArray());
}

QUnit.test('sop/objectsLayout simple', async (assert) => {
	const geo1 = window.geo1;

	const obj1 = createObject(geo1, 1, 1);
	const obj2 = createObject(geo1, 2, 1);
	const obj3 = createObject(geo1, 4, 1);
	const objects = [obj1, obj2, obj3];
	const merge1 = geo1.createNode('merge');
	for (let i = 0; i < objects.length; i++) {
		merge1.setInput(i, objects[i]);
	}

	const objectsLayout1 = geo1.createNode('objectsLayout');
	objectsLayout1.setInput(0, merge1);

	assert.deepEqual(await getPositions(objectsLayout1), [
		[-3, 0, 0],
		[-1.5, 0, 0],
		[1.5, 0, 0],
	]);

	objectsLayout1.p.maxLayoutWidth.set(3);
	assert.deepEqual(await getPositions(objectsLayout1), [
		[-1.5, 0.5, 0],
		[0, 0.5, 0],
		[0, -0.5, 0],
	]);
});
