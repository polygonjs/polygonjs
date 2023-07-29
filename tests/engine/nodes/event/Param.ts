import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SetParamParamType} from '../../../../src/engine/nodes/event/SetParam';
export function testenginenodeseventParam(qUnit: QUnit) {

qUnit.test('event/param simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	const box1 = geo1.createNode('box');
	const boxWitness = geo1.createNode('box');

	const events1 = geo1.createNode('eventsNetwork');
	const param1 = events1.createNode('param');
	param1.p.param.set(box1.p.size.path());

	const setParam1 = events1.createNode('setParam');
	setParam1.p.param.set(boxWitness.p.size.path());
	setParam1.setParamType(SetParamParamType.NUMBER);
	setParam1.p.increment.set(1);
	setParam1.p.number.set(1);

	setParam1.setInput(0, param1);

	await CoreSleep.sleep(50);

	assert.equal(boxWitness.pv.size, 1);
	box1.p.size.set(2);
	await CoreSleep.sleep(50);
	assert.equal(boxWitness.pv.size, 2);
	box1.p.size.set(1);
	await CoreSleep.sleep(50);
	assert.equal(boxWitness.pv.size, 3);
});

qUnit.test('event/param works with params with an expression', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const boxWitness = geo1.createNode('box');
	await scene.waitForCooksCompleted();

	box1.p.size.set(`ch('${sphere1.path()}/radius')*2`);

	const events1 = scene.root().createNode('eventsNetwork');
	const param1 = events1.createNode('param');
	param1.p.param.set(box1.p.size.path());

	const setParam1 = events1.createNode('setParam');
	setParam1.p.param.set(boxWitness.p.size.path());
	setParam1.setParamType(SetParamParamType.NUMBER);
	setParam1.p.increment.set(1);
	setParam1.p.number.set(1);

	setParam1.setInput(0, param1);

	await CoreSleep.sleep(50);

	assert.equal(boxWitness.pv.size, 1);

	sphere1.p.radius.set(4);
	await CoreSleep.sleep(50);
	assert.equal(boxWitness.pv.size, 2);
	sphere1.p.radius.set(2);
	await CoreSleep.sleep(50);
	assert.equal(boxWitness.pv.size, 3);
});

}