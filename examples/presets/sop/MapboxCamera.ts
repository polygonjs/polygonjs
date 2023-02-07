import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {MapboxCameraSopNode} from '../../../src/engine/nodes/sop/MapboxCamera';
import {mapboxCollection} from '../common/mapbox/MapboxCopCommon';
const mapboxCameraSopNodePresetsCollectionFactory: PresetsCollectionFactory<MapboxCameraSopNode> = (
	node: MapboxCameraSopNode
) => {
	const collection = new NodePresetsCollection();

	function setStyle(preset: BasePreset, url: string) {
		return preset.addEntry<ParamType.STRING>(node.p.style, url);
	}
	function style(url: string) {
		return setStyle(new BasePreset(), url);
	}

	const dark = style('mapbox://styles/mapbox/dark-v11');
	const streets = style('mapbox://styles/mapbox/streets-v12');
	const outdoors = style('mapbox://styles/mapbox/outdoors-v12');
	const light = style('mapbox://styles/mapbox/light-v11');
	const satellite = style('mapbox://styles/mapbox/satellite-v9');
	const satelliteStreets = style('mapbox://styles/mapbox/satellite-streets-v12');
	const navigationDay = style('mapbox://styles/mapbox/navigation-day-v1');
	const navigationNight = style('mapbox://styles/mapbox/navigation-night-v1');

	const styles = {
		dark,
		streets,
		outdoors,
		light,
		satellite,
		satelliteStreets,
		navigationDay,
		navigationNight,
	};
	const styleNames = Object.keys(styles);
	const stylesAsSubCategory: Record<string, BasePreset> = {};
	for (let styleName of styleNames) {
		stylesAsSubCategory[`style/${styleName}`] = (styles as any)[styleName as any];
	}

	const locationPresets = mapboxCollection(node);
	const locationNames = Object.keys(locationPresets);
	const locationsAsSubCategory: Record<string, BasePreset> = {};
	for (let locationName of locationNames) {
		locationsAsSubCategory[`location/${locationName}`] = (locationPresets as any)[locationName as any];
	}

	collection.setPresets({...stylesAsSubCategory, ...locationsAsSubCategory});

	return collection;
};

export const mapboxCameraSopPresetRegister: PresetRegister<typeof MapboxCameraSopNode, MapboxCameraSopNode> = {
	nodeClass: MapboxCameraSopNode,
	setupFunc: mapboxCameraSopNodePresetsCollectionFactory,
};
