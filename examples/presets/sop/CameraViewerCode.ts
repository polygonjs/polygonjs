import {CameraViewerCodeSopNode} from '../../../src/engine/nodes/sop/CameraViewerCode';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {EXAMPLE_COLOR} from './CameraViewerCode/color';
import {EXAMPLE_DEVICE_ORIENTATION_PERMISSION} from './CameraViewerCode/deviceOrientationPermission';
import {EXAMPLE_SCROLL} from './CameraViewerCode/onScroll';

export enum CameraViewerCodePresetName {
	COLOR = 'color',
	DEVICE_ORIENTATION_PERMISSION = 'deviceOrientationPermission',
	ON_SCROLL = 'onScroll',
}
const cameraViewerCodeSopNodePresetsCollectionFactory: PresetsCollectionFactory<CameraViewerCodeSopNode> = (
	node: CameraViewerCodeSopNode
) => {
	const collection = new NodePresetsCollection();

	const basePresetNoShadowRoot = () => {
		const preset = new BasePreset().addEntry(node.p.viewerId, 'my-viewer');
		// preset.addEntry(node.p.shadowRoot, true)
		return preset;
	};
	// const basePresetNoShadowRoot = () => new BasePreset().addEntry(node.p.viewerId, 'my-viewer');

	const color = basePresetNoShadowRoot().addEntry(node.p.html, EXAMPLE_COLOR);
	const deviceOrientationPermission = basePresetNoShadowRoot().addEntry(
		node.p.html,
		EXAMPLE_DEVICE_ORIENTATION_PERMISSION
	);
	const onScroll = basePresetNoShadowRoot().addEntry(node.p.html, EXAMPLE_SCROLL);

	collection.setPresets({
		[CameraViewerCodePresetName.COLOR]: color,
		[CameraViewerCodePresetName.DEVICE_ORIENTATION_PERMISSION]: deviceOrientationPermission,
		[CameraViewerCodePresetName.ON_SCROLL]: onScroll,
	});
	return collection;
};
export const cameraViewerCodeSopPresetRegister: PresetRegister<
	typeof CameraViewerCodeSopNode,
	CameraViewerCodeSopNode
> = {
	nodeClass: CameraViewerCodeSopNode,
	setupFunc: cameraViewerCodeSopNodePresetsCollectionFactory,
};
