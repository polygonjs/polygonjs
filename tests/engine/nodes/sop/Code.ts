QUnit.test('sop/code simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const code1 = geo1.createNode('code');
	code1.setInput(0, box1);

	async function getPos() {
		let container = await code1.compute();
		const core_group = container.coreContent()!;
		return core_group.objectsWithGeo()[0].position;
	}
	assert.equal((await getPos()).y, 1);
});

QUnit.test('sop/code js changed', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const code1 = geo1.createNode('code');
	code1.setInput(0, box1);

	const newCode = `
	export class CodeSopProcessor extends BaseCodeSopProcessor {
		initializeProcessor(){
		}
		cook(inputCoreGroups){
			const inputCoreGroup = inputCoreGroups[0];
			const object = inputCoreGroup.objects()[0];
			object.position.y = 5;
			this.setCoreGroup(inputCoreGroup);
		}
	}
	`;
	code1.p.codeJavascript.set(newCode);

	async function getPos() {
		let container = await code1.compute();
		const core_group = container.coreContent()!;
		return core_group.objectsWithGeo()[0].position;
	}
	assert.equal((await getPos()).y, 5);
});
