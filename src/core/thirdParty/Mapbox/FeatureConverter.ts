import {BufferGeometry, Float32BufferAttribute, LineSegments, Mesh, Object3D, Vector2} from 'three';
import {ObjectType} from '../../geometry/Constant';
import {BaseSopNodeType} from '../../../engine/nodes/sop/_Base';
import {CoordinatesCollection} from './CoordinatesCollection';
import {arraySum} from '../../ArrayUtils';
import {CoreGeometryBuilderMerge} from '../../geometry/builders/Merge';
import {CoreMapboxString} from './String';
import {corePointClassFactory} from '../../geometry/CoreObjectFactory';
import {ThreejsPoint} from '../../geometry/modules/three/ThreejsPoint';
import {pointsFromObject} from '../../geometry/entities/point/CorePointUtils';

const MULTILINESTRING = 'MultiLineString';
const LINESTRING = 'LineString';
const dummyMesh = new Mesh();
export class FeatureConverter {
	id: number | undefined;
	constructor(private node: BaseSopNodeType, private name: string, private features: any[]) {}

	createObject(): Object3D | undefined {
		const coordinatesCollections = this._createAllCoordinatesCollections();
		const perimeter: number = arraySum(coordinatesCollections.map((f) => f.perimeter()));
		const sortedFeatures = CoordinatesCollection.sort(coordinatesCollections);

		const lines = sortedFeatures.map((feature) => {
			return this._createLine(feature);
		});
		lines.forEach((line) => {
			const corePointClass = corePointClassFactory(line);
			corePointClass.addNumericAttribute(line, 'perimeter', 1, perimeter);
		});

		const geometries = lines.map((l) => l.geometry) as BufferGeometry[];
		const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
		if (!mergedGeometry) {
			return;
		}

		// pti
		dummyMesh.geometry = mergedGeometry;
		const points = pointsFromObject(dummyMesh);
		const pointsCount = points.length;
		for (let i = 0; i < pointsCount; i++) {
			const point = points[i];
			const pti = i / (pointsCount - 1);
			point.setAttribValue('pti', pti);
		}

		const mergedObject = this.node.createObject(mergedGeometry, ObjectType.LINE_SEGMENTS);
		return mergedObject;
	}

	_createLine(coordinatesCollection: CoordinatesCollection): LineSegments {
		const pointsCount = coordinatesCollection.coordinates.length;

		const positions: number[] = [];
		const indices: number[] = [];
		for (let i = 0; i < pointsCount; i++) {
			const coordinates = coordinatesCollection.coordinates[i];

			positions.push(coordinates.x);
			positions.push(0);
			positions.push(coordinates.y);

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		const object = this.node.createObject(geometry, ObjectType.LINE_SEGMENTS);

		dummyMesh.geometry = geometry;
		const id_from_name = CoreMapboxString.toId(this.name) % 10000000;
		// console.log(this.name, id_from_name)
		ThreejsPoint.addNumericAttribute(dummyMesh, 'id', 1, this.id);
		ThreejsPoint.addNumericAttribute(dummyMesh, 'name_id', 1, id_from_name);

		return object;
	}

	private _createAllCoordinatesCollections(): CoordinatesCollection[] {
		const coordinates_collections: CoordinatesCollection[] = [];
		this.features.forEach((feature) => {
			this.id = this.id || feature['id'];

			const feature_geometry = feature.geometry;
			if (feature_geometry) {
				const type = feature_geometry['type'];
				switch (type) {
					case MULTILINESTRING:
						const multi_coordinates = feature_geometry['coordinates'];
						if (multi_coordinates) {
							for (let i = 0; i < multi_coordinates.length; i++) {
								const coordinates = multi_coordinates[i];
								coordinates_collections.push(this._create_coordinates(coordinates));
							}
						}
						break;
					case LINESTRING:
						coordinates_collections.push(this._create_coordinates(feature_geometry['coordinates']));
						break;
					default:
						console.warn(`type ${type} not taken into account`);
				}
			}
		});
		return coordinates_collections;
	}
	private _create_coordinates(raw_coordinates: [number, number][]): CoordinatesCollection {
		const vectors = raw_coordinates.map((raw_coordinate) => {
			return new Vector2(raw_coordinate[0], raw_coordinate[1]);
		});
		return new CoordinatesCollection(vectors);
	}
}
