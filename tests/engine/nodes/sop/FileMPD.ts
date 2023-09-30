import type {QUnit} from '../../../helpers/QUnit';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {ThreejsCoreObject} from '../../../../src/core/geometry/modules/three/ThreejsCoreObject';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {FileGLTFSopNode} from '../../../../src/engine/nodes/sop/FileGLTF';
import {FileMPDSopNode} from '../../../../src/engine/nodes/sop/FileMPD';
export function testenginenodessopFileMPD(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	async function withFileMPD(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileMPD');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	async function withHierarchy(fileNode: FileGLTFSopNode | FileMPDSopNode, levels: number = 1) {
		const hierarchy1 = window.geo1.createNode('hierarchy');
		const file1 = fileNode;
		hierarchy1.p.levels.set(levels);
		hierarchy1.setInput(0, file1);
		hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
		const container = await hierarchy1.compute();
		return container;
	}

	qUnit.test('SOP file Ldraw radar truck', async (assert) => {
		const {container, fileNode} = await withFileMPD('models/889-1-RadarTruck.mpd_Packed.mpd');
		assert.equal(container.coreContent()!.pointsCount(), 0);
		const container2 = await withHierarchy(fileNode, 3);
		assert.equal(container2.coreContent()!.pointsCount(), 75218);

		const objects1 = container.coreContent()?.threejsObjects()!;
		assert.equal(objects1?.length, 1);
		assert.equal(ThreejsCoreObject.attribValue(objects1[0], 'buildingStep') as number, 0, 'buildingStep 0');
		assert.equal(
			ThreejsCoreObject.attribValue(objects1[0].children[0], 'buildingStep') as number,
			1,
			'buildingStep 1'
		);
	});

	qUnit.test('SOP file Ldraw car', async (assert) => {
		const {container, fileNode} = await withFileMPD('models/ldraw/officialLibrary/models/car.ldr_Packed.mpd');
		assert.equal(container.coreContent()!.pointsCount(), 0);
		const container2 = await withHierarchy(fileNode, 3);
		assert.equal(container2.coreContent()!.pointsCount(), 4508);

		const objects1 = container.coreContent()?.threejsObjects()!;
		assert.equal(objects1.length, 1, '1 object');
		assert.equal(ThreejsCoreObject.attribValue(objects1[0], 'buildingStep') as number, 0, 'buildingStep 0');

		// const objects2 = container2.coreContent()?.objects()!;
		assert.equal(objects1[0].children?.length, 61, '61 objects');
		// console.log(objects1[0].children[0]);
		// assert.equal(CoreObject.attribValue(objects1[0].children[0], 'buildingStep') as number, 1, 'buildingStep 1');

		// assert.equal(
		// 	CoreObject.attribValue(objects1[0].children[0].children[0], 'buildingStep') as number,
		// 	2,
		// 	'buildingStep 2'
		// );
	});
}
