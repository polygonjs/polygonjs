uniform mat4 textureMatrix;
uniform float time;

varying vec4 mirrorCoord;
varying vec4 worldPosition;
varying vec2 geoUV;

#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>

void main() {
	mirrorCoord = modelMatrix * vec4( position, 1.0 );
	worldPosition = mirrorCoord.xyzw;
	mirrorCoord = textureMatrix * mirrorCoord;
	vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	geoUV = uv;

	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <logdepthbuf_vertex>
	#include <fog_vertex>
	#include <shadowmap_vertex>
}