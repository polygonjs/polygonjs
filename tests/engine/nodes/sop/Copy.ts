import type {QUnit} from '../../../helpers/QUnit';
import {MeshBasicMatNode} from './../../../../src/engine/nodes/mat/MeshBasic';
import {ImageCopNode} from './../../../../src/engine/nodes/cop/Image';
import {Box3, Mesh, Object3D, Vector3, MeshBasicMaterial, Texture, BufferAttribute} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {ArrayUtils} from '../../../../src/core/ArrayUtils';
import {TransformTargetType} from '../../../../src/core/Transform';
import {ObjectTransformSpace} from '../../../../src/core/TransformSpace';
import {CopySopNode} from '../../../../src/engine/nodes/sop/Copy';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';
export function testenginenodessopCopy(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpCenter = new Vector3();

qUnit.test('sop/copy simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');
	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, box1);
	copy1.setInput(1, plane1);
	plane1.p.direction.set([0, 0, 1]);

	async function compute() {
		const container = await copy1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);

		return {bbox: tmpBox, pointsCount: coreGroup.pointsCount()};
	}

	// let core_group = container.coreContent()!;
	// let {geometry} = core_group.objects()[0];

	assert.equal((await compute()).pointsCount, 96);
	assert.equal((await compute()).bbox.min.y, -1.0);

	plane1.p.useSegmentsCount.set(1);
	plane1.p.size.y.set(2);

	// container = await copy1.compute();
	// core_group = container.coreContent()!;
	// ({geometry} = core_group.objects()[0]);

	assert.equal((await compute()).pointsCount, 96);
	assert.equal((await compute()).bbox.min.y, -1.5);
});

qUnit.test('sop/copy with template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	const plane1 = geo1.createNode('plane');
	const line1 = geo1.createNode('line');
	const switch1 = geo1.createNode('switch');
	switch1.setInput(0, plane1);
	switch1.setInput(1, box1);
	attrib_create1.setInput(0, switch1);

	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, attrib_create1);
	copy1.setInput(1, line1);
	copy1.p.useCopyExpr.set(0);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set(`1+2*copy('../${copy1.name()}', 0)`);
	switch1.p.input.set(`copy('../${copy1.name()}', 0)`);
	assert.ok(switch1.graphAllPredecessors().includes(copy1.stampNode()));

	let container = await copy1.compute();
	// let core_group = container.coreContent();
	// let { geometry } = group.children[0];

	assert.equal(container.pointsCount(), 8);

	copy1.p.useCopyExpr.set(1);
	container = await copy1.compute();
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.pointsCount(), 28);
	const objects = container.coreContent()!.threejsObjectsWithGeo();
	assert.equal(objects.length, 2);
	assert.equal((objects[0].geometry.attributes.test as BufferAttribute).array[0], 1);
	assert.equal((objects[1].geometry.attributes.test as BufferAttribute).array[0], 3);
});

qUnit.test('sop/copy without template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');
	const switch1 = geo1.createNode('switch');
	switch1.setInput(0, plane1);
	switch1.setInput(1, box1);

	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, switch1);
	copy1.p.count.set(3);

	switch1.p.input.set(`copy('../${copy1.name()}', 0) % 2`);
	copy1.p.useCopyExpr.set(0);
	let container = await copy1.compute();
	// let core_group = container.coreContent();
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.pointsCount(), 12);

	copy1.p.useCopyExpr.set(1);
	container = await copy1.compute();
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.pointsCount(), 32);
});

qUnit.test('sop/copy objects with template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	const plane1 = geo1.createNode('plane');

	const copy1 = geo1.createNode('copy');
	attrib_create1.setAttribClass(AttribClass.OBJECT);
	attrib_create1.setInput(0, box1);
	copy1.setInput(0, attrib_create1);
	copy1.setInput(1, plane1);
	copy1.p.count.set(3);
	copy1.p.useCopyExpr.set(1);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set(`copy('../${copy1.name()}', 0)`);

	let container = await copy1.compute();
	// let core_group = container.coreContent();
	// let {geometry} = core_group.objects()[0];

	const objects = container.coreContent()!.threejsObjects();
	assert.equal(objects.length, 4);
	assert.equal(objects[0].userData.attributes.test, 0);
	assert.equal(objects[1].userData.attributes.test, 1);
	assert.equal(objects[2].userData.attributes.test, 2);
	assert.equal(objects[3].userData.attributes.test, 3);
});

