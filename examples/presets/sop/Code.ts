// this preset works well with an input being a line with many points
const LINE_TWIST = `
const otherPos = new Vector3();
const currentPos = new Vector3();
const tangent = new Vector3();
const tangentOffset = new Vector3();
const normalVector = new Vector3();

export class CodeSopProcessor extends BaseCodeSopProcessor {
	override initializeProcessor() {}
	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];
		const objects = inputCoreGroup.objectsWithGeo();
		for (let object of objects) {
			this._processObject(object);
		}
		this.setCoreGroup(inputCoreGroup);
	}
	private _processObject(object: Object3DWithGeometry) {
		const geometry = object.geometry;
		const position = geometry.getAttribute('position');
		const restP = geometry.getAttribute('restP');
		if (!position) {
			return;
		}
		if (!restP) {
			return console.warn('no restP');
		}
		const {mult, twist} = this.pv;
		const restPArray = restP.array;
		const positionArray = position.array;
		const stride = 3;
		const pointsCount = position.count;
		for (let i = 0; i < pointsCount; i++) {
			if (i < pointsCount - 1) {
				currentPos.fromArray(restPArray, i * stride);
				otherPos.fromArray(restPArray, (i + 1) * stride);
				tangent.copy(currentPos).sub(otherPos);
			} else {
				currentPos.fromArray(restPArray, i * stride);
				otherPos.fromArray(restPArray, (i - 1) * stride);
				tangent.copy(otherPos).sub(currentPos);
			}
			tangent.normalize();
			tangentOffset.copy(tangent);
			tangentOffset.x += 0.1;
			tangentOffset.normalize();
			normalVector.crossVectors(tangentOffset, tangent);
			normalVector.normalize();
			normalVector.applyAxisAngle(tangent, i * twist);

			currentPos.add(normalVector.multiplyScalar(mult));
			currentPos.toArray(positionArray, i * stride);
		}
	}
}
`;

import {CodeSopNode} from '../../../src/engine/nodes/sop/Code';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const codeSopNodePresetsCollectionFactory: PresetsCollectionFactory<CodeSopNode> = (node: CodeSopNode) => {
	const collection = new NodePresetsCollection();

	const lineTwist = new BasePreset().addEntry(node.p.codeTypescript, LINE_TWIST);
	collection.setPresets({
		lineTwist,
	});

	return collection;
};
export const codeSopPresetRegister: PresetRegister<typeof CodeSopNode, CodeSopNode> = {
	nodeClass: CodeSopNode,
	setupFunc: codeSopNodePresetsCollectionFactory,
};
