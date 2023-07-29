import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
import {CadGeometryType} from '../../../../src/core/geometry/cad/CadCommon';
import {CadObject} from '../../../../src/core/geometry/cad/CadObject';
export function testenginenodessopCADPipe(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('sop/CADPipe simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const point1 = geo1.createNode('CADPoint');
	const transformP1 = geo1.createNode('transform');
	const transformP2 = geo1.createNode('transform');
	const segment1 = geo1.createNode('CADSegment');
	transformP1.setInput(0, point1);
	transformP2.setInput(0, point1);
	segment1.setInput(0, transformP1);
	segment1.setInput(1, transformP2);
	transformP1.p.t.set([2, 0, 0]);
	transformP2.p.t.set([-1, 0, 0]);
	//
	const circle1 = geo1.createNode('CADCircle');
	const curveTrim1 = geo1.createNode('CADCurveTrim');
	const transform2 = geo1.createNode('transform');
	const transform3 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');
	curveTrim1.setInput(0, circle1);
	transform2.setInput(0, curveTrim1);
	transform3.setInput(0, transform2);
	curveTrim1.p.max.set(Math.PI);
	transform2.p.r.y.set(90);
	transform3.p.t.set([-1, 0, -1]);
	//
	merge1.setInput(0, segment1);
	merge1.setInput(1, transform3);
	merge1.setCompactMode(true);
	//
	const rectangle1 = geo1.createNode('CADRectangle');
	const transform4 = geo1.createNode('transform');
	transform4.setInput(0, rectangle1);
	transform4.p.r.z.set(90);
	//
	const pipe1 = geo1.createNode('CADPipe');
	pipe1.setInput(0, transform4);
	pipe1.setInput(1, merge1);
	//
	const CADTriangulate1 = geo1.createNode('CADTriangulate');
	CADTriangulate1.setInput(0, pipe1);

	async function computePipe() {
		const container = await pipe1.compute();
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

	await computePipe();
	assert.in_delta(tmpBox.min.x, -2.623, 0.01);
	assert.in_delta(tmpBox.max.x, 2, 0.01);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		15048
	);
	assert.in_delta(tmpBox.min.x, -2.499, 0.01);
	assert.in_delta(tmpBox.max.x, 2, 0.01);
	assert.equal((await computePipe()).cadObjectsTypes.length, 3, 'allObjectsCount');
	assert.deepEqual(
		(await computePipe()).cadObjectsTypes,
		[CadGeometryType.SHELL, CadGeometryType.FACE, CadGeometryType.FACE],
		'types'
	);

	pipe1.p.capsAsFaces.set(false);
	assert.deepEqual(
		(await computePipe()).cadObjectsTypes,
		[CadGeometryType.SHELL, CadGeometryType.WIRE, CadGeometryType.WIRE],
		'types'
	);

	pipe1.p.cap.set(false);
	assert.deepEqual((await computePipe()).cadObjectsTypes, [CadGeometryType.SHELL], 'types');
});

}