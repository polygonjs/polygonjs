// pack float16 position into float32
vec3 packPosition( vec2 uv ) {

	return ( texture2D( tPosition0, uv ).xyz + texture2D( tPosition1, uv ).xyz ) / 1024.0;

}