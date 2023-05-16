import {Mesh} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {FloatParam} from '../../../../src/engine/params/Float';

QUnit.test('js/box3SetFromObject', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const globals1 = objectBuilder1.createNode('globals');
	const box3SetFromObject1 = objectBuilder1.createNode('box3SetFromObject');
	const getBox3Property1 = objectBuilder1.createNode('getBox3Property');

	output1.setInput('position', getBox3Property1, 'max');
	getBox3Property1.setInput(JsConnectionPointType.BOX3, box3SetFromObject1);

	async function getPosY() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return object.position.y;
	}

	assert.equal(await getPosY(), 0.5);
	box3SetFromObject1.setInput(JsConnectionPointType.OBJECT_3D, globals1);
	assert.equal(await getPosY(), 0.5);

	const multAdd1 = objectBuilder1.createNode('multAdd');
	multAdd1.setInput(0, getBox3Property1, 'max');
	output1.setInput('position', multAdd1);
	(multAdd1.params.get('mult') as FloatParam).set(2);
	assert.equal(await getPosY(), 1);
});
