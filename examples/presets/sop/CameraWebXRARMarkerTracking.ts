import {CameraWebXRARMarkerTrackingSopNode} from '../../../src/engine/nodes/sop/CameraWebXRARMarkerTracking';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

import {
	// MarkerTrackingControllerConfig,
	MarkerTrackingSourceMode,
	MARKER_TRACKING_SOURCE_MODES,
	// MARKER_TRACKING_TRANSFORM_MODES,
	// MarkerTrackingTransformMode,
} from '../../../src/core/webXR/markerTracking/Common';
import {ASSETS_ROOT} from '../../../src/core/loader/AssetsUtils';
import {sanitizeUrl} from '../../../src/core/UrlHelper';

const cameraWebXRARMarkerTrackingSopNodePresetsCollectionFactory: PresetsCollectionFactory<
	CameraWebXRARMarkerTrackingSopNode
> = (node: CameraWebXRARMarkerTrackingSopNode) => {
	const collection = new NodePresetsCollection();

	const videoUrl = sanitizeUrl(`${ASSETS_ROOT}/textures/markertracking/marker_tracking1.mp4`);
	const imageUrl = sanitizeUrl(`${ASSETS_ROOT}/textures/markertracking/marker_tracking1.png`);

	const webcam = new BasePreset().addEntry(
		node.p.sourceMode,
		MARKER_TRACKING_SOURCE_MODES.indexOf(MarkerTrackingSourceMode.WEBCAM)
	);
	const videoSample = new BasePreset()
		.addEntry(node.p.sourceMode, MARKER_TRACKING_SOURCE_MODES.indexOf(MarkerTrackingSourceMode.VIDEO))
		.addEntry(node.p.sourceUrl, `\`blob('${videoUrl}')\``);
	const imageSample = new BasePreset()
		.addEntry(node.p.sourceMode, MARKER_TRACKING_SOURCE_MODES.indexOf(MarkerTrackingSourceMode.IMAGE))
		.addEntry(node.p.sourceUrl, `\`blob('${imageUrl}')\``);
	collection.setPresets({
		videoSample,
		imageSample,
		webcam,
	});

	return collection;
};
export const cameraWebXRARMarkerTrackingSopPresetRegister: PresetRegister<
	typeof CameraWebXRARMarkerTrackingSopNode,
	CameraWebXRARMarkerTrackingSopNode
> = {
	nodeClass: CameraWebXRARMarkerTrackingSopNode,
	setupFunc: cameraWebXRARMarkerTrackingSopNodePresetsCollectionFactory,
};
