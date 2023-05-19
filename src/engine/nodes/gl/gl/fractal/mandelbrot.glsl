// https://www.shadertoy.com/view/XsXXWS
// http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/	

// A point this close to the surface is considered to be on the surface.
// Larger numbers lead to faster convergence but "blur" out the shape
// const float minimumDistanceToSurface = SURF_DIST;//0.0003;

struct MandelbrotArgs {
	float power;
	vec3 QPreMult;
	vec3 QPostMult;
	float thetaMult;
	float externalBoundingRadius;
};

#ifndef SURF_DIST
	#define SURF_DIST 0.001
#endif

////////////////////////////////////////////////////////////

float mandelbrot(vec3 P, out float AO, MandelbrotArgs args) {

	AO = 1.0;
	
	vec3 Q = P;
	
	// Put the whole shape in a bounding sphere to 
	// speed up distant ray marching. This is necessary
	// to ensure that we don't expend all ray march iterations
	// before even approaching the surface
	{
		float r = length(P) - args.externalBoundingRadius;
		// If we're more than 1 unit away from the
		// surface, return that distance
		if (r > 1.0) { return r; }
	}
	float escapeRadius = 2. * args.externalBoundingRadius;

	// Embed a sphere within the fractal to fill in holes under low iteration counts
	const float internalBoundingRadius = 0.72;

	// Used to smooth discrete iterations into continuous distance field
	// (similar to the trick used for coloring the Mandelbrot set)	
	float derivative = 1.0;
	
	for (int i = 0; i < ___ITERATIONS___; ++i) {
		// Darken as we go deeper
		AO *= 0.725;
		float r = length(Q);
		
		if (r > escapeRadius) {	
			// The point escaped. Remap AO for more brightness and return
			AO = min((AO + 0.075) * 4.1, 1.0);
			return min(length(P) - internalBoundingRadius, 0.5 * log(r) * r / derivative);
		} else {		
			// Convert to polar coordinates and then rotate by the power
			//float theta = acos(Q.z*(0.8+.2*sin(iTime*1.)) / r) * power;
			vec3 preMult = vec3(
				args.QPreMult.x,// * (1.+float(i)),
				args.QPreMult.y,// * (1.+float(i)),
				args.QPreMult.z// * (1.+float(i))
			);
			float theta = acos(preMult.z * Q.z / r) * args.power;
			float phi   = atan(preMult.y * Q.y, preMult.x * Q.x) * args.power;			
			
			// Update the derivative
			derivative = pow(r, args.power - 1.0) * args.power * derivative + 1.0;
			
			// Convert back to Cartesian coordinates and 
			// offset by the original point (which we're orbiting)
			float sinTheta = sin(theta * args.thetaMult);
			
			Q = vec3(sinTheta * cos(phi) * args.QPostMult.x,
					    sinTheta * sin(phi) * args.QPostMult.y,
					    cos(theta) * args.QPostMult.z) * pow(r, args.power) + P;
		}			
	}
	
	// Never escaped, so either already in the set...or a complete miss
	return SURF_DIST;
}
