uniform bool useVertexColor;
uniform vec3 globalColor;
uniform sampler2D tDiffuse;
varying vec4 vUv;
uniform float opacity;
uniform float reflectionBlend;
varying vec3 vertexColor;

#include <logdepthbuf_pars_fragment>

float blendOverlay( float base, float blend ) {

	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

}

vec3 blendOverlay( vec3 base, vec3 blend ) {

	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

}
// TODO: add fresnel to blend with another material (maybe integrate this with material builders?)
// TODO: use fresnel to modulate alpha, so that we can see through when viewed at perpendicular angle, but not parallel
void main() {

	#include <logdepthbuf_fragment>

	vec3 definedColor = useVertexColor ? vertexColor * globalColor : globalColor;
	vec3 base = texture2DProj( tDiffuse, vUv ).rgb * definedColor;
	// gl_FragColor = vec4( blendOverlay( base.rgb, color ), opacity );
	vec3 finalColor = reflectionBlend * base + (1.-reflectionBlend) * definedColor;
	gl_FragColor = vec4( finalColor, opacity );

}