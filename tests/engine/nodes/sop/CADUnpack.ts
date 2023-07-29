import type {QUnit} from '../../../helpers/QUnit';
import {Box3} from 'three';
import {CadGeometryType} from '../../../../src/core/geometry/cad/CadCommon';
import {CadObject} from '../../../../src/core/geometry/cad/CadObject';
import {CADUnpackSopNode} from '../../../../src/engine/nodes/sop/CADUnpack';
export function testenginenodessopCADUnpack(qUnit: QUnit) {
const tmpBox = new Box3();

qUnit.test('sop/CADUnpack operations', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('CADBox');
	const unpack1 = geo1.createNode('CADUnpack');
	const unpack2 = geo1.createNode('CADUnpack');
	const unpack3 = geo1.createNode('CADUnpack');
	const unpack4 = geo1.createNode('CADUnpack');
	const unpack5 = geo1.createNode('CADUnpack');
	const unpack6 = geo1.createNode('CADUnpack');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	unpack1.setInput(0, box1);
	unpack2.setInput(0, unpack1);
	unpack3.setInput(0, unpack2);
	unpack4.setInput(0, unpack3);
	unpack5.setInput(0, unpack4);
	unpack6.setInput(0, unpack5);
	CADTriangulate1.setInput(0, unpack1);

	async function computeUnpack(unpackNode: CADUnpackSopNode) {
		const container = await unpackNode.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const cadObjects = coreGroup.cadObjects()!;
		const cadObjectsTypes = cadObjects.map((o: CadObject<CadGeometryType>) => o.type);

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount, cadObjectsTypes};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	assert.deepEqual((await computeUnpack(unpack1)).cadObjectsTypes, [CadGeometryType.SHELL], 'types 1');
	await computeTriangulate();

	assert.deepEqual(
		(await computeUnpack(unpack2)).cadObjectsTypes,
		[
			CadGeometryType.FACE,
			CadGeometryType.FACE,
			CadGeometryType.FACE,
			CadGeometryType.FACE,
			CadGeometryType.FACE,
			CadGeometryType.FACE,
		],
		'types 2'
	);
	assert.deepEqual(
		(await computeUnpack(unpack3)).cadObjectsTypes,
		[
			CadGeometryType.WIRE,
			CadGeometryType.WIRE,
			CadGeometryType.WIRE,
			CadGeometryType.WIRE,
			CadGeometryType.WIRE,
			CadGeometryType.WIRE,
		],
		'types 3'
	);
	assert.deepEqual((await computeUnpack(unpack4)).cadObjectsTypes[0], CadGeometryType.EDGE, 'types 4');
	assert.deepEqual((await computeUnpack(unpack4)).cadObjectsTypes.length, 24, 'types 4');
	assert.deepEqual((await computeUnpack(unpack5)).cadObjectsTypes[0], CadGeometryType.VERTEX, 'types 5');
	assert.deepEqual((await computeUnpack(unpack5)).cadObjectsTypes.length, 48, 'types 5');
	assert.deepEqual((await computeUnpack(unpack6)).cadObjectsTypes, [], 'types 6');
});

}