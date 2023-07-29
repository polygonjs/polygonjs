import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
import {CadGeometryType} from '../../../../src/core/geometry/cad/CadCommon';
import {CadObject} from '../../../../src/core/geometry/cad/CadObject';
export function testenginenodessopCADRevolution(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('sop/CADRevolution simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const circle1 = geo1.createNode('CADCircle');
	const revolution1 = geo1.createNode('CADRevolution');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');
	revolution1.setInput(0, circle1);
	CADTriangulate1.setInput(0, revolution1);

	circle1.p.axis.set([0, -1, 0]);
	circle1.p.center.set([2, 0, 0]);
	revolution1.p.axis.set([0, 0, 1]);

	async function computePointsFromCurve1() {
		const container = await revolution1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;
		const cadObjects = coreGroup.cadObjects()!;
		const cadObjectsTypes = cadObjects.map((o: CadObject<CadGeometryType>) => o.type);

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {cadObjectsTypes, allObjectsCount, threejsObjectsCount};
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

	await computePointsFromCurve1();
	assert.in_delta(tmpBox.min.x, -3, 0.01);
	assert.in_delta(tmpBox.max.x, 3, 0.01);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		16887
	);
	assert.in_delta(tmpBox.min.x, -3, 0.01);
	assert.in_delta(tmpBox.max.x, 3, 0.01);
});

}