qUnit.test('sop/copy using a copy stamp expression only triggers the successors once per cook', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const sphere = geo1.createNode('sphere');
	const scatter = geo1.createNode('scatter');
	const roundedBox = geo1.createNode('roundedBox');
	const objectProperties = geo1.createNode('objectProperties');
	const copy = geo1.createNode('copy');
	const attribPromote = geo1.createNode('attribPromote');

	scatter.setInput(0, sphere);
	scatter.p.pointsCount.set(5);

	objectProperties.setInput(0, roundedBox);
	objectProperties.p.tname.set(1);
	objectProperties.p.name.set("box_`copy('../copy1',0)`");

	copy.setInput(0, objectProperties);
	copy.setInput(1, scatter);
	copy.p.useCopyExpr.set(true);

	attribPromote.setInput(0, copy);

	await attribPromote.compute();

	assert.equal(attribPromote.cookController.cooksCount(), 1);

	window.scene.performance.stop();
});
qUnit.test('sop/copy switching from useCopyExpr from true to false will give expected results', async (assert) => {
	const geo1 = window.geo1;

	const sphere = geo1.createNode('sphere');
	const scatter = geo1.createNode('scatter');
	const roundedBox = geo1.createNode('roundedBox');
	const objectProperties = geo1.createNode('objectProperties');
	const copy = geo1.createNode('copy');
	const attribPromote = geo1.createNode('attribPromote');

	scatter.setInput(0, sphere);
	scatter.p.pointsCount.set(5);

	objectProperties.setInput(0, roundedBox);
	objectProperties.p.tname.set(1);
	objectProperties.p.name.set("box_`copy('../copy1',0)`");

	copy.setInput(0, objectProperties);
	copy.setInput(1, scatter);
	copy.p.useCopyExpr.set(false);

	attribPromote.setInput(0, copy);

	async function objectNames() {
		const container = await attribPromote.compute();
		return container
			.coreContent()
			?.threejsObjects()
			.map((o: Object3D) => o.name);
	}

	assert.deepEqual(await objectNames(), ['box_0', 'box_0', 'box_0', 'box_0', 'box_0']);
	copy.p.useCopyExpr.set(true);
	assert.deepEqual(await objectNames(), ['box_0', 'box_1', 'box_2', 'box_3', 'box_4']);
	copy.p.useCopyExpr.set(false);
	assert.deepEqual(await objectNames(), ['box_0', 'box_0', 'box_0', 'box_0', 'box_0']);
	copy.p.useCopyExpr.set(true);
	assert.deepEqual(await objectNames(), ['box_0', 'box_1', 'box_2', 'box_3', 'box_4']);
});

