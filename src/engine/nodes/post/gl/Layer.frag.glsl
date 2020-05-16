uniform sampler2D texture1;
uniform sampler2D texture2;
varying vec2 vUv;

void main() {

	vec4 t1 = texture2D( texture1, vUv);
	vec4 t2 = texture2D( texture2, vUv);

	vec3 c1 = t1.rgb * t1.a * (1.0-t2.a);
	vec3 c2 = t2.rgb * t2.a;
	float a = t2.a + t1.a;
	vec3 c = max(c1,c2);

	gl_FragColor = vec4(c,a);

}