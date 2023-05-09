precision highp float;
precision highp sampler2D;

uniform vec2 tSize;
uniform float order;
uniform float selectedVertexInfluence;
uniform sampler2D tPosition0;
uniform sampler2D tPosition1;

uniform sampler2D tDistancesA;
uniform sampler2D tDistancesB;

uniform sampler2D tAdjacentsA;
uniform sampler2D tAdjacentsB;



// compute offset based on current distance and spring rest distance
vec3 getDisplacement( vec3 point0, vec3 point1, float restDistance ) {

    float curDistance = distance( point0, point1 );
	return selectedVertexInfluence * ( curDistance - restDistance ) * ( point1 - point0 ) / curDistance;
	
}

// *** ADD COMMON ***

vec2 getUV( float id ) { 
	return getClothSolverUV( id, tSize );
}


void main() {
	
	vec3 displacement;
	vec2 uv = gl_FragCoord.xy / tSize.xy;

	// indices of adjacent vertices
	vec4 adjacentA = texture2D( tAdjacentsA, uv );
	vec4 adjacentB = texture2D( tAdjacentsB, uv );

	// distances of adjacent vertices
	vec4 distancesA = texture2D( tDistancesA, uv );
	vec4 distancesB = texture2D( tDistancesB, uv );

	// vertex position
	vec3 p0 = packPosition( uv );

	// adjacent vertices positions
    vec3 p1 = packPosition( getUV( adjacentA.x ) );
    vec3 p2 = packPosition( getUV( adjacentA.y ) );
    vec3 p3 = packPosition( getUV( adjacentA.z ) );
    vec3 p4 = packPosition( getUV( adjacentA.w ) );
	
	// spring-based displacement
    displacement += getDisplacement( p0, p1, distancesA.x );
    displacement += getDisplacement( p0, p2, distancesA.y );
    displacement += getDisplacement( p0, p3, distancesA.z );
    displacement += getDisplacement( p0, p4, distancesA.w );
	float count = 4.0;

	float Bx = adjacentB.x;
	if( Bx >= 0.0 ){
		vec3 p5 = packPosition( getUV( Bx ) );
		displacement += getDisplacement( p0, p5, distancesB.x );
		count += 1.0;
	}
	float By = adjacentB.y;
	if( By >= 0.0 ){
		vec3 p6 = packPosition( getUV( By ) );
		displacement += getDisplacement( p0, p6, distancesB.y );
		count += 1.0;
	}
	float Bz = adjacentB.z;
	if( Bz >= 0.0 ){
		vec3 p7 = packPosition( getUV( Bz ) );
		displacement += getDisplacement( p0, p7, distancesB.z );
		count += 1.0;
	}
	float Bw = adjacentB.w;
	if( Bw >= 0.0 ){
		vec3 p8 = packPosition( getUV( Bw ) );
		displacement += getDisplacement( p0, p8, distancesB.w );
		count += 1.0;
	}

	p0 += displacement / count;

	gl_FragColor = vec4( unpackPosition( p0, order ), 1.0 );

}
