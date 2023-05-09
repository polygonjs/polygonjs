import {OnKeyJsNode} from '../../../src/engine/nodes/js/OnKey';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const onKeyJsNodePresetsCollectionFactory: PresetsCollectionFactory<OnKeyJsNode> = (node: OnKeyJsNode) => {
	const collection = new NodePresetsCollection();

	const WASD_ARROWS = new BasePreset().addEntry(
		node.p.keyCodes,
		'Space ShiftLeft ShiftRight KeyW KeyA KeyS KeyD ArrowUp ArrowLeft ArrowDown ArrowRight'
	);
	const ARROWS = new BasePreset().addEntry(
		node.p.keyCodes,
		'Space ShiftLeft ShiftRight ArrowUp ArrowLeft ArrowDown ArrowRight'
	);
	const WASD = new BasePreset().addEntry(node.p.keyCodes, 'Space ShiftLeft ShiftRight KeyW KeyA KeyS KeyD');
	collection.setPresets({
		WASD_ARROWS,
		ARROWS,
		WASD,
	});

	return collection;
};
export const onKeyJsPresetRegister: PresetRegister<typeof OnKeyJsNode, OnKeyJsNode> = {
	nodeClass: OnKeyJsNode,
	setupFunc: onKeyJsNodePresetsCollectionFactory,
};
