import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
export function testenginenodesjsQuaternionAngleTo(qUnit: QUnit) {

qUnit.test('js/quaternionAngleTo', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const floatToVec3_1 = objectBuilder1.createNode('floatToVec3');
	const quaternionAngleTo1 = objectBuilder1.createNode('quaternionAngleTo');
	const quaternion1 = objectBuilder1.createNode('quaternion');
	const quaternion2 = objectBuilder1.createNode('quaternion');

	output1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput(0, quaternionAngleTo1);
	quaternionAngleTo1.setInput(0, quaternion1);
	quaternionAngleTo1.setInput(1, quaternion2);

	async function getPosX() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return object.position.x;
	}

	assert.equal(await getPosX(), 0);
	quaternion2.p.angle.set(Math.PI * 0.25);
	assert.in_delta(await getPosX(), Math.PI * 0.25, 0.00001);
});

}