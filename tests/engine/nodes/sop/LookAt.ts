import {Quaternion, Vector3} from 'three';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

const t = new Vector3();
const q = new Quaternion();
const s = new Vector3();
async function getObject(node: BaseSopNodeType): Promise<Quaternion> {
	const container = await node.compute();
	const coreGroup = container.coreContent()!;
	const object = coreGroup.objects()[0];
	object.updateMatrix();
	object.matrix.decompose(t, q, s);
	return q.clone();
}

QUnit.test('sop/lookAt simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const lookAt1 = geo1.createNode('lookAt');

	const initQuat = await getObject(box1);

	lookAt1.setInput(0, box1);

	lookAt1.p.target.set([1, 1, 1]);
	assert.in_delta(initQuat.angleTo(await getObject(lookAt1)), 1, 0.05);

	lookAt1.p.lerp.set(0.5);
	assert.in_delta(initQuat.angleTo(await getObject(lookAt1)), 0.5, 0.05);
});
