precision highp float;
precision highp sampler2D;

uniform float vertices[3];
uniform vec3 coordinates[3];

uniform vec2 tSize;
uniform float order;
uniform sampler2D tPosition0;
uniform sampler2D tPosition1;
uniform sampler2D tOriginal;

// *** ADD COMMON ***

void main() {

	vec2 uv = gl_FragCoord.xy / tSize.xy;

	vec3 pos = packPosition( uv );
	vec3 org = texture2D( tOriginal, uv ).xyz;

	vec3 ref, diff, proj, offset;
	
	for ( int i = 0; i < 3; ++i ) {

		if ( vertices[ i ] == - 1.0 ) continue;

		ref = texture2D( tOriginal, getUV( vertices[ i ] ) ).xyz;
		offset = coordinates[ i ] - ref;

		if ( distance( org, ref ) <= 0.1 ) {

			diff = ref - org;

			proj = dot( diff, offset ) / dot( offset, offset ) * org;

			pos = org + proj + offset;

		}

	}

	gl_FragColor = vec4( unpackPosition( pos, order ), 1.0 );

}
