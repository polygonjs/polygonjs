// import {Vector2} from 'three';
// import {CorePoint} from '../../../../src/core/geometry/Point';
// import {AttribCreateSopNode} from './../../../../src/engine/nodes/sop/AttribCreate';
QUnit.test('sop/curveFromPoints simple', async (assert) => {
	const geo1 = window.geo1;

	const add1 = geo1.createNode('add');
	const add2 = geo1.createNode('add');
	const add3 = geo1.createNode('add');
	const add4 = geo1.createNode('add');
	const merge1 = geo1.createNode('merge');
	const curveFromPoints1 = geo1.createNode('curveFromPoints');

	add1.p.position.set([0, 0, 0]);
	add2.p.position.set([2, 1, 3]);
	add3.p.position.set([12, 41, 62]);
	add4.p.position.set([-20, 120, -10]);

	merge1.setInput(0, add1);
	merge1.setInput(1, add2);
	merge1.setInput(2, add3);
	merge1.setInput(3, add4);
	merge1.setCompactMode(true);

	curveFromPoints1.setInput(0, merge1);

	let container = await curveFromPoints1.compute();
	let coreGroup = container.coreContent()!;
	const object = coreGroup.objectsWithGeo()[0];
	assert.ok(object.userData['path']);
	assert.equal(coreGroup.pointsCount(), 100);
});

// QUnit.test('sop/curveFromPoints interpolates attributes', async (assert) => {
// 	const geo1 = window.geo1;

// 	const add1 = geo1.createNode('add');
// 	const add2 = geo1.createNode('add');
// 	const attribCreate1_t1 = geo1.createNode('attribCreate');
// 	const attribCreate2_t1 = geo1.createNode('attribCreate');
// 	const attribCreate1_t2 = geo1.createNode('attribCreate');
// 	const attribCreate2_t2 = geo1.createNode('attribCreate');
// 	const merge1 = geo1.createNode('merge');

// 	const curveFromPoints1 = geo1.createNode('curveFromPoints');

// 	attribCreate1_t1.setInput(0, add1);
// 	attribCreate1_t2.setInput(0, attribCreate1_t1);
// 	attribCreate2_t1.setInput(0, add2);
// 	attribCreate2_t2.setInput(0, attribCreate2_t1);
// 	merge1.setInput(0, attribCreate1_t2);
// 	merge1.setInput(1, attribCreate2_t2);
// 	curveFromPoints1.setInput(0, merge1);

// 	add1.p.position.set([0, 0, 0]);
// 	add2.p.position.set([1, 1, 1]);
// 	function setAttribCreate(attribCreate: AttribCreateSopNode, attribSize: number, value: number) {
// 		attribCreate.p.name.set(`t${attribSize == 2 ? '2' : ''}`);
// 		attribCreate.p.size.set(attribSize);
// 		if (attribSize == 1) {
// 			attribCreate.p.value1.set(value);
// 		}
// 		if (attribSize == 2) {
// 			attribCreate.p.value2.set([value, value]);
// 		}
// 	}
// 	setAttribCreate(attribCreate1_t1, 1, 0);
// 	setAttribCreate(attribCreate1_t2, 2, 0);
// 	setAttribCreate(attribCreate2_t1, 1, 1);
// 	setAttribCreate(attribCreate2_t2, 2, 1);
// 	merge1.setCompactMode(true);
// 	curveFromPoints1.p.attributesToInterpolate.set('t*');
// 	curveFromPoints1.p.pointsCount.set(3);

// 	let container = await curveFromPoints1.compute();
// 	let coreGroup = container.coreContent()!;
// 	const object = coreGroup.objectsWithGeo()[0];
// 	assert.ok(object.userData['path']);
// 	assert.equal(coreGroup.pointsCount(), 3);
// 	assert.deepEqual(
// 		coreGroup
// 			.points()
// 			.map((p: CorePoint) => p.position().toArray())
// 			.flat(),
// 		[0, 0, 0, 0.3125, 0.3125, 0.3125, 1, 1, 1]
// 	);
// 	assert.deepEqual(
// 		coreGroup
// 			.points()
// 			.map((p: CorePoint) => p.attribValue('t'))
// 			.flat(),
// 		[0, 0.3125, 1]
// 	);
// 	assert.deepEqual(
// 		coreGroup
// 			.points()
// 			.map((p: CorePoint) => (p.attribValue('t2') as Vector2).toArray())
// 			.flat(),
// 		[0, 0, 0.3125, 0.3125, 1, 1]
// 	);
// });
