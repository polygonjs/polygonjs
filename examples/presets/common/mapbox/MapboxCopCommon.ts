import {MapboxElevationCopNode} from '../../../../src/engine/nodes/cop/MapboxElevation';
import {MapboxSatelliteCopNode} from '../../../../src/engine/nodes/cop/MapboxSatellite';
import {MapboxCameraSopNode} from '../../../../src/engine/nodes/sop/MapboxCamera';
import {BasePreset} from '../../BasePreset';

type MapboxNode = MapboxElevationCopNode | MapboxSatelliteCopNode | MapboxCameraSopNode;
export function mapboxCollection(node: MapboxNode) {
	const london = new BasePreset()
		.addEntry(node.p.longitude, -0.07956)
		.addEntry(node.p.latitude, 51.5146)
		.addEntry(node.p.zoom, 11);
	const mountFuji = new BasePreset()
		.addEntry(node.p.longitude, 138.725)
		.addEntry(node.p.latitude, 35.3547)
		.addEntry(node.p.zoom, 12);
	const elCapitan = new BasePreset()
		.addEntry(node.p.longitude, -119.63)
		.addEntry(node.p.latitude, 37.7331199)
		.addEntry(node.p.zoom, 13);
	const sydney = new BasePreset()
		.addEntry(node.p.longitude, 151.154952)
		.addEntry(node.p.latitude, -33.8730748)
		.addEntry(node.p.zoom, 13);
	const wellington = new BasePreset()
		.addEntry(node.p.longitude, 174.82731)
		.addEntry(node.p.latitude, -41.2853599)
		.addEntry(node.p.zoom, 13);
	const everest = new BasePreset()
		.addEntry(node.p.longitude, 86.916198)
		.addEntry(node.p.latitude, 27.9881388)
		.addEntry(node.p.zoom, 13);
	const k2 = new BasePreset()
		.addEntry(node.p.longitude, 76.5063)
		.addEntry(node.p.latitude, 35.8800041)
		.addEntry(node.p.zoom, 13);
	// const grandCanyon = new BasePreset()
	// 	.addEntry(node.p.longitude, -113.404)
	// 	.addEntry(node.p.latitude, 36.0922083)
	// 	.addEntry(node.p.zoom, 13);
	const grandCanyon = new BasePreset()
		.addEntry(node.p.longitude, -111.866201)
		.addEntry(node.p.latitude, 36.3955956)
		.addEntry(node.p.zoom, 13);
	const mountBlanc = new BasePreset()
		.addEntry(node.p.longitude, 6.652151)
		.addEntry(node.p.latitude, 45.8854421)
		.addEntry(node.p.zoom, 13);
	const paris = new BasePreset()
		.addEntry(node.p.longitude, 2.2768)
		.addEntry(node.p.latitude, 48.8589465)
		.addEntry(node.p.zoom, 13);

	return {
		london,
		mountFuji,
		elCapitan,
		sydney,
		wellington,
		everest,
		k2,
		grandCanyon,
		mountBlanc,
		paris,
	};
}
