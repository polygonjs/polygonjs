const float width = resolution.x;
const float height = resolution.y;

vec3 __FUNCTION__NAME__(
	sampler2D texturePosition,
	vec2 particleUv,
	vec3 currentPosition,
	// repulse
	bool repulse,
	float repulseAmount,
	float repulseMinDist,
	float repulseMaxDist,
	// attract
	bool attract,
	float attractAmount,
	float attractStartDist,
	float attractMidDist,
	float attractEndDist
	){

	vec3 otherPosition, dir;
	float distSquared, dist;
	vec3 repulseForce = vec3( 0.0, 0.0, 0.0);
	vec3 attractForce = vec3( 0.0, 0.0, 0.0);
	int repulsorsCount = 0;
	int attractorsCount = 0;

	float repulseRange = abs(repulseMaxDist - repulseMinDist);
	float attractRange0 = abs(attractMidDist - attractStartDist);
	float attractRange1 = abs(attractEndDist - attractMidDist);

	for ( float y = 0.0; y < height; y++ ) {
		for ( float x = 0.0; x < width; x++ ) {

			// ignore if this is self
			if(x == particleUv.x && y == particleUv.y) continue;

			vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
			otherPosition = texture2D( texturePosition, ref ).__COMPONENT__;

			dir = otherPosition - currentPosition;
			dist = length( dir );

			if(repulse){
				if(dist < repulseMaxDist){
					float repulseRatio = (dist - repulseMinDist) / repulseRange;
					repulseRatio = max(repulseRatio, 0.0);
					repulseForce += -repulseAmount * (1.0 - repulseRatio) * dir;
					repulsorsCount++;
				}
			}
			if(attract){
				if( dist > attractStartDist && dist < attractMidDist ){
					float attractRatio0 = (dist - attractStartDist) / attractRange0;
					attractForce += attractAmount * attractRatio0 * dir;
					attractorsCount++;
				} else {
					if( dist > attractMidDist && dist < attractEndDist ){
						float attractRatio1 = (dist - attractMidDist) / attractRange1;
						attractForce += attractAmount * (1.0-attractRatio1) * dir;
						attractorsCount++;
					}
				}
			}
		}
	}

	vec3 force = vec3( 0.0, 0.0, 0.0);
	if(repulsorsCount > 0){
		force += repulseForce / float(repulsorsCount);
	}
	if(attractorsCount > 0){
		force += attractForce / float(attractorsCount);
	}
	return force;

}