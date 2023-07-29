import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopFileMultiOBJ(qUnit: QUnit) {
qUnit.test('SOP fileMultiOBJ simple', async (assert) => {
	const geo1 = window.geo1;

	const json0 = [{name: 'wolf'}];
	const json1 = [{name: 'dolphin'}];
	const json2 = [{name: 'wolf'}, {name: 'dolphin'}];
	const data1 = geo1.createNode('data');
	const fileMultOBJ1 = geo1.createNode('fileMultiOBJ');

	fileMultOBJ1.setInput(0, data1);

	data1.p.data.set(JSON.stringify(json0));
	let container = await fileMultOBJ1.compute();
	assert.equal(container.totalPointsCount(), 5352, 'total points_count is 5352');

	data1.p.data.set(JSON.stringify(json1));
	container = await fileMultOBJ1.compute();
	assert.equal(container.totalPointsCount(), 1404, 'total points_count is 1404');

	data1.p.data.set(JSON.stringify(json2));
	container = await fileMultOBJ1.compute();
	assert.equal(container.totalPointsCount(), 6756, 'total points_count is 6756');
});

qUnit.test('SOP fileMultiOBJ can use multiple times the same url', async (assert) => {
	const geo1 = window.geo1;

	const json = [{name: 'wolf'}, {name: 'dolphin'}, {name: 'wolf'}];
	const data1 = geo1.createNode('data');
	const fileMultOBJ1 = geo1.createNode('fileMultiOBJ');

	fileMultOBJ1.setInput(0, data1);

	data1.p.data.set(JSON.stringify(json));
	let container = await fileMultOBJ1.compute();
	assert.equal(container.totalPointsCount(), 12108, 'total points_count is 12108');
});

}