import {BooleanOperation, BOOLEAN_OPERATIONS} from '../../../../src/engine/operations/sop/Boolean';

QUnit.test('SOP boolean simple', async (assert) => {
	const geo1 = window.geo1;

	const boxA = geo1.createNode('box');
	const boxB = geo1.createNode('box');
	const transformA = geo1.createNode('transform');
	const transformB = geo1.createNode('transform');
	const boolean = geo1.createNode('boolean');

	transformA.setInput(0, boxA);
	transformB.setInput(0, boxB);
	boolean.setInput(0, transformA);
	boolean.setInput(1, transformB);

	transformB.p.t.set([0.1, 0.1, 0.2]);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBSTRACT));
	let coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 135);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 60);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.UNION));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 210);

	// now with a sphere
	const sphere = geo1.createNode('sphere');
	transformB.setInput(0, sphere);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBSTRACT));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 462);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 192);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.UNION));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 7188);
});
