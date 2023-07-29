import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopFileMultiGLTF(qUnit: QUnit) {
qUnit.test('SOP fileMultiGLTF simple', async (assert) => {
	const geo1 = window.geo1;

	const json0 = [{name: 'horse'}];
	const json1 = [{name: 'sphere_with_texture'}];
	const json2 = [{name: 'horse'}, {name: 'sphere_with_texture'}];
	const data1 = geo1.createNode('data');
	const fileMultiGLTF1 = geo1.createNode('fileMultiGLTF');

	fileMultiGLTF1.setInput(0, data1);

	data1.p.data.set(JSON.stringify(json0));
	let container = await fileMultiGLTF1.compute();
	assert.equal(container.totalPointsCount(), 796, 'total points_count is 5352');

	data1.p.data.set(JSON.stringify(json1));
	container = await fileMultiGLTF1.compute();
	assert.equal(container.totalPointsCount(), 1728, 'total points_count is 1404');

	data1.p.data.set(JSON.stringify(json2));
	container = await fileMultiGLTF1.compute();
	assert.equal(container.totalPointsCount(), 2524, 'total points_count is 6756');
});

qUnit.test('SOP fileMultiGLTF can use multiple times the same url', async (assert) => {
	const geo1 = window.geo1;

	const json = [{name: 'horse'}, {name: 'sphere_with_texture'}, {name: 'horse'}];
	const data1 = geo1.createNode('data');
	const fileMultiGLTF1 = geo1.createNode('fileMultiGLTF');

	fileMultiGLTF1.setInput(0, data1);

	data1.p.data.set(JSON.stringify(json));
	let container = await fileMultiGLTF1.compute();
	assert.equal(container.totalPointsCount(), 3320, 'total points_count is 12108');
});

}