qUnit.test('sop/copy accumulated transform without template points', async (assert) => {
	const geo1 = window.geo1;

	const box = geo1.createNode('box');
	const copy = geo1.createNode('copy');
	copy.setInput(0, box);
	copy.p.count.set(4);
	copy.p.t.z.set(1);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	const objects = await computeCopy(copy);
	assert.in_delta(objects[0].position.z, 0, 0.05);
	assert.equal(objects[1].position.z, 1);
	assert.equal(objects[2].position.z, 2);
	assert.equal(objects[3].position.z, 3);
});
qUnit.test('sop/copy accumulated transform with template points and local transform space', async (assert) => {
	const geo1 = window.geo1;

	const plane = geo1.createNode('plane');
	const box = geo1.createNode('box');
	const copy = geo1.createNode('copy');
	copy.setInput(0, box);
	copy.setInput(1, plane);
	copy.p.t.z.set(1);
	copy.setObjectTransformSpace(ObjectTransformSpace.LOCAL);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	const objects = await computeCopy(copy);
	assert.in_delta(objects[0].position.y, 0, 0.05);
	assert.in_delta(objects[1].position.y, 1, 0.0001);
	assert.in_delta(objects[2].position.y, 2, 0.0001);
	assert.in_delta(objects[3].position.y, 3, 0.0001);
});
qUnit.test('sop/copy accumulated transform with template points and parent transform space', async (assert) => {
	const geo1 = window.geo1;

	const plane = geo1.createNode('plane');
	const box = geo1.createNode('box');
	const copy = geo1.createNode('copy');
	copy.setInput(0, box);
	copy.setInput(1, plane);
	copy.p.t.z.set(1);
	copy.setObjectTransformSpace(ObjectTransformSpace.PARENT);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	const objects = await computeCopy(copy);
	assert.in_delta(objects[0].position.z, -0.5, 0.0001);
	assert.in_delta(objects[1].position.z, 0.5, 0.0001);
	assert.in_delta(objects[2].position.z, 2.5, 0.0001);
	assert.in_delta(objects[3].position.z, 3.5, 0.0001);
});
qUnit.test('sop/copy accumulated transform with template points and geometry mode', async (assert) => {
	const geo1 = window.geo1;

	const plane = geo1.createNode('plane');
	const box = geo1.createNode('box');
	const copy = geo1.createNode('copy');
	copy.setInput(0, box);
	copy.setInput(1, plane);
	copy.p.t.z.set(1);
	copy.setTransformMode(TransformTargetType.GEOMETRY);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	const objects = await computeCopy(copy);
	assert.in_delta(objects[0].position.z, 0, 0.0001);
	assert.in_delta(objects[1].position.z, 0, 0.0001);
	assert.in_delta(objects[2].position.z, 0, 0.0001);
	assert.in_delta(objects[3].position.z, 0, 0.0001);
	objects.forEach((o) => (o as Mesh).geometry.computeBoundingBox());
	assert.in_delta((objects[0] as Mesh).geometry!.boundingBox!.getCenter(new Vector3()).z, -0.5, 0.0001);
	assert.in_delta((objects[1] as Mesh).geometry!.boundingBox!.getCenter(new Vector3()).z, 0.5, 0.0001);
	assert.in_delta((objects[2] as Mesh).geometry!.boundingBox!.getCenter(new Vector3()).z, 2.5, 0.0001);
	assert.in_delta((objects[3] as Mesh).geometry!.boundingBox!.getCenter(new Vector3()).z, 3.5, 0.0001);
});
qUnit.test('sop/copy transform only with not enough points or objects', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const line2 = geo1.createNode('line');
	const box = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const copy2 = geo1.createNode('copy');

	line1.p.pointsCount.set(5);
	line2.p.pointsCount.set(10);

	copy1.setInput(0, box);
	copy1.setInput(1, line1);

	copy2.setInput(0, copy1);
	copy2.setInput(1, line2);
	copy2.p.transformOnly.set(1);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	let objects = await computeCopy(copy2);
	assert.equal(objects.length, 5);

	line1.p.pointsCount.set(12);
	line2.p.pointsCount.set(7);
	objects = await computeCopy(copy2);
	assert.equal(objects.length, 7);

	line1.p.pointsCount.set(10);
	line2.p.pointsCount.set(10);
	objects = await computeCopy(copy2);
	assert.equal(objects.length, 10);

	line1.p.pointsCount.set(2);
	line2.p.pointsCount.set(10);
	objects = await computeCopy(copy2);
	assert.equal(objects.length, 2);

	line1.p.pointsCount.set(10);
	line2.p.pointsCount.set(2);
	objects = await computeCopy(copy2);
	assert.equal(objects.length, 2);
});
qUnit.test('sop/copy transform only with accumulated transform in local space', async (assert) => {
	const geo1 = window.geo1;

	const plane = geo1.createNode('plane');
	const box = geo1.createNode('box');
	const transform = geo1.createNode('transform');
	const copy1 = geo1.createNode('copy');
	const copy2 = geo1.createNode('copy');

	transform.setInput(0, plane);
	transform.p.scale.set(0);
	copy1.setInput(0, box);
	copy1.setInput(1, transform);

	copy2.setInput(0, copy1);
	copy2.setInput(1, plane);
	copy2.p.t.z.set(1);
	copy2.p.transformOnly.set(true);
	copy2.setObjectTransformSpace(ObjectTransformSpace.LOCAL);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	const objects = await computeCopy(copy2);
	assert.in_delta(objects[0].position.y, 0, 0.05);
	assert.equal(objects[1].position.y, 1);
	assert.equal(objects[2].position.y, 2);
	assert.equal(objects[3].position.y, 3);
});
qUnit.test('sop/copy transform only with accumulated transform in parent space', async (assert) => {
	const geo1 = window.geo1;

	const plane = geo1.createNode('plane');
	const box = geo1.createNode('box');
	const transform = geo1.createNode('transform');
	const copy1 = geo1.createNode('copy');
	const copy2 = geo1.createNode('copy');

	transform.setInput(0, plane);
	transform.p.scale.set(0);
	copy1.setInput(0, box);
	copy1.setInput(1, transform);

	copy2.setInput(0, copy1);
	copy2.setInput(1, plane);
	copy2.p.t.y.set(1);
	copy2.p.transformOnly.set(true);
	copy2.setObjectTransformSpace(ObjectTransformSpace.PARENT);
	async function computeCopy(copy: CopySopNode) {
		const container = await copy.compute();
		return container.coreContent()?.threejsObjects()!;
	}
	const objects = await computeCopy(copy2);
	assert.in_delta(objects[0].position.y, 0, 0.05);
	assert.equal(objects[1].position.y, 1);
	assert.equal(objects[2].position.y, 2);
	assert.equal(objects[3].position.y, 3);
});
qUnit.test('sop/copy can copy and move a hierarchy', async (assert) => {
	const geo1 = window.geo1;

	// hierarchy
	const box1 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const hierarchy1 = geo1.createNode('hierarchy');
	merge1.setInput(0, box1);
	merge1.setInput(1, box1);
	merge1.setCompactMode(false);
	hierarchy1.setInput(0, merge1);
	hierarchy1.setMode(HierarchyMode.ADD_PARENT);
	hierarchy1.p.levels.set(2);
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, hierarchy1);
	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.p.scale.set(10);

	// template pts
	const add1 = geo1.createNode('add');
	const transform2 = geo1.createNode('transform');
	transform2.setInput(0, add1);
	transform2.p.t.set([1, 0, 0]);

	// copy
	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, transform1);
	copy1.setInput(1, transform2);

	async function compute() {
		const container = await copy1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);
		tmpBox.getCenter(tmpCenter);

		return {bbox: tmpBox, center: tmpCenter, pointsCount: coreGroup.pointsCount()};
	}

	// test result
	copy1.setObjectTransformSpace(ObjectTransformSpace.PARENT);
	assert.in_delta((await compute()).center.x, 1, 0.1);

	copy1.setObjectTransformSpace(ObjectTransformSpace.LOCAL);
	assert.in_delta((await compute()).center.x, 10, 0.1);
});

