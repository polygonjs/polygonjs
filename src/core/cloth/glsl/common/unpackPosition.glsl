
vec3 unpackPosition( vec3 pos, float order ) {

	pos *= 1024.0;

	return ( order > 0.0 ) ? floor( pos ) : fract( pos );

}

vec4 unpackPosition( vec4 pos, float order ) {

	pos *= 1024.0;

	return ( order > 0.0 ) ? floor( pos ) : fract( pos );

}