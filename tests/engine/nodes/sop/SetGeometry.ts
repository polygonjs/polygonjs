import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {ObjectType} from '../../../../src/core/geometry/Constant';
import {SetGeometryMode} from '../../../../src/engine/operations/sop/SetGeometry';
export function testenginenodessopSetGeometry(qUnit: QUnit) {

qUnit.test('sop/setGeometry simple with mode one geo per object', async (assert) => {
	const geo1 = window.geo1;

	const emptyObject1 = geo1.createNode('emptyObject');
	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const switch1 = geo1.createNode('switch');
	const emptyObject2 = geo1.createNode('emptyObject');
	const setGeometry1 = geo1.createNode('setGeometry');

	emptyObject1.setObjectType(ObjectType.MESH);
	emptyObject2.setObjectType(ObjectType.MESH);
	switch1.setInput(0, box1);
	switch1.setInput(1, sphere1);
	switch1.setInput(2, emptyObject2);
	switch1.p.input.set(2);
	setGeometry1.setInput(0, emptyObject1);
	setGeometry1.setInput(1, switch1);
	setGeometry1.setMode(SetGeometryMode.ONE_GEO_PER_OBJECT);

	async function pointsCount() {
		const container = await setGeometry1.compute();

		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const firstObject = objects[0];
		if (!firstObject) {
			return 0;
		}
		if (!firstObject.geometry) {
			return 0;
		}
		return firstObject.geometry.getAttribute('position')?.count || 0;
	}

	assert.equal(await pointsCount(), 0);
	switch1.p.input.set(1);
	assert.equal(await pointsCount(), 961);
	switch1.p.input.set(0);
	assert.equal(await pointsCount(), 24);
});
qUnit.test('sop/setGeometry simple with mode first geo to each object', async (assert) => {
	const geo1 = window.geo1;

	const emptyObject1 = geo1.createNode('emptyObject');
	const line1 = geo1.createNode('line');
	const copy1 = geo1.createNode('copy');
	const setGeometry1 = geo1.createNode('setGeometry');
	const sphere1 = geo1.createNode('sphere');

	emptyObject1.setObjectType(ObjectType.MESH);
	copy1.setInput(0, emptyObject1);
	copy1.setInput(1, line1);
	setGeometry1.setInput(0, copy1);
	setGeometry1.setInput(1, sphere1);
	setGeometry1.setMode(SetGeometryMode.FIRST_GEO_TO_EACH_OBJECT);
	line1.p.pointsCount.set(3);

	const container = await setGeometry1.compute();

	const objects = container.coreContent()!.threejsObjectsWithGeo();
	assert.equal(objects.length, 3);
	assert.equal((objects[0] as Mesh).geometry.uuid, (objects[1] as Mesh).geometry.uuid);
	assert.equal((objects[0] as Mesh).geometry.uuid, (objects[2] as Mesh).geometry.uuid);
});

}