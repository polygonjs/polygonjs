import type {QUnit} from '../../helpers/QUnit';
import {AttribClass} from '../../../src/core/geometry/Constant';
export function testcoregeometryGroup(qUnit: QUnit) {

qUnit.test('geoAttribNamesMatchingMask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');

	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.p.name.set('blend');
	attribCreate1.setInput(0, box1);

	const attribCreate2 = geo1.createNode('attribCreate');
	attribCreate2.p.name.set('blend2');
	attribCreate2.setInput(0, attribCreate1);

	const attribCreate3 = geo1.createNode('attribCreate');
	attribCreate3.p.name.set('restP');
	attribCreate3.setInput(0, attribCreate2);

	const container = await attribCreate3.compute();
	const coreGroup = container.coreContent()!;

	assert.deepEqual(
		coreGroup.geoAttribNames().sort(),
		['position', 'normal', 'uv', 'blend', 'blend2', 'restP'].sort()
	);
	assert.deepEqual(coreGroup.geoAttribNamesMatchingMask('blend*').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(coreGroup.geoAttribNamesMatchingMask('pos*').sort(), ['position'].sort());
	assert.deepEqual(coreGroup.geoAttribNamesMatchingMask('pos').sort(), [].sort());
	assert.deepEqual(coreGroup.geoAttribNamesMatchingMask('blend*,pos').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(
		coreGroup.geoAttribNamesMatchingMask('blend*,pos*').sort(),
		['blend', 'blend2', 'position'].sort()
	);
});

qUnit.test('objectAttribNamesMatchingMask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');

	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.p.name.set('blend');
	attribCreate1.setInput(0, box1);

	const attribCreate2 = geo1.createNode('attribCreate');
	attribCreate2.p.name.set('blend2');
	attribCreate2.setInput(0, attribCreate1);

	const attribCreate3 = geo1.createNode('attribCreate');
	attribCreate3.p.name.set('restP');
	attribCreate3.setInput(0, attribCreate2);

	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate2.setAttribClass(AttribClass.OBJECT);
	attribCreate3.setAttribClass(AttribClass.OBJECT);

	const container = await attribCreate3.compute();
	const coreGroup = container.coreContent()!;

	assert.deepEqual(coreGroup.objectAttribNames().sort(), ['blend', 'blend2', 'restP'].sort());
	assert.deepEqual(coreGroup.objectAttribNamesMatchingMask('blend*').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(coreGroup.objectAttribNamesMatchingMask('pos*').sort(), [].sort());
	assert.deepEqual(coreGroup.objectAttribNamesMatchingMask('pos').sort(), [].sort());
	assert.deepEqual(coreGroup.objectAttribNamesMatchingMask('blend*,pos').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(coreGroup.objectAttribNamesMatchingMask('blend*,pos*').sort(), ['blend', 'blend2'].sort());
});

qUnit.test('coreGroupAttribNamesMatchingMask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');

	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.p.name.set('blend');
	attribCreate1.setInput(0, box1);

	const attribCreate2 = geo1.createNode('attribCreate');
	attribCreate2.p.name.set('blend2');
	attribCreate2.setInput(0, attribCreate1);

	const attribCreate3 = geo1.createNode('attribCreate');
	attribCreate3.p.name.set('restP');
	attribCreate3.setInput(0, attribCreate2);

	attribCreate1.setAttribClass(AttribClass.CORE_GROUP);
	attribCreate2.setAttribClass(AttribClass.CORE_GROUP);
	attribCreate3.setAttribClass(AttribClass.CORE_GROUP);

	const container = await attribCreate3.compute();
	const coreGroup = container.coreContent()!;

	assert.deepEqual(coreGroup.attribNames().sort(), ['blend', 'blend2', 'restP'].sort());
	assert.deepEqual(coreGroup.attribNamesMatchingMask('blend*').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(coreGroup.attribNamesMatchingMask('pos*').sort(), [].sort());
	assert.deepEqual(coreGroup.attribNamesMatchingMask('pos').sort(), [].sort());
	assert.deepEqual(coreGroup.attribNamesMatchingMask('blend*,pos').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(coreGroup.attribNamesMatchingMask('blend*,pos*').sort(), ['blend', 'blend2'].sort());
});

}