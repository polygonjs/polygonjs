varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vWorldOrigin;

void main(){
	// compute intensity
	vNormal		= normalize( normalMatrix * normal );

	vec4 worldPosition	= modelMatrix * vec4( position, 1.0 );
	vWorldPosition		= worldPosition.xyz;

	vec4 worldOrigin	= modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vWorldOrigin		= worldOrigin.xyz;

	// set gl_Position
	gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}