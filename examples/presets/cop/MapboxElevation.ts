import {MapboxElevationCopNode} from '../../../src/engine/nodes/cop/MapboxElevation';
import {NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {mapboxCollection} from '../common/mapbox/MapboxCopCommon';

const mapboxElevationCopNodePresetsCollectionFactory: PresetsCollectionFactory<MapboxElevationCopNode> = (
	node: MapboxElevationCopNode
) => {
	const collection = new NodePresetsCollection();

	collection.setPresets(mapboxCollection(node));

	return collection;
};
export const mapboxElevationCopPresetRegister: PresetRegister<typeof MapboxElevationCopNode, MapboxElevationCopNode> = {
	nodeClass: MapboxElevationCopNode,
	setupFunc: mapboxElevationCopNodePresetsCollectionFactory,
};
