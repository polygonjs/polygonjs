import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
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

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBTRACT));
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

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBTRACT));
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

QUnit.test('SOP boolean with shared materials', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;

	const meshBasic1 = MAT.createNode('meshBasic');
	const meshBasic2 = MAT.createNode('meshBasic');

	const boxA = geo1.createNode('box');
	const boxB = geo1.createNode('box');
	const materialA = geo1.createNode('material');
	const materialB = geo1.createNode('material');
	const transformA = geo1.createNode('transform');
	const transformB = geo1.createNode('transform');
	const boolean = geo1.createNode('boolean');

	materialA.p.material.set(meshBasic1.path());
	materialB.p.material.set(meshBasic2.path());

	materialA.setInput(0, boxA);
	materialB.setInput(0, boxB);
	transformA.setInput(0, materialA);
	transformB.setInput(0, materialB);
	boolean.setInput(0, transformA);
	boolean.setInput(1, transformB);
	boolean.p.useBothMaterials.set(true);

	transformB.p.t.set([0.1, 0.1, 0.2]);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBTRACT));
	let coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 135);
	let mesh = coreGroup.objectsWithGeo()[0] as Mesh;
	let geometry = mesh.geometry;
	assert.deepEqual(
		(mesh.material as Material[]).map((mat) => mat.uuid),
		[meshBasic1, meshBasic2].map((matNode) => matNode.material.uuid)
	);
	assert.equal(geometry.groups.length, 2);
	assert.equal(coreGroup.points().length, 135);

	boolean.p.useBothMaterials.set(false);
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 135);
	mesh = coreGroup.objectsWithGeo()[0] as Mesh;
	assert.deepEqual((mesh.material as Material).uuid, meshBasic1.material.uuid);
	geometry = mesh.geometry;
	assert.equal(geometry.groups.length, 2);
});
