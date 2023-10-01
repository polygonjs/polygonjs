/**
 * Creates Mapbox layers.
 *
 * @remarks
 *
 * This is best used with the Mapbox camera.
 *
 * See [sop/mapboxCamera](/docs/nodes/sop/mapboxCamera) for info on how to setup mapbox to use with Polygonjs
 *
 */
import {Object3D} from 'three';
import {CoreType} from '../../../core/Type';
import {FeatureConverter} from '../../../core/thirdParty/Mapbox/FeatureConverter';
import {NodeParamsConfig, ParamConfig} from '../../nodes/utils/params/ParamsConfig';
// import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/MapboxListener';
import {MapUtils} from '../../../core/MapUtils';
import {arrayChunk} from '../../../core/ArrayUtils';
import {TypedSopNode} from './_Base';
import {BaseNodeType} from '../_Base';
import {MapboxMapsController} from '../../../core/thirdParty/Mapbox/MapboxMapsController';
import {ParamType} from '../../poly/ParamType';
// const MULTILINESTRING = 'MultiLineString'
// const LINESTRING = 'LineString'

// const DEFAULT_LIST: Readonly<string> = [
// 	// 'road-motorway-trunk', // not found in prod, need to investigate
// 	'road-primary',
// 	'road-secondary-tertiary',
// 	'road-street',
// ].join(' ');

// use_bounds: false,
// update_always_allowed: false
class MapboxLayerSopParamsConfig extends NodeParamsConfig {
	/** @param names of layers to create */
	// layers = ParamConfig.STRING(DEFAULT_LIST);
	updateLayers = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			MapboxLayerSopNode.PARAM_CALLBACK_reload(node as MapboxLayerSopNode);
		},
	});
}
const ParamsConfig = new MapboxLayerSopParamsConfig();

export class MapboxLayerSopNode extends TypedSopNode<MapboxLayerSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'mapboxLayer';
	}

	override async cook() {
		const map = await MapboxMapsController.waitForMap();
		if (!map) {
			this.states.error.set('map not initialized yet');
			return;
		}
		const layerNames = this.params.spare.filter((param) => param.value == true).map((param) => param.name());
		// const layerNames = CoreString.attribNames(this.pv.layers);
		const existingLayerNames: string[] = [];

		for (const layerName of layerNames) {
			if (map.getLayer(layerName)) {
				existingLayerNames.push(layerName);
			} else {
				// const layers = first_map.getStyle().layers;
				this.states.error.set(`layer ${layerName} does not exist`);
				return;
			}
		}

		const features = map.queryRenderedFeatures(undefined, {
			layers: existingLayerNames,
		});

		const objects: Object3D[] = [];
		if (features) {
			const featuresByName = this._groupFeaturesByName(features);

			featuresByName.forEach((featuresForName, featureName) => {
				const converter = new FeatureConverter(this, featureName, featuresForName);
				const new_object = converter.createObject();
				if (new_object) {
					objects.push(new_object);
				}
			});
		}
		this.setObjects(objects);
	}

	private _featuresByName: Map<string, mapboxgl.MapboxGeoJSONFeature[]> = new Map();
	private _groupFeaturesByName(
		features: mapboxgl.MapboxGeoJSONFeature[]
	): Map<string, mapboxgl.MapboxGeoJSONFeature[]> {
		this._featuresByName.clear();
		for (const feature of features) {
			const name = this._feature_name(feature);
			if (name) {
				MapUtils.pushOnArrayAtEntry(this._featuresByName, name, feature);
			}
		}
		return this._featuresByName;
	}

	private _feature_name(feature: mapboxgl.MapboxGeoJSONFeature): string | undefined {
		const properties = feature['properties'];
		let name: string | undefined;
		if (properties) {
			name = properties['name'] || properties['name_en']; //|| Math.floor(Math.random()*100000000)
			if (name == null) {
				name = this._id_from_feature(feature);
			}
		}
		return name;
	}
	private _id_from_feature(feature: mapboxgl.MapboxGeoJSONFeature): string {
		const json_str = JSON.stringify(feature.geometry).replace(/{|}|"|:|\[|\]|,|\./g, '');
		const json_str_elements = json_str.split('');
		const letters_count = 30;
		const chunks = arrayChunk(json_str_elements, json_str_elements.length / letters_count);
		const first_elements = chunks.map((c) => c[0]);

		return first_elements.join('');
	}

	static PARAM_CALLBACK_reload(node: MapboxLayerSopNode) {
		node._paramCallbackReload();
	}
	private async _paramCallbackReload() {
		const map = await MapboxMapsController.waitForMap();
		const layers = map.getStyle().layers;
		const layerNames = layers.map((layer) => layer.id).sort();
		const currentSpareParams = this.params.spare;
		const currentValuesByName: Map<string, boolean> = new Map();
		for (const spareParam of currentSpareParams) {
			const value = spareParam.value;
			if (CoreType.isBoolean(value)) {
				currentValuesByName.set(spareParam.name(), value);
			}
		}
		this.params.updateParams({
			namesToDelete: currentSpareParams.map((p) => p.name()),
			toAdd: layerNames.map((layerName) => ({
				name: layerName,
				type: ParamType.BOOLEAN,
				initValue: currentValuesByName.get(layerName) || false,
				rawInput: currentValuesByName.get(layerName) || false,
				options: {spare: true},
			})),
		});
	}
}
