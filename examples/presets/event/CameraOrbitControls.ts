import {
	CameraOrbitControlsEventNode,
	MOUSE_CONTROLS,
	MouseControl,
} from '../../../src/engine/nodes/event/CameraOrbitControls';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const cameraOrbitControlsEventNodePresetsCollectionFactory: PresetsCollectionFactory<CameraOrbitControlsEventNode> = (
	node: CameraOrbitControlsEventNode
) => {
	const collection = new NodePresetsCollection();

	const houdini = new BasePreset()
		.addEntry(node.p.middleMouseButton, MOUSE_CONTROLS.indexOf(MouseControl.PAN))
		.addEntry(node.p.rightMouseButton, MOUSE_CONTROLS.indexOf(MouseControl.DOLLY));
	const threejs = new BasePreset()
		.addEntry(node.p.middleMouseButton, MOUSE_CONTROLS.indexOf(MouseControl.DOLLY))
		.addEntry(node.p.rightMouseButton, MOUSE_CONTROLS.indexOf(MouseControl.PAN));

	collection.setPresets({
		houdini,
		threejs,
	});

	return collection;
};
export const cameraOrbitControlsEventPresetRegister: PresetRegister<
	typeof CameraOrbitControlsEventNode,
	CameraOrbitControlsEventNode
> = {
	nodeClass: CameraOrbitControlsEventNode,
	setupFunc: cameraOrbitControlsEventNodePresetsCollectionFactory,
};
