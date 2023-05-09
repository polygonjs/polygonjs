// import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {BooleanParam} from '../../../../src/engine/params/Boolean';
// import {Poly} from '../../../../src/engine/Poly';
// import {withPlayerMode} from '../../../helpers/PlayerMode';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

async function withFile(path: string) {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('fileIFC');
	fileNode.p.url.set(_url(path));
	// fileNode.p.draco.set(1);

	const container = await fileNode.compute();
	return {container, fileNode, geo1};
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

QUnit.test('sop/IFCFilterCategories simple', async (assert) => {
	const {fileNode, geo1} = await withFile('models/ifc/rac_advanced_sample_project.ifc');

	const IFCFilterCategories1 = geo1.createNode('IFCFilterCategories');
	IFCFilterCategories1.setInput(0, fileNode);

	assert.equal(IFCFilterCategories1.params.spare_names.length, 0);
	await IFCFilterCategories1.p.getCategories.pressButton();

	let attemptsCount = 0;
	while (attemptsCount < 20 && IFCFilterCategories1.params.spare_names.length == 0) {
		await CoreSleep.sleep(200);
		attemptsCount++;
	}

	assert.equal(IFCFilterCategories1.params.spare_names.length, 22);
	assert.deepEqual(IFCFilterCategories1.params.spare_names.sort(), [
		'IFCBUILDING',
		'IFCBUILDINGELEMENTPROXY',
		'IFCBUILDINGSTOREY',
		'IFCCOLUMN',
		'IFCCOVERING',
		'IFCCURTAINWALL',
		'IFCDOOR',
		'IFCFLOWTERMINAL',
		'IFCFURNISHINGELEMENT',
		'IFCMEMBER',
		'IFCPLATE',
		'IFCPROJECT',
		'IFCRAILING',
		'IFCROOF',
		'IFCSITE',
		'IFCSLAB',
		'IFCSPACE',
		'IFCSTAIR',
		'IFCSTAIRFLIGHT',
		'IFCWALL',
		'IFCWALLSTANDARDCASE',
		'IFCWINDOW',
	]);

	async function getIndex() {
		const container = await IFCFilterCategories1.compute();
		const coreContent = container.coreContent();
		const object = coreContent?.threejsObjects()[0];
		const geometry = (object as Mesh).geometry;
		const index = geometry.getIndex();
		return index;
	}

	assert.equal((await getIndex())?.array.length, 0);

	(IFCFilterCategories1.params.get('IFCWALLSTANDARDCASE') as BooleanParam).set(true);
	assert.equal((await getIndex())?.array.length, 12516);

	(IFCFilterCategories1.params.get('IFCSTAIRFLIGHT') as BooleanParam).set(true);
	assert.equal((await getIndex())?.array.length, 36084);

	(IFCFilterCategories1.params.get('IFCWALLSTANDARDCASE') as BooleanParam).set(false);
	assert.equal((await getIndex())?.array.length, 23568);
});
