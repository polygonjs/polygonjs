// get vec2 tex coordinate from index
vec2 geometryAttributesLookupUv( float id, vec2 textureSize ) { 
	float idRounded = round( id );

	vec2 coords = vec2(
		mod( ( idRounded ), textureSize.x ),
		floor( ( idRounded ) / textureSize.x )
	) + 0.5;


	return coords / textureSize;

}
