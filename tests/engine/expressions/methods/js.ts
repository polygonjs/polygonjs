import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';

QUnit.test('expression js simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set("js('1+1')");

	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 2);

	const date = Date.now();
	box1.p.size.set("js('Date.now()')");
	await box1.p.size.compute();
	assert.more_than_or_equal(box1.p.size.value, date - 100);
	assert.in_delta(box1.p.size.value, date, 1000);

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();
	const geo2 = scene2.root.nodesByType('geo')[0];
	const box2 = geo2.nodesByType('box')[0];
	const date2 = Date.now();
	await box2.p.size.compute();
	assert.more_than_or_equal(box2.p.size.value, date2 - 100);
	assert.in_delta(box2.p.size.value, date2, 1000);
});
