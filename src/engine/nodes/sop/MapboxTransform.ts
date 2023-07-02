/**
 * Transforms a geometry from the world space to the mapbox space
 *
 * @remarks
 *
 * The mapbox space is very specific to mapbox, as it is very small (several orders of magnitude) compared to the threejs space.
 * See [sop/mapboxCamera](/docs/nodes/sop/mapboxCamera) for info on how to setup mapbox to use with Polygonjs
 *
 *
 */
import {CoreMapboxTransform} from '../../../core/thirdParty/Mapbox/Transform';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
// import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/MapboxListener';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import {TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {Object3D} from 'three';
import {TypeAssert} from '../../poly/Assert';
import {SopType} from '../../poly/registers/nodes/types/Sop';

class MapboxTransformSopParamsConfig extends NodeParamsConfig {
	/** @param sets if this node should transform objects or geometries */
	applyOn = ParamConfig.INTEGER(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRY), {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param camera longitude */
	longitude = ParamConfig.FLOAT(0, {
		range: [-360, 360],
	});
	/** @param camera latitude */
	latitude = ParamConfig.FLOAT(0, {
		range: [-90, 90],
	});
}
const ParamsConfig = new MapboxTransformSopParamsConfig();

export class MapboxTransformSopNode extends TypedSopNode<MapboxTransformSopParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return SopType.MAPBOX_TRANSFORM;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);

		// this.uiData.set_icon("map-marker-alt");
		// this._init_mapbox_listener();
	}
	private _transformer = new CoreMapboxTransform();
	override cook(inputContents: CoreGroup[]) {
		const coreGroup = inputContents[0];

		this._transformer.setLngLat({
			lng: this.pv.longitude,
			lat: this.pv.latitude,
		});
		const objects = coreGroup.threejsObjects();
		this._applyTransform(objects);
		this.setCoreGroup(coreGroup);
	}
	private _applyTransform(objects: Object3D[]) {
		const mode = TRANSFORM_TARGET_TYPES[this.pv.applyOn];
		switch (mode) {
			case TransformTargetType.GEOMETRY: {
				return this._updateGeometries(objects);
			}
			case TransformTargetType.OBJECT: {
				return this._updateObjects(objects);
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _updateGeometries(objects: Object3D[]) {
		for (let object of objects) {
			this._transformer.transform_groupGeometry_FINAL(object);
		}
	}
	private _updateObjects(objects: Object3D[]) {
		for (let object of objects) {
			this._transformer.transform_groupObject_FINAL(object);
		}
	}

	// private _transformInput(core_group: CoreGroup) {

	// }

	// _postInitController() {}
}
