import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from './../../../../src/core/loader/AssetsUtils';
export function testengineexpressionsmethodsjoin(qUnit: QUnit) {
qUnit.test('expression/join with node path', async (assert) => {
	const geo1 = window.geo1;

	const url = `${ASSETS_ROOT}/models/resources/quaternius/animals/Alpaca.gltf`;
	const fileGLTF1 = geo1.createNode('fileGLTF');
	fileGLTF1.p.url.set(url);

	const text1 = geo1.createNode('text');

	const param = text1.p.text;
	param.set(`\`join(animationNames('${fileGLTF1.path()}'))\``);

	await param.compute();
	assert.equal(
		param.value,
		'Attack_Headbutt Attack_Kick Death Eating Gallop Gallop_Jump Idle Idle_2 Idle_Headlow Idle_HitReact1 Idle_HitReact2 Jump_toIdle Walk'
	);
});

}