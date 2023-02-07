import {MapboxSatelliteCopNode} from '../../../src/engine/nodes/cop/MapboxSatellite';
import {NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {mapboxCollection} from '../common/mapbox/MapboxCopCommon';

const mapboxSatelliteCopNodePresetsCollectionFactory: PresetsCollectionFactory<MapboxSatelliteCopNode> = (
	node: MapboxSatelliteCopNode
) => {
	const collection = new NodePresetsCollection();

	collection.setPresets(mapboxCollection(node));

	return collection;
};
export const mapboxSatelliteCopPresetRegister: PresetRegister<typeof MapboxSatelliteCopNode, MapboxSatelliteCopNode> = {
	nodeClass: MapboxSatelliteCopNode,
	setupFunc: mapboxSatelliteCopNodePresetsCollectionFactory,
};
