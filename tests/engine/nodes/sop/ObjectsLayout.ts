import {CoreObject} from './../../../../src/core/geometry/Object';
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
async function getAttributes(objectLayout1: ObjectsLayoutSopNode, attribName: string): Promise<number[]> {
	const container = await objectLayout1.compute();
	const computedObjects = container.coreContent()!.objects();
	return computedObjects.map((object) => CoreObject.attribValue(object, attribName) as number);
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

QUnit.test('sop/objectsLayout with attributes', async (assert) => {
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

	objectsLayout1.p.addAttribs.set(true);
	objectsLayout1.p.addRowAttrib.set(true);
	objectsLayout1.p.addRowWidthInner.set(true);
	objectsLayout1.p.addRowWidthOuter.set(true);

	assert.deepEqual(await getAttributes(objectsLayout1, 'row'), [0, 0, 0]);
	assert.deepEqual(await getAttributes(objectsLayout1, 'rowWidthInner'), [4.5, 4.5, 4.5]);
	assert.deepEqual(await getAttributes(objectsLayout1, 'rowWidthOuter'), [7, 7, 7]);

	objectsLayout1.p.maxLayoutWidth.set(3);
	assert.deepEqual(await getAttributes(objectsLayout1, 'row'), [0, 0, 1]);
	assert.deepEqual(await getAttributes(objectsLayout1, 'rowWidthInner'), [1.5, 1.5, 0]);
	assert.deepEqual(await getAttributes(objectsLayout1, 'rowWidthOuter'), [3, 3, 4]);
});
