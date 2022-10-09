import {Color} from 'three';

export interface GodraysPassParams {
	/**
	 * The rate of accumulation for the godrays.  Higher values roughly equate to more humid air/denser fog.
	 */
	density: number;
	/**
	 * The maximum density of the godrays.  Limits the maximum brightness of the godrays.
	 */
	maxDensity: number;
	/**
	 * TODO: Document this
	 */
	edgeStrength: number;
	/**
	 * TODO: Document this
	 */
	edgeRadius: number;
	/**
	 * Higher values decrease the accumulation of godrays the further away they are from the light source.
	 */
	distanceAttenuation: number;
	/**
	 * The color of the godrays.
	 */
	color: THREE.Color;
}

export const GodRaysPassDefaultParams: GodraysPassParams = {
	density: 1 / 128,
	maxDensity: 0.5,
	edgeStrength: 2,
	edgeRadius: 2,
	distanceAttenuation: 2.0,
	color: new Color(0xffffff),
};
