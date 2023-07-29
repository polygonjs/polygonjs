import type {QUnit} from '../../../helpers/QUnit';
import {ConversionMode} from '../../../../src/engine/nodes/sop/CADConvertDimension';
import {Box3, Vector3} from 'three';
export function testenginenodessopCADConvertDimension(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('sop/CADConvertDimension simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const point2D1 = geo1.createNode('CADPoint2D');
	const transform1 = geo1.createNode('CADTransform');
	const transform2 = geo1.createNode('CADTransform');
	const convertDimension1 = geo1.createNode('CADConvertDimension');

	transform1.setInput(0, point2D1);
	convertDimension1.setInput(0, point2D1);
	transform2.setInput(0, convertDimension1);

	convertDimension1.setMode(ConversionMode.TO_3D);
	transform1.p.t.set([0, 0, 1]);
	transform2.p.t.set([0, 0, 1]);

	async function computeTransform1() {
		const container = await transform1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTransform2() {
		const container = await transform2.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		// const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}

	await computeTransform1();
	assert.in_delta(tmpBox.min.z, 0, 0.01);

	await computeTransform2();
	assert.in_delta(tmpBox.min.z, 1, 0.01);
});

}