import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {totalPointsCount} from '../../../../src/engine/containers/utils/GeometryContainerUtils';
import {InstancedMesh, Mesh} from 'three';
export function testenginenodessopFileIFC(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	async function withFile(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileIFC');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	qUnit.test('sop/fileIFC simple', async (assert) => {
		const {fileNode, container} = await withFile('models/ifc/rac_advanced_sample_project.ifc');
		assert.equal(totalPointsCount(container), 717228);

		const foundCategories = fileNode.p.foundCategories.value;
		assert.equal(
			foundCategories,
			'IFCPROJECT IFCBUILDING IFCBUILDINGSTOREY IFCSITE IFCBUILDINGELEMENTPROXY IFCSPACE IFCSLAB IFCOPENINGELEMENT IFCWALLSTANDARDCASE IFCCURTAINWALL IFCPLATE IFCMEMBER IFCDOOR IFCROOF IFCCOLUMN IFCWALL IFCWINDOW IFCCOVERING IFCSTAIRFLIGHT IFCSTAIR IFCFURNISHINGELEMENT IFCFLOWTERMINAL IFCRAILING'
		);

		async function getPointsCount() {
			const container2 = await fileNode.compute();
			return {
				pointsCount: totalPointsCount(container2),
			};
		}

		fileNode.p.includedCategories.set('IFCWALLSTANDARDCASE');
		assert.equal((await getPointsCount()).pointsCount, 14637);

		// check that the output can be cloned
		const transform1 = window.geo1.createNode('transform');
		transform1.setInput(0, fileNode);
		const containerTransform1 = await transform1.compute();
		assert.equal(await totalPointsCount(containerTransform1), 14637);
		assert.equal(containerTransform1.coreContent()!.threejsObjects()[0].children.length, 4, '4 objects');
		assert.ok(
			(containerTransform1.coreContent()!.threejsObjects()[0].children[0] as InstancedMesh).isInstancedMesh,
			'isInstancedMesh'
		);

		// check that we can use an instancedMeshToMesh
		const instancedMeshToMesh1 = window.geo1.createNode('instancedMeshToMesh');
		instancedMeshToMesh1.setInput(0, fileNode);
		const containerInstancedMeshTomesh = await instancedMeshToMesh1.compute();
		assert.equal(await totalPointsCount(containerInstancedMeshTomesh), 15213);
		assert.equal(containerInstancedMeshTomesh.coreContent()!.threejsObjects()[0].children.length, 20, '20 objects');
		assert.notOk(
			(containerInstancedMeshTomesh.coreContent()!.threejsObjects()[0].children[0] as InstancedMesh)
				.isInstancedMesh,
			'not isInstancedMesh'
		);
		assert.ok(
			(containerInstancedMeshTomesh.coreContent()!.threejsObjects()[0].children[0] as Mesh).isMesh,
			'isMesh'
		);

		fileNode.p.includedCategories.set('* ^IFCWALLSTANDARDCASE');
		assert.equal((await getPointsCount()).pointsCount, 702627);

		fileNode.p.includedCategories.set('* ^IFCSTAIRFLIGHT');
		assert.equal((await getPointsCount()).pointsCount, 707604);

		fileNode.p.includedCategories.set('* ^IFCSTAIRFLIGHT ^IFCWALLSTANDARDCASE');
		assert.equal((await getPointsCount()).pointsCount, 693003);
	});
}
