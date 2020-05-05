// THREE = require("../three97.js"); # Modified version to use 64-bit double precision floats for matrix math
import { Vector3 } from "three/src/math/Vector3";
import { Matrix4 } from "three/src/math/Matrix4";
import mapboxgl from "mapbox-gl";

import { CoreMapboxConstants } from "./Constants";
const Constants = CoreMapboxConstants;

export class CoreMapboxUtils {
	// @prettyPrintMatrix: (uglymatrix)->
	//     for (s=0;s<4;s++){
	//         quartet=[uglymatrix[s],
	//         uglymatrix[s+4],
	//         uglymatrix[s+8],
	//         uglymatrix[s+12]];
	//         console.log(quartet.map(function(num){return num.toFixed(4)}))
	//     }

	static makePerspectiveMatrix(
		fovy: number,
		aspect: number,
		near: number,
		far: number
	) {
		const out = new Matrix4();
		const f = 1.0 / Math.tan(fovy / 2);
		const nf = 1 / (near - far);

		const newMatrix = [
			f / aspect,
			0,
			0,
			0,
			0,
			f,
			0,
			0,
			0,
			0,
			(far + near) * nf,
			-1,
			0,
			0,
			2 * far * near * nf,
			0
		];

		out.elements = newMatrix;
		return out;
	}

	// #gimme radians
	// function radify(deg){

	//     if (typeof deg === 'object'){
	//         return deg.map(function(degree){
	//             return Math.PI*2*degree/360
	//         })
	//     }

	//     else return Math.PI*2*deg/360
	// }

	// #gimme degrees
	// function degreeify(rad){
	//     return 360*rad/(Math.PI*2)
	// }

	static projectToWorld(lnglat: Number3) {
		// Spherical mercator forward projection, re-scaling to WORLD_SIZE
		const projected = [
			-Constants.MERCATOR_A *
				lnglat[0] *
				Constants.DEG2RAD *
				Constants.PROJECTION_WORLD_SIZE,
			-Constants.MERCATOR_A *
				Math.log(
					Math.tan(
						Math.PI * 0.25 + 0.5 * lnglat[1] * Constants.DEG2RAD
					)
				) *
				Constants.PROJECTION_WORLD_SIZE
		];

		const pixelsPerMeter = this.projectedUnitsPerMeter(lnglat[1]);

		//z dimension
		let height = lnglat[2];
		if (height == null) {
			height = 0;
		}
		projected.push(height * pixelsPerMeter);

		return new Vector3(projected[0], projected[1], projected[2]);
	}

	static projectedUnitsPerMeter(latitude: number): number {
		return Math.abs(
			(Constants.WORLD_SIZE *
				(1 / Math.cos((latitude * Math.PI) / 180))) /
				Constants.EARTH_CIRCUMFERENCE
		);
	}

	static fromLL(lon: number, lat: number): [number, number] {
		// derived from https://gist.github.com/springmeyer/871897
		const extent = 20037508.34;
		const x = (lon * extent) / 180;
		let y =
			Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
		y = (y * extent) / 180;
		return [(x + extent) / (2 * extent), 1 - (y + extent) / (2 * extent)];
	}
	static fromLLv(position: Vector3): Vector3 {
		const ll = this.fromLL(position.x, position.z);
		return new Vector3(ll[0], position.y, ll[1]);
	}

	// https://github.com/mapbox/mapbox-gl-js/blob/5bebe1cd725e9af0c6be25928bdbde468bebdf61/src/ui/control/scale_control.js#L61-L127
	static get_distance(latlng1: mapboxgl.LngLat, latlng2: mapboxgl.LngLat) {
		// Uses spherical law of cosines approximation.
		const R = 6371000;

		const rad = Math.PI / 180,
			lat1 = latlng1.lat * rad,
			lat2 = latlng2.lat * rad,
			a =
				Math.sin(lat1) * Math.sin(lat2) +
				Math.cos(lat1) *
					Math.cos(lat2) *
					Math.cos((latlng2.lng - latlng1.lng) * rad);

		const maxMeters = R * Math.acos(Math.min(a, 1));
		return maxMeters;
	}

	// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_3
	static lnglat_to_tile_number(
		lng_deg: number,
		lat_deg: number,
		zoom: number
	) {
		const lat_rad = (lat_deg / 180) * Math.PI;
		const n = 2.0 ** zoom;
		const x = Math.floor(((lng_deg + 180.0) / 360.0) * n);
		const y = Math.floor(
			((1.0 -
				Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) /
				2.0) *
				n
		);

		return {
			x: x,
			y: y
		};
	}
	static tile_number_to_lnglat(xtile: number, ytile: number, zoom: number) {
		const n = 2.0 ** zoom;
		const lon_deg = (xtile / n) * 360.0 - 180.0;
		const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - (2 * ytile) / n)));
		const lat_deg = 180.0 * (lat_rad / Math.PI);

		return {
			lat: lat_deg,
			lng: lon_deg
		};
	}
}

// module.exports.prettyPrintMatrix = prettyPrintMatrix;
// module.exports.makePerspectiveMatrix = makePerspectiveMatrix;
// module.exports.radify = radify;
// module.exports.degreeify = degreeify;
