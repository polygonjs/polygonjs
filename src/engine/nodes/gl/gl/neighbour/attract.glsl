

vec3 __FUNCTION__NAME__(
	sampler2D texturePosition,
	vec2 particleUv,
	vec3 currentPosition,
	// attract
	float amount,
	float startDist,
	float midDist,
	float endDist
	){

	vec3 otherPosition, otherVelocity, dir;
	float distSquared, dist;
	vec3 attractForce = vec3( 0.0, 0.0, 0.0);
	int attractorsCount = 0;

	float range0 = abs(midDist - startDist);
	float range1 = abs(endDist - midDist);

	const float width = resolution.x;
	const float height = resolution.y;
	for ( float y = 0.0; y < height; y++ ) {
		for ( float x = 0.0; x < width; x++ ) {

			// ignore if this is self
			if(x == particleUv.x && y == particleUv.y) continue;

			vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
			otherPosition = texture2D( texturePosition, ref ).__COMPONENT__;

			dir = otherPosition - currentPosition;
			dist = length( dir );

			if( dist > startDist && dist < midDist ){
				float attractRatio0 = (dist - startDist) / range0;
				attractForce += amount * attractRatio0 * normalize(dir);
				attractorsCount++;
			} else {
				if( dist > midDist && dist < endDist ){
					float attractRatio1 = (dist - midDist) / range1;
					attractForce += amount * (1.0-attractRatio1) * normalize(dir);
					attractorsCount++;
				}
			}
		}
	}

	vec3 force = vec3( 0.0, 0.0, 0.0);
	if(attractorsCount > 0){
		force += attractForce / float(attractorsCount);
	}
	return force;

}