

float __FUNCTION__NAME__(
	sampler2D texturePosition,
	vec2 particleUv,
	vec3 currentPosition,
	// attribSmooth
	sampler2D textureAttribute,
	float currentAttributeValue,
	float maxDist,
	float deltaThreshold,
	float smoothAmount
	){

	vec3 otherPosition;
	float dist, delta, otherAttribute;
	float neighbourCount = 0.0;
	float offset = 0.0;

	const float width = resolution.x;
	const float height = resolution.y;
	for ( float y = 0.0; y < height; y++ ) {
		for ( float x = 0.0; x < width; x++ ) {

			// ignore if this is self
			if(x == particleUv.x && y == particleUv.y) continue;

			vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
			otherPosition = texture2D( texturePosition, ref ).__COMPONENT__;
			otherAttribute = texture2D( textureAttribute, ref ).__COMPONENT_ATTRIB__;
			dist = distance( otherPosition, currentPosition );

			if(dist < maxDist){
				delta = (otherAttribute - currentAttributeValue) / dist;
				float excess = abs(delta) - deltaThreshold;

				if(excess > 0.0){
					offset += (excess * smoothAmount * sign(delta)) * (1.0 - (dist / maxDist));
					neighbourCount++;
				}
			}
		}
	}
	offset = neighbourCount >= 1.0 ? (offset / neighbourCount) : 0.0;
	return currentAttributeValue + offset;

}