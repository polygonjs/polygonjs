import {ModuleName} from '../../../../src/engine/poly/registers/modules/Common';

QUnit.test('SOP fileMulti simple', async (assert) => {
	const geo1 = window.geo1;

	const json0 = [{name: 'wolf'}];
	const json1 = [{name: 'dolphin'}];
	const json2 = [{name: 'wolf'}, {name: 'dolphin'}];
	const data1 = geo1.createNode('data');
	const fileMult1 = geo1.createNode('fileMulti');

	fileMult1.setInput(0, data1);

	data1.p.data.set(JSON.stringify(json0));
	let container = await fileMult1.compute();
	assert.equal(container.totalPointsCount(), 5352, 'total points_count is 5352');

	data1.p.data.set(JSON.stringify(json1));
	container = await fileMult1.compute();
	assert.equal(container.totalPointsCount(), 1404, 'total points_count is 1404');

	data1.p.data.set(JSON.stringify(json2));
	container = await fileMult1.compute();
	assert.equal(container.totalPointsCount(), 6756, 'total points_count is 6756');

	assert.deepEqual(await fileMult1.requiredModules(), [ModuleName.OBJLoader]);
});

QUnit.test('SOP fileMulti can use multiple times the same url', async (assert) => {
	const geo1 = window.geo1;

	const json = [{name: 'wolf'}, {name: 'dolphin'}, {name: 'wolf'}];
	const data1 = geo1.createNode('data');
	const fileMult1 = geo1.createNode('fileMulti');

	fileMult1.setInput(0, data1);

	data1.p.data.set(JSON.stringify(json));
	let container = await fileMult1.compute();
	assert.equal(container.totalPointsCount(), 12108, 'total points_count is 12108');
});
