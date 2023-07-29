import type {QUnit} from '../../../helpers/QUnit';
import {ArrayUtils} from './../../../../src/core/ArrayUtils';
import {Mesh} from 'three';
import {Material} from 'three';
import {BooleanOperation, BOOLEAN_OPERATIONS} from '../../../../src/engine/operations/sop/Boolean';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
import {DeleteSopNode} from '../../../../src/engine/nodes/sop/Delete';
import {BooleanSopNode} from '../../../../src/engine/nodes/sop/Boolean';
export function testenginenodessopBoolean(qUnit: QUnit) {

qUnit.test('sop/boolean simple', async (assert) => {
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
	assert.equal(coreGroup.points().length, 108);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 60);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.ADD));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 162);

	// now with a sphere
	const sphere = geo1.createNode('sphere');
	transformB.setInput(0, sphere);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBTRACT));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 267);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 276);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.ADD));
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 5523);
});

qUnit.test('sop/boolean with shared materials', async (assert) => {
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
	boolean.p.keepMaterials.set(true);

	transformB.p.t.set([0.1, 0.1, 0.2]);

	boolean.p.operation.set(BOOLEAN_OPERATIONS.indexOf(BooleanOperation.SUBTRACT));
	let coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 108);
	let mesh = coreGroup.threejsObjectsWithGeo()[0] as Mesh;
	let geometry = mesh.geometry;
	assert.deepEqual(
		ArrayUtils.uniq(mesh.material as Material[]).map((mat) => mat.uuid),
		await Promise.all([meshBasic1, meshBasic2].map(async (matNode) => (await matNode.material()).uuid))
	);
	assert.equal(geometry.groups.length, 9, '9 groups');
	assert.equal(geometry.groups[0].count, 24, 'group 0 count');
	assert.equal(geometry.groups[1].count, 6, 'group 1 count');
	assert.equal(geometry.groups[2].count, 24, 'group 2 count');
	assert.equal(coreGroup.points().length, 108);

	boolean.p.keepMaterials.set(false);
	coreGroup = (await boolean.compute()).coreContent()!;
	assert.ok(coreGroup);
	assert.equal(coreGroup.points().length, 108);
	mesh = coreGroup.threejsObjectsWithGeo()[0] as Mesh;
	assert.deepEqual((mesh.material as Material).uuid, (await meshBasic1.material()).uuid);
	geometry = mesh.geometry;
	assert.equal(geometry.groups.length, 1);
	assert.equal(geometry.groups[0].count, 108, 'group 0 count');
	// assert.equal(geometry.groups[1].count, 30, 'group 1 count');
	// assert.equal(geometry.groups[2].count, 0, 'group 2 has 0');
});

qUnit.test('sop/boolean result can be instanciated', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;

	const material = MAT.createNode('meshBasicBuilder');

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	box2.p.center.set([0.1, 0.2, 0.3]);
	const boolean1 = geo1.createNode('boolean');

	boolean1.setOperation(BooleanOperation.ADD);
	boolean1.setInput(0, box1);
	boolean1.setInput(1, box2);

	const line1 = geo1.createNode('line');
	const instance1 = geo1.createNode('instance');
	instance1.p.material.setNode(material);
	instance1.setInput(0, boolean1);
	instance1.setInput(1, line1);

	const container = await instance1.compute();
	const coreGroup = container.coreContent();
	assert.equal(coreGroup?.pointsCount(), 2);
});

qUnit.test('sop/boolean result can be used by delete node', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	const sphere2 = geo1.createNode('sphere');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribCreate2 = geo1.createNode('attribCreate');
	const delete1 = geo1.createNode('delete');
	function _setupAttribCreate(attribCreate: AttribCreateSopNode, value: number) {
		attribCreate.p.name.set('keep');
		attribCreate.p.value1.set(value);
	}
	_setupAttribCreate(attribCreate1, 1);
	_setupAttribCreate(attribCreate2, 0);
	attribCreate1.setInput(0, sphere1);
	attribCreate2.setInput(0, sphere2);

	sphere2.p.center.set([0.1, 0.2, 0.3]);
	const boolean1 = geo1.createNode('boolean');
	delete1.setInput(0, boolean1);

	boolean1.setOperation(BooleanOperation.ADD);
	boolean1.setInput(0, attribCreate1);
	boolean1.setInput(1, attribCreate2);
	boolean1.p.additionalAttributes.set('keep');

	delete1.p.byAttrib.set(1);
	delete1.p.attribName.set('keep');

	async function pointsCount(node: DeleteSopNode | BooleanSopNode) {
		const container = await node.compute();
		return container.pointsCount();
	}

	assert.equal(await pointsCount(boolean1), 8028);
	assert.equal(await pointsCount(delete1), 4047);
});
qUnit.test('sop/boolean with intersection edges', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	const sphere2 = geo1.createNode('sphere');

	sphere2.p.center.set([0.1, 0.2, 0.3]);
	const boolean1 = geo1.createNode('boolean');

	boolean1.setOperation(BooleanOperation.ADD);
	boolean1.setInput(0, sphere1);
	boolean1.setInput(1, sphere2);

	async function pointsCount(node: BooleanSopNode) {
		const container = await node.compute();
		return container.pointsCount();
	}
	boolean1.p.intersectionEdgesOnly.set(true);
	assert.equal(await pointsCount(boolean1), 468);
	boolean1.p.intersectionEdgesOnly.set(false);
	assert.equal(await pointsCount(boolean1), 8028);
});

}