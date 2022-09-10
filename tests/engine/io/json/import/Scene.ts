import {BlendFunction} from 'postprocessing';
import {OutlinePostNode} from './../../../../../src/engine/nodes/post/Outline';
import {SceneJsonImporter} from './../../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from './../../../../../src/engine/io/json/export/Scene';

QUnit.test('io/import/json/Scene detects versions correctly', async (assert) => {
	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	data.properties!.versions = {
		polygonjs: '1.2.9',
	};

	const importer = new SceneJsonImporter(data);
	assert.ok(importer.isPolygonjsVersionLessThan('1.2.10'));
	assert.ok(importer.isPolygonjsVersionLessThan('1.3.9'));
	assert.ok(importer.isPolygonjsVersionLessThan('2.1.9'));
	assert.notOk(importer.isPolygonjsVersionLessThan('1.2.8'));
	assert.notOk(importer.isPolygonjsVersionLessThan('1.1.10'));
	assert.notOk(importer.isPolygonjsVersionLessThan('0.2.9'));
});

QUnit.test('io/import/json/Scene migrates old post node blend function', async (assert) => {
	const scene = window.scene;

	const postProcessNetwork1 = scene.createNode('postProcessNetwork');
	const outline1 = postProcessNetwork1.createNode('outline');
	outline1.p.blendFunction.set(2); // ALPHA for polygonjs version 1.2.10

	const data = new SceneJsonExporter(scene).data();
	data.properties!.versions = {
		polygonjs: '1.2.10',
	};
	const scene2 = await SceneJsonImporter.loadData(data);

	const outline2 = scene2.node(outline1.path()) as OutlinePostNode;
	assert.equal(outline2.pv.blendFunction, BlendFunction.ALPHA);
});
