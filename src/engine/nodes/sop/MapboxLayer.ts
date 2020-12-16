/**
 * Creates Mapbox layers.
 *
 * @remarks
 * This is best used with the Mapbox camera.
 * Note that you will need a mapbox key to use this node.
 */
import lodash_chunk from 'lodash/chunk';
import {Object3D} from 'three/src/core/Object3D';
import {CoreString} from '../../../core/String';
import {FeatureConverter} from '../../../core/mapbox/FeatureConverter';

// const MULTILINESTRING = 'MultiLineString'
// const LINESTRING = 'LineString'

const DEFAULT_LIST: Readonly<string> = [
	// 'road-motorway-trunk', // not found in prod, need to investigate
	'road-primary',
	'road-secondary-tertiary',
	'road-street',
].join(' ');

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/mapbox/MapboxListener';
import {MapUtils} from '../../../core/MapUtils';
// use_bounds: false,
// update_always_allowed: false
class MapboxLayerSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
	/** @param names of layers to create */
	layers = ParamConfig.STRING(DEFAULT_LIST);
}
const ParamsConfig = new MapboxLayerSopParamsConfig();

export class MapboxLayerSopNode extends MapboxListenerSopNode<MapboxLayerSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mapbox_layer';
	}

	cook() {
		this._mapbox_listener.cook();
	}

	_post_init_controller() {
		if (!this._camera_node) {
			return;
		}
		const first_map = this._camera_node.first_map();
		if (first_map == null) {
			this.states.error.set('map not initialized yet');
			return;
		}
		const layer_names = CoreString.attrib_names(this.pv.layers);
		const existing_layer_names: string[] = [];
		for (let layer_name of layer_names) {
			if (first_map.getLayer(layer_name)) {
				existing_layer_names.push(layer_name);
			} else {
				// const layers = first_map.getStyle().layers;
				this.states.error.set(`layer ${layer_name} does not exist`);
				return;
			}
		}

		const features = first_map.queryRenderedFeatures(undefined, {
			layers: existing_layer_names,
		});

		const objects: Object3D[] = [];
		if (features) {
			const features_by_name = this._group_features_by_name(features);

			features_by_name.forEach((features_for_name, name) => {
				const converter = new FeatureConverter(this, name, features_for_name);
				const new_object = converter.create_object();
				if (new_object) {
					objects.push(new_object);
				}
			});
		}
		this.set_objects(objects);
	}

	private _features_by_name: Map<string, mapboxgl.MapboxGeoJSONFeature[]> = new Map();
	private _group_features_by_name(
		features: mapboxgl.MapboxGeoJSONFeature[]
	): Map<string, mapboxgl.MapboxGeoJSONFeature[]> {
		this._features_by_name.clear();
		features.forEach((feature) => {
			const name = this._feature_name(feature);
			if (name) {
				MapUtils.push_on_array_at_entry(this._features_by_name, name, feature);
			}
		});
		return this._features_by_name;
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
		const chunks = lodash_chunk(json_str_elements, json_str_elements.length / letters_count);
		const first_elements = chunks.map((c) => c[0]);

		return first_elements.join('');
	}
}
