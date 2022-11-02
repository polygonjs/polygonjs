import {Mesh} from 'three/src/objects/Mesh.js';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {_dataUrlUrl} from './DataUrl';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

QUnit.test('sop/fileJSON simple', async (assert) => {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('fileJSON');
	fileNode.p.url.set(_url('/models/threejs/scatteredBoxes.json'));
	console.log(fileNode.p.url.value);
	const container = await fileNode.compute();
	assert.notOk(fileNode.states.error.active());
	assert.equal(container.coreContent()!.objects()[0].children.length, 4);
	assert.equal(
		(container.coreContent()!.objects()[0].children[0].children[1].children[0] as Mesh).geometry.attributes.position
			.count,
		240
	);
});

QUnit.test('sop/fileJSON has a meaningful error when loading a non-threejs json', async (assert) => {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('fileJSON');
	fileNode.p.url.set(_dataUrlUrl('default.json'));
	const container = await fileNode.compute();
	assert.notOk(container.coreContent());
	assert.ok(fileNode.states.error.active());
	assert.includes(
		fileNode.states.error.message()!,
		'Are you sure you did not mean to use the sop/dataUrl node instead?'
	);
});
