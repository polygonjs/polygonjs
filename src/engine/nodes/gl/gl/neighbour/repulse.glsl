
vec3 __FUNCTION__NAME__(
	sampler2D texturePosition,
	vec2 particleUv,
	vec3 currentPosition,
	// repulse
	float amount,
	float minDist,
	float maxDist
	){

	vec3 otherPosition, otherVelocity, dir;
	float distSquared, dist;
	vec3 repulseForce = vec3( 0.0, 0.0, 0.0 );
	int repulsorsCount = 0;

	float range = abs(maxDist - minDist);

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

			// if the distance is too small, ignore this point
			if (dist < 0.0001) continue;

			if(dist < maxDist){
				float ratio = (dist - minDist) / range;
				ratio = max(ratio, 0.0);
				repulseForce += -amount * (1.0 - ratio) * dir;
				repulsorsCount++;
			}
		}
	}

	vec3 force = vec3( 0.0, 0.0, 0.0);
	if(repulsorsCount > 0){
		force += repulseForce / float(repulsorsCount);
	}
	return force;

}