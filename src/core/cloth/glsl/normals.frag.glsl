precision highp float;
precision highp sampler2D;

uniform vec2 tSize;

uniform sampler2D tPosition0;
uniform sampler2D tPosition1;

uniform sampler2D tAdjacentsA;
uniform sampler2D tAdjacentsB;

// *** ADD COMMON ***

vec2 getUV( float id ) { 
	return getClothSolverUV( id, tSize );
}

void main () {

	vec3 normal;
	vec2 uv = gl_FragCoord.xy / tSize.xy;

	// indices of adjacent vertices
	vec4 adjacentA = texture2D( tAdjacentsA, uv );
	vec4 adjacentB = texture2D( tAdjacentsB, uv );

	// vertex position
	vec3 p0 = ( texture2D( tPosition0, uv ).xyz + texture2D( tPosition1, uv ).xyz ) / 1024.0;

	// adjacent vertices positions
	vec3 p1 = packPosition( getUV( adjacentA.x ) );
	vec3 p2 = packPosition( getUV( adjacentA.y ) );
	vec3 p3 = packPosition( getUV( adjacentA.z ) );
	vec3 p4 = packPosition( getUV( adjacentA.w ) );

	// compute vertex normal contribution
	normal += cross( p1 - p0, p2 - p0 );
	normal += cross( p2 - p0, p3 - p0 );
	normal += cross( p3 - p0, p4 - p0 );

	float Bx = adjacentB.x;
	vec3 p5 = Bx >= 0.0 ? packPosition( getUV( Bx ) ) : vec3(0.0);
	if( Bx >= 0.0 ){
		normal += cross( p4 - p0, p5 - p0 );
	}
	float By = adjacentB.y;
	vec3 p6 = By >= 0.0 ? packPosition( getUV( By ) ) : vec3(0.0);
	if( By >= 0.0 ){
		normal += cross( p5 - p0, p6 - p0 );
	}
	float Bz = adjacentB.z;
	vec3 p7 = Bz >= 0.0 ? packPosition( getUV( Bz ) ) : vec3(0.0);
	if( Bz >= 0.0 ){
		normal += cross( p6 - p0, p7 - p0 );
	}
	float Bw = adjacentB.w;
	vec3 p8 = Bw >= 0.0 ? packPosition( getUV( Bw ) ) : vec3(0.0);
	if( Bw >= 0.0 ){
		normal += cross( p7 - p0, p8 - p0 );
	}

	gl_FragColor = vec4( normalize( normal ), 1.0 );
}