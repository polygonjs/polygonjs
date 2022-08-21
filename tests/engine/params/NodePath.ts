import {IntegerParam} from './../../../src/engine/params/Integer';
import {ParamType} from '../../../src/engine/poly/ParamType';

QUnit.test('param/nodePath: expression simple', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;
	const meshBasic1 = MAT.createNode('meshBasic');
	const plane1 = geo1.createNode('plane');
	const material1 = geo1.createNode('material');
	const material2 = geo1.createNode('material');
	material1.setInput(0, plane1);
	material2.setInput(0, plane1);

	material1.p.material.setNode(meshBasic1);
	material2.p.material.set(`\`chsop("${material1.p.material.path()}")\``);

	await material1.p.material.compute();
	await material2.p.material.compute();

	assert.equal(material1.pv.material.node()?.graphNodeId(), meshBasic1.graphNodeId());
	assert.equal(material2.pv.material.node()?.graphNodeId(), meshBasic1.graphNodeId());
});

QUnit.test('param/nodePath: expression referring spare param', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;
	const meshBasic1 = MAT.createNode('meshBasic');
	const meshBasic2 = MAT.createNode('meshBasic');
	const meshBasic3 = MAT.createNode('meshBasic');

	assert.equal(meshBasic1.name(), 'meshBasic1');
	assert.equal(meshBasic2.name(), 'meshBasic2');
	assert.equal(meshBasic3.name(), 'meshBasic3');

	const plane1 = geo1.createNode('plane');
	const material1 = geo1.createNode('material');
	material1.setInput(0, plane1);

	material1.params.updateParams({
		toAdd: [
			{
				name: 'i',
				type: ParamType.INTEGER,
				initValue: 1,
				rawInput: 1,
			},
		],
	});

	material1.p.material.set("/MAT/meshBasic`ch('i')`");

	await material1.p.material.compute();
	assert.equal(material1.pv.material.node()?.graphNodeId(), meshBasic1.graphNodeId());

	(material1.params.get('i') as IntegerParam).set(2);
	await material1.p.material.compute();
	assert.equal(material1.pv.material.node()?.graphNodeId(), meshBasic2.graphNodeId());

	(material1.params.get('i') as IntegerParam).set(3);
	await material1.p.material.compute();
	assert.equal(material1.pv.material.node()?.graphNodeId(), meshBasic3.graphNodeId());

	(material1.params.get('i') as IntegerParam).set(4);
	await material1.p.material.compute();
	assert.notOk(material1.pv.material.node()?.graphNodeId());

	(material1.params.get('i') as IntegerParam).set(1);
	await material1.p.material.compute();
	assert.equal(material1.pv.material.node()?.graphNodeId(), meshBasic1.graphNodeId());
});
