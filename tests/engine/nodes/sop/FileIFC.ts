import type {QUnit} from '../../../helpers/QUnit';
// import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
// import {Poly} from '../../../../src/engine/Poly';
// import {withPlayerMode} from '../../../helpers/PlayerMode';
export function testenginenodessopFileIFC(qUnit: QUnit) {

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

async function withFile(path: string) {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('fileIFC');
	fileNode.p.url.set(_url(path));
	// fileNode.p.draco.set(1);

	const container = await fileNode.compute();
	return {container, fileNode};
}

// async function withFileAndHierarchy(path: string) {
// 	const geo1 = window.geo1;
// 	const fileNode = geo1.createNode('fileGLTF');
// 	fileNode.p.url.set(_url(path));
// 	fileNode.p.draco.set(1);

// 	const hierarchyNode = geo1.createNode('hierarchy');
// 	hierarchyNode.setMode(HierarchyMode.REMOVE_PARENT);
// 	hierarchyNode.setInput(0, fileNode);

// 	const container = await hierarchyNode.compute();
// 	return {container, fileNode, hierarchyNode};
// }

qUnit.test('sop/fileIFC simple', async (assert) => {
	const {container} = await withFile('models/ifc/rac_advanced_sample_project.ifc');
	assert.equal(container.totalPointsCount(), 1450993);
});

}