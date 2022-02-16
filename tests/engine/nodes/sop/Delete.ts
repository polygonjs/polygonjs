import {
	ObjectType,
	objectTypeFromConstructor,
	AttribClass,
	AttribType,
	ATTRIBUTE_TYPES,
} from '../../../../src/core/geometry/Constant';
import {CorePoint} from '../../../../src/core/geometry/Point';
import {TransformTargetType} from '../../../../src/core/Transform';

QUnit.test('SOP delete: (class=points) simple plane', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	delete1.setInput(0, plane1);
	delete1.p.byExpression.set(1);

	let container = await delete1.compute();
	assert.equal(container.pointsCount(), 3);

	// the points of one face remain if deleting a single point
	delete1.p.expression.set('@ptnum==0');
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 3);

	// all 4 points removed if deleting one 2 of them, since that deletes both faces
	delete1.p.expression.set('@ptnum==1 || @ptnum==0');
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 0);
});

QUnit.test('SOP delete: (class=points) simple box', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const delete1 = geo1.createNode('delete');
	delete1.setInput(0, box1);
	delete1.p.byExpression.set(1);

	let container = await box1.compute();
	assert.equal(container.pointsCount(), 24, 'box');

	container = await delete1.compute();
	assert.equal(container.pointsCount(), 33, 'after first delete'); // mm, I'd expect 21 instead. I could probably optimize the geometry creation from the kept points

	// only the top points remain
	delete1.p.expression.set('@P.y<0');
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 6, 'after expression delete');
});

QUnit.test('SOP delete: (class=object) simple box', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const delete1 = geo1.createNode('delete');

	merge1.setInput(0, box1);
	merge1.setInput(1, box2);
	merge1.p.compact.set(0);
	delete1.setInput(0, merge1);

	delete1.p.class.set(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.expression.set('@ptnum==1');

	let container = await merge1.compute();
	let core_object = container.coreContent()!;
	assert.equal(core_object.coreObjects().length, 2);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[0].object().constructor), ObjectType.MESH);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[1].object().constructor), ObjectType.MESH);

	// now with keep_points on
	delete1.p.keepPoints.set(1);
	container = await delete1.compute();
	core_object = container.coreContent()!;
	assert.equal(core_object.coreObjects().length, 2);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[0].object().constructor), ObjectType.MESH);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[1].object().constructor), ObjectType.POINTS);

	// now with keep_points off
	delete1.p.keepPoints.set(0);
	container = await delete1.compute();
	core_object = container.coreContent()!;
	assert.equal(core_object.coreObjects().length, 1);
	assert.equal(objectTypeFromConstructor(core_object.coreObjects()[0].object().constructor), ObjectType.MESH);
});

QUnit.test('SOP delete: (class=point) string attrib', async (assert) => {
	const geo1 = window.geo1;
	const add1 = geo1.createNode('add');
	const add2 = geo1.createNode('add');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribCreate2 = geo1.createNode('attribCreate');
	const merge1 = geo1.createNode('merge');
	const delete1 = geo1.createNode('delete');

	attribCreate1.setInput(0, add1);
	attribCreate2.setInput(0, add2);
	merge1.setInput(0, attribCreate1);
	merge1.setInput(1, attribCreate2);
	delete1.setInput(0, merge1);
	[attribCreate1, attribCreate2].forEach((n) => {
		n.setAttribType(AttribType.STRING);
		n.p.name.set('name');
	});
	attribCreate1.p.string.set('beaver');
	attribCreate2.p.string.set('eagle');

	delete1.p.byAttrib.set(true);
	delete1.p.attribType.set(ATTRIBUTE_TYPES.indexOf(AttribType.STRING));
	delete1.p.attribName.set('name');
	delete1.p.attribString.set('beaver');

	async function getPoints() {
		let container = await delete1.compute();
		let core_object = container.coreContent()!;
		return core_object.points();
	}

	let container = await delete1.compute();
	let core_object = container.coreContent()!;
	assert.equal(core_object.points().length, 1);
	assert.equal((await getPoints())[0].stringAttribValue('name'), 'eagle');

	delete1.p.invert.set(true);
	container = await delete1.compute();
	core_object = container.coreContent()!;
	assert.equal(core_object.points().length, 1);
	assert.equal(core_object.points()[0].stringAttribValue('name'), 'beaver');

	delete1.p.attribString.set('mountain');
	assert.deepEqual(
		(await getPoints()).map((p: CorePoint) => p.stringAttribValue('name')),
		[]
	);

	delete1.p.invert.set(false);
	assert.deepEqual(
		(await getPoints()).map((p: CorePoint) => p.stringAttribValue('name')),
		['beaver', 'eagle']
	);
});

QUnit.test('SOP delete byBoundingObject 1', async (assert) => {
	const geo1 = window.geo1;

	const sphere = geo1.createNode('sphere');
	const bboxScatter = geo1.createNode('bboxScatter');
	bboxScatter.p.stepSize.set(0.2);
	const delete1 = geo1.createNode('delete');
	bboxScatter.setInput(0, sphere);
	delete1.setInput(0, bboxScatter);
	delete1.setInput(1, sphere);

	let container = await delete1.compute();
	assert.equal(container.pointsCount(), 1210);

	delete1.p.byBoundingObject.set(1);
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 719);
});

QUnit.test('SOP delete byBoundingObject 2', async (assert) => {
	const geo1 = window.geo1;

	const icosahedron1 = geo1.createNode('icosahedron');
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const delete1 = geo1.createNode('delete');

	delete1.setInput(0, icosahedron1);

	icosahedron1.p.detail.set(9);
	icosahedron1.p.pointsOnly.set(1);
	transform1.setInput(0, box1);
	delete1.setInput(0, icosahedron1);
	delete1.setInput(1, transform1);

	let container = await delete1.compute();
	assert.equal(container.pointsCount(), 1110);

	delete1.p.byBoundingObject.set(1);
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 1110);

	transform1.setApplyOn(TransformTargetType.OBJECTS);
	transform1.p.t.z.set(1);
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 1110);

	transform1.setApplyOn(TransformTargetType.GEOMETRIES);
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 1005);

	transform1.p.s.set([2, 2, 1]);
	container = await delete1.compute();
	assert.equal(container.pointsCount(), 823);
});
