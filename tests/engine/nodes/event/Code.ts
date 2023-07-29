import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodeseventCode(qUnit: QUnit) {

qUnit.test('event code simple', async (assert) => {
	const geo1 = window.geo1;
	const eventsNetwork1 = geo1.createNode('eventsNetwork');

	const box1 = geo1.createNode('box');

	const button1 = eventsNetwork1.createNode('button');
	const code1 = eventsNetwork1.createNode('code');
	const setParam1 = eventsNetwork1.createNode('setParam');

	code1.setInput(0, button1);
	setParam1.setInput(0, code1);

	setParam1.p.param.setParam(box1.p.divisions.x);
	setParam1.p.number.set(10);

	button1.p.dispatch.pressButton();
	await CoreSleep.sleep(200);
	assert.equal(box1.p.divisions.x.value, 10);
});

}