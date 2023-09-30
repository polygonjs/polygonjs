import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {objectTypeFromConstructor, ObjectType} from '../../../../src/core/geometry/Constant';
import {Object3D} from 'three';
import {objectsCount, totalPointsCount} from '../../../../src/engine/containers/utils/GeometryContainerUtils';
export function testenginenodessopFileGEOJSON(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	async function withFile(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileGEOJSON');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	qUnit.test('sop/fileGEOJSON simple', async (assert) => {
		const {container} = await withFile('models/geojson/wikipedia.geojson');
		assert.equal(objectsCount(container), 1);
		assert.equal(totalPointsCount(container), 9);
		const group = container.coreContent()?.threejsObjects()[0]!;
		assert.ok(group);
		const objects = group.children;
		assert.equal(objects.length, 3);
		assert.equal(objectTypeFromConstructor(objects[0].constructor), ObjectType.POINTS);
		assert.equal(objectTypeFromConstructor(objects[1].constructor), ObjectType.LINE_SEGMENTS);
		assert.equal(objectTypeFromConstructor(objects[2].constructor), ObjectType.MESH);
	});

	// qUnit.test('sop/fileGEOJSON ibm.bounded', async (assert) => {
	// 	const {container} = await withFile('models/geojson/ibm.bounded.geojson');
	// 	assert.equal(objectsCount(container), 1);
	// 	assert.equal(totalPointsCount(container), 9);
	// 	const group = container.coreContent()?.objects()[0]!;
	// 	assert.ok(group);
	// 	const objects = group.children;
	// 	assert.equal(objects.length, 3);
	// 	assert.equal(objectTypeFromConstructor(objects[0].constructor), ObjectType.POINTS);
	// 	assert.equal(objectTypeFromConstructor(objects[1].constructor), ObjectType.LINE_SEGMENTS);
	// 	assert.equal(objectTypeFromConstructor(objects[2].constructor), ObjectType.MESH);
	// });

	qUnit.test('sop/fileGEOJSON brooklyn', async (assert) => {
		const {container} = await withFile('models/geojson/ebrelsford/brooklyn.geojson');
		assert.equal(objectsCount(container), 1);
		assert.equal(totalPointsCount(container), 17585);
		const group = container.coreContent()?.threejsObjects()[0]!;
		assert.ok(group);
		const objects = group.children;
		assert.equal(objects.length, 18);
		assert.deepEqual(
			objects.map((o: Object3D) => objectTypeFromConstructor(o.constructor)),
			[
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
			]
		);
	});
	qUnit.test('sop/fileGEOJSON queens', async (assert) => {
		const {container} = await withFile('models/geojson/ebrelsford/queens.geojson');
		assert.equal(objectsCount(container), 1);
		assert.equal(totalPointsCount(container), 466);
		const group = container.coreContent()?.threejsObjects()[0]!;
		assert.ok(group);
		const objects = group.children;
		assert.equal(objects.length, 16);
		assert.deepEqual(
			objects.map((o: Object3D) => objectTypeFromConstructor(o.constructor)),
			[
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
				ObjectType.MESH,
			]
		);
	});
}
