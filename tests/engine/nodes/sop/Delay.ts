import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopDelay(qUnit: QUnit) {
qUnit.test('delay simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const delay1 = geo1.createNode('delay');

	await scene.root().processQueue();

	delay1.setInput(0, box1);

	let start_time: number, total_time: number;

	delay1.p.duration.set(200);
	start_time = performance.now();
	await delay1.compute();
	total_time = performance.now() - start_time;
	assert.more_than(total_time, 190);
	assert.less_than(total_time, 300);

	delay1.p.duration.set(100);
	start_time = performance.now();
	await delay1.compute();
	total_time = performance.now() - start_time;
	assert.more_than(total_time, 90);
	assert.less_than(total_time, 200);
});

}