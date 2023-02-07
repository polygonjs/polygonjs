/**
 * Creates a mapbox camera.
 *
 * @remarks
 *
 * In order to use Mapbox inside Polygons, you need to add your Mapbox token.
 *
 * This is done by adding the following line inside your `PolyConfig.ts` file:
 *
 * ``` ts
 * Poly.thirdParty.mapbox().setToken('<your token>');
 * ```
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MapboxCameraSopOperation} from '../../operations/sop/MapboxCamera';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType} from '../../poly/NodeContext';
import {registerMapboxCamera} from '../../../core/thirdParty/Mapbox/registerMapboxCamera';
import {MapboxMapsController} from '../../../core/thirdParty/Mapbox/MapboxMapsController';
import {BaseNodeType} from '../_Base';
const DEFAULT = MapboxCameraSopOperation.DEFAULT_PARAMS;
class MapboxCameraSopParamsConfig extends NodeParamsConfig {
	style = ParamConfig.STRING(DEFAULT.style);
	/** @param longitude */
	longitude = ParamConfig.FLOAT(-0.07956, {
		range: [-360, 360],
	});
	/** @param latitude */
	latitude = ParamConfig.FLOAT(51.5146, {
		range: [-90, 90],
	});

	pitch = ParamConfig.FLOAT(DEFAULT.pitch, {
		range: [0, 85],
		rangeLocked: [true, true],
	});
	bearing = ParamConfig.FLOAT(DEFAULT.bearing, {
		range: [0, 360],
	});
	zoom = ParamConfig.FLOAT(DEFAULT.zoom, {
		range: [0, 24],
		rangeLocked: [true, true],
	});
	minZoom = ParamConfig.FLOAT(DEFAULT.minZoom, {
		range: [0, 24],
		rangeLocked: [true, true],
	});
	maxZoom = ParamConfig.FLOAT(DEFAULT.maxZoom, {
		range: [0, 24],
		rangeLocked: [true, true],
	});
	// updateParamsFromMap = ParamConfig.BUTTON(null, {
	// 	label: 'Set Navigation Params as Default',
	// 	callback: (node: BaseNodeType, param: BaseParamType) => {
	// 		MapboxCameraSopNode.PARAM_CALLBACK_update_params_from_map(node as MapboxCameraObjNode);
	// 	},
	// });
	allowDragRotate = ParamConfig.BOOLEAN(DEFAULT.allowDragRotate);
	addZoomControl = ParamConfig.BOOLEAN(DEFAULT.addZoomControl);
	tlayerBuildings = ParamConfig.BOOLEAN(DEFAULT.tlayerBuildings);
	tlayer3D = ParamConfig.BOOLEAN(DEFAULT.tlayer3D);
	tlayerSky = ParamConfig.BOOLEAN(DEFAULT.tlayerSky);
	/** @param camera name */
	name = ParamConfig.STRING('`$OS`');
	updateFromMap = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			MapboxCameraSopNode.PARAM_CALLBACK_updateFromMap(node as MapboxCameraSopNode);
		},
	});
}
const ParamsConfig = new MapboxCameraSopParamsConfig();

export class MapboxCameraSopNode extends TypedSopNode<MapboxCameraSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraNodeType.MAPBOX;
	}
	static override onRegister = registerMapboxCamera;

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: MapboxCameraSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new MapboxCameraSopOperation(this._scene, this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	static PARAM_CALLBACK_updateFromMap(node: MapboxCameraSopNode) {
		node._paramCallbackUpdateFromMap();
	}
	private async _paramCallbackUpdateFromMap() {
		const map = await MapboxMapsController.waitForMap();
		const lngLat = map.getCenter();
		const pitch = map.getPitch();
		const bearing = map.getBearing();
		const zoom = map.getZoom();
		this.scene().batchUpdates(() => {
			this.p.longitude.set(lngLat.lng);
			this.p.latitude.set(lngLat.lat);
			this.p.pitch.set(pitch);
			this.p.bearing.set(bearing);
			this.p.zoom.set(zoom);
		});
	}
}
