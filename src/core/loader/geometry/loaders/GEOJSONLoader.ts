import {
	LoadingManager,
	FileLoader,
	Loader,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	Shape,
	Vector2,
	Object3D,
} from 'three';
import type {OnSuccess, OnProgress, OnError} from '../Common';
import {
	// GeoJsonGeometryTypes,
	// GeoJsonTypes,
	// BBox,
	// Position,
	// GeoJsonObject,
	GeoJSON,
	Geometry,
	Point,
	// MultiPoint,
	LineString,
	// MultiLineString,
	Polygon,
	MultiPolygon,
	// GeometryCollection,
	GeoJsonProperties,
	Feature,
	// FeatureCollection,
} from 'geojson';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../../geometry/Constant';
import {createGeometriesFromTypeFlat} from '../../../geometry/text/TextFlat';
import {ArrayUtils} from '../../../ArrayUtils';
import {CoreType} from '../../../Type';
import {CoreObject} from '../../../geometry/modules/three/CoreObject';

export class GEOJSONLoader extends Loader {
	constructor(manager: LoadingManager) {
		super(manager);
	}

	load(url: string, onLoad: OnSuccess<Group>, onProgress?: OnProgress, onError?: OnError) {
		const scope = this;

		// const path = scope.path === '' ? LoaderUtils.extractUrlBase(url) : scope.path;

		const loader = new FileLoader(this.manager);
		loader.setPath(scope.path);
		loader.setResponseType('json');
		loader.setRequestHeader(scope.requestHeader);
		loader.setWithCredentials(scope.withCredentials);

		loader.load(
			url,
			(buffer) => {
				try {
					const json = buffer as any as GeoJSON;
					onLoad(this.parse(json));
				} catch (e) {
					if (onError) {
						onError(e);
					} else {
						console.error(e);
					}

					scope.manager.itemError(url);
				}
			},
			onProgress,
			onError
		);
	}

	private parse(data: GeoJSON): Group {
		const group = new Group();
		this._parseGeojson(group, data);
		return group;
	}
	private _parseGeojson(group: Group, data: GeoJSON) {
		const type = data.type;
		switch (type) {
			// case 'Point': {
			// 	break;
			// }
			// case 'MultiPoint': {
			// 	break;
			// }
			// case 'LineString': {
			// 	break;
			// }
			// case 'MultiLineString': {
			// 	break;
			// }
			// case 'Polygon': {
			// 	break;
			// }
			// case 'MultiPolygon': {
			// 	break;
			// }
			// case 'GeometryCollection': {
			// 	break;
			// }
			// case 'Feature': {
			// 	break;
			// }
			case 'FeatureCollection': {
				return this._parseFeatureCollection(group, data.features);
			}
		}
		console.warn(`_parseGeojson:${type} not implemented`);
	}

	private _parseFeatureCollection(group: Group, features: Array<Feature<Geometry, GeoJsonProperties>>) {
		for (let feature of features) {
			const objects = this._parseFeature(feature);
			if (objects) {
				if (CoreType.isArray(objects)) {
					for (let object of objects) {
						this._addAttributes(object, feature);
						group.add(object);
					}
				} else {
					this._addAttributes(objects, feature);
					group.add(objects);
				}
			}
		}
	}
	private _addAttributes(object: Object3D, feature: Feature<Geometry, GeoJsonProperties>) {
		if (!feature.properties) {
			return;
		}
		const propertyNames = Object.keys(feature.properties);
		for (let propertyName of propertyNames) {
			const value = feature.properties[propertyName];
			CoreObject.addAttribute(object, propertyName, value);
		}
	}

	private _parseFeature(feature: Feature<Geometry, GeoJsonProperties>) {
		const geometry = feature.geometry;
		const type = geometry.type;
		switch (type) {
			case 'Point': {
				return this._parseFeaturePoint(feature as Feature<Point, GeoJsonProperties>);
			}
			// case 'MultiPoint': {
			// 	console.warn('MultiPoint not implemented')
			// 	break;
			// }
			case 'LineString': {
				return this._parseFeatureLineString(feature as Feature<LineString, GeoJsonProperties>);
			}
			// case 'MultiLineString': {
			// 	console.warn('MultiPoint not implemented')
			// 	break;
			// }
			case 'Polygon': {
				return this._parseFeaturePolygon(feature as Feature<Polygon, GeoJsonProperties>);
			}
			case 'MultiPolygon': {
				return this._parseFeatureMultiPolygon(feature as Feature<MultiPolygon, GeoJsonProperties>);
			}
			// case 'GeometryCollection': {
			// 	break;
			// }
		}
		console.warn(`_parseFeature:${type} not implemented`);
	}
	private _parseFeaturePoint(feature: Feature<Point, GeoJsonProperties>) {
		const coordinates = feature.geometry.coordinates;
		const pointsCount = 1;

		const positions: number[] = new Array(pointsCount * 3);
		const indices: number[] = new Array(pointsCount);
		// for (let i = 0; i < pointsCount; i++) {
		const i = 0;
		positions[i * 3] = coordinates[0];
		positions[i * 3 + 1] = 0;
		positions[i * 3 + 2] = coordinates[1];

		indices[0] = 0;

		// if (i > 0) {
		// 	indices[(i - 1) * 2] = i - 1;
		// 	indices[(i - 1) * 2 + 1] = i;
		// }
		// }
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		return BaseSopOperation.createObject(geometry, ObjectType.POINTS);
	}
	private _parseFeatureLineString(feature: Feature<LineString, GeoJsonProperties>) {
		const coordinates = feature.geometry.coordinates;
		const pointsCount = coordinates.length;

		const positions: number[] = new Array(pointsCount * 3);
		const indices: number[] = new Array(pointsCount);
		for (let i = 0; i < pointsCount; i++) {
			positions[i * 3] = coordinates[i][0];
			positions[i * 3 + 1] = 0;
			positions[i * 3 + 2] = coordinates[i][1];

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		return BaseSopOperation.createObject(geometry, ObjectType.LINE_SEGMENTS);
	}
	private _parseFeaturePolygon(feature: Feature<Polygon, GeoJsonProperties>) {
		const coordinates = feature.geometry.coordinates;
		// const pointsCount = coordinates.length;
		const shapes = coordinates.map((coordinate) => new Shape(coordinate.map((c) => new Vector2(c[0], c[1]))));

		const geometries = createGeometriesFromTypeFlat({shapes: [shapes]});
		if (!geometries) {
			return;
		}
		return ArrayUtils.compact(geometries).map((geometry) =>
			BaseSopOperation.createObject(geometry.rotateX(-0.5 * Math.PI), ObjectType.MESH)
		);
	}
	private _parseFeatureMultiPolygon(feature: Feature<MultiPolygon, GeoJsonProperties>) {
		const coordinates = feature.geometry.coordinates;
		// const pointsCount = coordinates.length;
		const shapes = coordinates.map((coordinate) =>
			coordinate.map((c) => new Shape(c.map((c2) => new Vector2(c2[0], c2[1]))))
		);

		const geometries = createGeometriesFromTypeFlat({shapes});
		if (!geometries) {
			return;
		}
		return ArrayUtils.compact(geometries).map((geometry) =>
			BaseSopOperation.createObject(geometry.rotateX(-0.5 * Math.PI), ObjectType.MESH)
		);
	}
}
