

float __FUNCTION__NAME__(
	sampler2D texturePosition,
	vec2 particleUv,
	vec3 currentPosition,
	// density
	float maxDist
	){

	vec3 otherPosition;
	float dist;

	float density = 0.;
	float range = abs(maxDist);

	const float width = resolution.x;
	const float height = resolution.y;
	for ( float y = 0.0; y < height; y++ ) {
		for ( float x = 0.0; x < width; x++ ) {

			// ignore if this is self
			if(x == particleUv.x && y == particleUv.y) continue;

			vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
			otherPosition = texture2D( texturePosition, ref ).__COMPONENT__;

			dist = distance( otherPosition, currentPosition );

			if(dist < maxDist){
				float weight = 1.0 - dist / range;
				density += weight;
			}
		}
	}

	return density;

}