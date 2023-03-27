import {BufferAttribute, Box3, Vector3} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADFileSTEP simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const file1 = geo1.createNode('CADFileSTEP');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	CADTriangulate1.setInput(0, file1);
	file1.p.url.set(`${ASSETS_ROOT}/models/3M_961401-9040704-AR.STEP`);

	async function computeFile() {
		const container = await file1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeFile();
	assert.in_delta(tmpBox.min.y, -1.27, 0.01);
	assert.in_delta(tmpSize.y, 2.54, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 672);
	assert.in_delta(tmpBox.min.y, -1.27, 0.01);
	assert.in_delta(tmpSize.y, 2.54, 0.01);
});

QUnit.test('sop/CADFileSTEP legowhitehouse', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const file1 = geo1.createNode('CADFileSTEP');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	CADTriangulate1.setInput(0, file1);
	file1.p.url.set(`${ASSETS_ROOT}/models/legowhitehousejp.STEP`);

	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	CADTriangulate1.p.angularTolerance.set(2);
	CADTriangulate1.p.linearTolerance.set(2);
	CADTriangulate1.p.curveAbscissa.set(2);
	CADTriangulate1.p.curveTolerance.set(2);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		419292
	);
	assert.in_delta(tmpBox.min.y, 71.41, 0.01);
	assert.in_delta(tmpSize.y, 77.5, 0.01);
});

QUnit.test('sop/CADFileSTEP pigsignaler', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const file1 = geo1.createNode('CADFileSTEP');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	CADTriangulate1.setInput(0, file1);
	file1.p.url.set(`${ASSETS_ROOT}/models/pigsignaler.STEP`);

	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	CADTriangulate1.p.angularTolerance.set(2);
	CADTriangulate1.p.linearTolerance.set(2);
	CADTriangulate1.p.curveAbscissa.set(2);
	CADTriangulate1.p.curveTolerance.set(2);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		64059
	);
	assert.in_delta(tmpBox.min.y, -82.54, 0.01);
	assert.in_delta(tmpSize.y, 165.09, 0.01);
});
