// get vec2 tex coordinate from index
vec2 getClothSolverUV( float id, vec2 textureSize ) { 

	vec2 coords = vec2(
		floor( mod( ( id + 0.5 ), textureSize.x ) ),
		floor( ( id + 0.5 ) / textureSize.x )
	) + 0.5;

	return coords / textureSize;

}
