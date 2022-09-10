import {BaseGlNodeType} from '../../../../src/engine/nodes/gl/_Base';
import {checkConsolePrints} from '../../../helpers/Console';

QUnit.test('gl nodes cannot create cycles', async (assert) => {
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');

	const SDFTwist1 = meshBasicBuilder1.createNode('SDFTwist');
	const SDFBox1 = meshBasicBuilder1.createNode('SDFBox');

	SDFBox1.setInput('position', SDFTwist1);
	assert.deepEqual(
		SDFBox1.io.inputs.inputs().map((n: BaseGlNodeType | null) => n?.graphNodeId()),
		[SDFTwist1.graphNodeId()]
	);

	assert.ok(SDFTwist1.io.inputs.getNamedInputIndex('twist'), 'SDFTwist does have an input called twist');
	assert.deepEqual(
		SDFTwist1.io.inputs.inputs().map((n: BaseGlNodeType | null) => n?.graphNodeId()),
		[]
	);
	const consoleHistory = await checkConsolePrints(async () => {
		SDFTwist1.setInput('twist', SDFBox1);
	});
	assert.deepEqual(
		SDFTwist1.io.inputs.inputs().map((n: BaseGlNodeType | null) => n?.graphNodeId()),
		[],
		'connection was successfully avoided'
	);
	assert.equal(consoleHistory.warn.length, 1, '1 warning');
	assert.equal(
		consoleHistory.warn[0][0],
		'cannot connect /MAT/meshBasicBuilder1/SDFBox1 to /MAT/meshBasicBuilder1/SDFTwist1',
		'1 warning'
	);
});
