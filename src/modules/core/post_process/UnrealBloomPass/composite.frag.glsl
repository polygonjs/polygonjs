varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
// uniform bool bloomPremult;

float lerpBloomFactor(const in float factor) {
	float mirrorFactor = 1.2 - factor;
	return mix(factor, mirrorFactor, bloomRadius);
}

vec3 LUMA = vec3( 0.2125, 0.7154, 0.0721 );
float luminance( vec3 rgb ) {
	return dot( rgb, LUMA );
}

void main() {
	gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
		lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
		lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
		lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
		lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

	// if(bloomPremult){
		// gl_FragColor.a = luminance(gl_FragColor.rgb);
		gl_FragColor.a = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
		// gl_FragColor.rgb *= gl_FragColor.a;
	// }
}