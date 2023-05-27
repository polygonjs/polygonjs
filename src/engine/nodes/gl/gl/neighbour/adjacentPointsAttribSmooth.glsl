

float __FUNCTION__NAME__(
	sampler2D texturePosition,
	vec2 particleUv,
	vec3 currentPosition,
	//
	vec2 textureSize,
	// attribSmooth
	sampler2D textureAttribute,
	float currentAttributeValue,
	float deltaThreshold,
	float smoothAmount,
	__ADJACENCY_SAMPLERS_ARGUMENTS__
	){

	vec3 otherPosition;
	float dist, delta, otherAttribute;
	// float neighbourCount = 0.0;
	float offset = 0.0;

	__ADJACENCY_VALUES_FROM_SAMPLERS__
	vec2 adjacencyAttributesArray__ADJACENCY_ARRAY_VALUE__;

	for(int faceIndex = 0; faceIndex < __ADJACENCY_COUNT__; faceIndex++){

		vec2 currentAdjacentIdForFace = adjacencyAttributesArray[faceIndex];

		if(currentAdjacentIdForFace.x > -0.5 && currentAdjacentIdForFace.y >= -0.5){

			for( int vertexIndex = 0; vertexIndex < 1; vertexIndex++ ){

				float vertexId = vertexIndex == 0 ? currentAdjacentIdForFace.x : currentAdjacentIdForFace.y;
				vec2 adjacentPointUv = geometryAttributesLookupUv(vertexId, textureSize);
				
				otherPosition = texture2D( texturePosition, adjacentPointUv ).__COMPONENT__;
				otherAttribute = texture2D( textureAttribute, adjacentPointUv ).__COMPONENT_ATTRIB__;

				dist = distance( otherPosition, currentPosition );

				delta = (otherAttribute - currentAttributeValue) / dist;

				float excess = abs(delta) - deltaThreshold;

				if(excess > 0.0){
					offset += (excess * smoothAmount * sign(delta));
					//neighbourCount++;
				}

			}

		}
	}

	//offset = neighbourCount >= 1.0 ? (offset / neighbourCount) : 0.0;
	return currentAttributeValue + offset;

}