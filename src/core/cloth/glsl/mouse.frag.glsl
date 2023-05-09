precision highp float;
precision highp sampler2D;

uniform float vertex;
uniform vec3 coordinates;

uniform vec2 tSize;
uniform float order;
uniform sampler2D tPosition0;
uniform sampler2D tPosition1;
uniform sampler2D tOriginal;

// *** ADD COMMON ***

vec2 getUV( float id ) { 
	return getClothSolverUV( id, tSize );
}

void main() {

	vec2 uv = gl_FragCoord.xy / tSize.xy;

	vec3 pos = packPosition( uv );
	vec3 org = texture2D( tOriginal, uv ).xyz;

	vec3 ref, diff, proj, offset;

	if ( vertex != - 1.0 ){

		ref = texture2D( tOriginal, getUV( vertex ) ).xyz;
		offset = coordinates - ref;

		if ( distance( org, ref ) <= 0.1 ) {

			diff = ref - org;

			proj = dot( diff, offset ) / dot( offset, offset ) * org;

			pos = org + proj + offset;

		}
	}

	gl_FragColor = vec4( unpackPosition( pos, order ), 1.0 );

}