qUnit.test('sop/copy can handle expression inside a nodePath param such as sop/material', async (assert) => {
	async function runAsserts(_copyNode: CopySopNode, _imageNodes: ImageCopNode[], _materialNodes: MeshBasicMatNode[]) {
		let container = await _copyNode.compute();
		let coreContent = container.coreContent()!;
		let objects = coreContent.threejsObjects() as Mesh[];
		assert.equal(objects.length, 3, '3 objects');
		assert.equal(
			(objects[0].material as MeshBasicMaterial).uuid,
			(await _materialNodes[0].material()).uuid,
			'material match'
		);
		assert.equal(
			(objects[1].material as MeshBasicMaterial).uuid,
			(await _materialNodes[1].material()).uuid,
			'material match'
		);
		assert.equal(
			(objects[2].material as MeshBasicMaterial).uuid,
			(await _materialNodes[2].material()).uuid,
			'material match'
		);

		const textures: Texture[] = [];
		for (let imageNode of _imageNodes) {
			let textureContainer = await imageNode.compute();
			textures.push(textureContainer.texture());
		}
		await _imageNodes.map(async (node) => (await node.compute()).texture());
		const objectMapUuids = objects.map((object) => (object.material as MeshBasicMaterial).map!.uuid);
		const textureUuids = textures.map((texture) => texture.uuid);
		assert.equal(ArrayUtils.uniq(objectMapUuids).length, 3, '3 uuids');
		assert.equal(ArrayUtils.uniq(textureUuids).length, 3, '3 uuids');
		assert.equal(objectMapUuids[0], textureUuids[0], 'texture match');
		assert.equal(objectMapUuids[1], textureUuids[1], 'texture match');
		assert.equal(objectMapUuids[2], textureUuids[2], 'texture match');
	}

	const scene = window.scene;
	const geo1 = window.geo1;
	const MAT = window.MAT;
	const COP = window.COP;

	const imageUrls = [
		`${ASSETS_ROOT}/textures/uv.jpg`,
		`${ASSETS_ROOT}/textures/resources/polyhaven.com/fabric_pattern_07/2k/diffuse.jpg`,
		`${ASSETS_ROOT}/textures/resources/polyhaven.com/brick_moss_001/2k/diffuse.jpg`,
	];
	const nodesCount = 3;
	let materialNodes: MeshBasicMatNode[] = [];
	let imageNodes: ImageCopNode[] = [];
	for (let i = 0; i < nodesCount; i++) {
		const image = COP.createNode('image');
		image.p.url.set(imageUrls[i]);
		image.setName(`image${i}`);
		const meshBasic = MAT.createNode('meshBasic');
		meshBasic.p.useMap.set(true);
		meshBasic.p.map.set("/COP/image`opdigits('.')`");
		await meshBasic.p.map.compute(); // TODO: that should not be necessary for the test to pass
		meshBasic.setName(`meshBasic${i}`);
		imageNodes.push(image);
		materialNodes.push(meshBasic);
	}
	for (const materialNode of materialNodes) {
		await materialNode.compute();
	}

	const material1 = geo1.createNode('material');
	const sphere1 = geo1.createNode('sphere');
	// create the copy node last to test that
	// its references does get fixed by the MissingReferencesController
	const copy1 = geo1.createNode('copy');

	material1.setInput(0, sphere1);
	copy1.setInput(0, material1);
	material1.p.material.set("/MAT/meshBasic`copy('../copy1')`");
	copy1.p.count.set(3);

	await runAsserts(copy1, imageNodes, materialNodes);

	// also test that the scene load handles resolving the '../copy1' expression
	// in the MissingReferencesController
	await saveAndLoadScene(scene, async (scene2) => {
		const copy2 = scene2.node(copy1.path()) as CopySopNode;
		const imageNodes2 = [0, 1, 2].map((i) => scene2.node(`/COP/image${i}`) as ImageCopNode);
		const materialNodes2 = [0, 1, 2].map((i) => scene2.node(`/MAT/meshBasic${i}`) as MeshBasicMatNode);
		await runAsserts(copy2, imageNodes2, materialNodes2);
	});
});

qUnit.skip('sop/copy with group sets an error', (assert) => {});
qUnit.skip(
	'copy with transform_only can update the input 0 with different scale multiple times and give reliable scale',
	(assert) => {
		// create an attrib_create, pipe in input 1
		// set a pscale attrib of 0.5
		// set transform_only to 1
		// check the output size
		// set pscale attrib of 0.25
		// check the output size
		// set pscale attrib of 0.75
		// check the output size
	}
);
qUnit.skip('copy does not modify input 0 with transform_only', (assert) => {});

}