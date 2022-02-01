const float width = resolution.x;
const float height = resolution.y;

vec3 flocking(sampler2D texturePosition, sampler2D textureVelocity, vec3 currentPosition, vec3 currentVelocity, float minFlockDist, float maxFlockDist){

	vec3 otherPosition, otherVelocity, dir;
	float distSquared, dist;
	vec3 force = vec3( 0.0, 0.0, 0.0);

	for ( float y = 0.0; y < height; y++ ) {
		for ( float x = 0.0; x < width; x++ ) {

			vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
			otherPosition = texture2D( texturePosition, ref ).xyz;

			dir = otherPosition - currentPosition;
			dist = length( dir );

			// ignore distances that are too small
			if ( dist < 0.0001 ) continue;

			if ( dist < minFlockDist ) {
				force += -0.5*dir;
			} else {
				if(dist < maxFlockDist){
					// force += 0.1*dir;
				}
			}

		}
	}

	// float forceAmount = length( force );
	// if(forceAmount > 0.0001){
	// 	force = normalize(force);
	// }

	return force;

}