import type {QUnit} from '../../../helpers/QUnit';
import {Group, LineSegments, Mesh, Object3D, Points} from 'three';
import {ObjectType} from '../../../../src/core/geometry/Constant';
export function testenginenodessopEmptyObject(qUnit: QUnit) {

qUnit.test('SOP emptyObject simple', async (assert) => {
	const geo1 = window.geo1;

	const emptyObject1 = geo1.createNode('emptyObject');
	const transform1 = geo1.createNode('transform');

	transform1.setInput(0, emptyObject1);

	async function getOutput() {
		const container = await transform1.compute();
		const objects = container.coreContent()?.allObjects()!;
		return objects[0];
	}

	// default
	assert.ok((await getOutput()) instanceof Group);

	// Object3D
	emptyObject1.setObjectType(ObjectType.OBJECT3D);
	assert.ok((await getOutput()) instanceof Object3D);

	// LineSegments
	emptyObject1.setObjectType(ObjectType.LINE_SEGMENTS);
	assert.ok((await getOutput()) instanceof LineSegments);

	// Points
	emptyObject1.setObjectType(ObjectType.POINTS);
	assert.ok((await getOutput()) instanceof Points);

	// Mesh
	emptyObject1.setObjectType(ObjectType.MESH);
	assert.ok((await getOutput()) instanceof Mesh);

	// Group
	emptyObject1.setObjectType(ObjectType.GROUP);
	assert.ok((await getOutput()) instanceof Group);
});

}