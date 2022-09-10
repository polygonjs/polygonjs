// https://www.shadertoy.com/view/sllGDN
float sdRhombusTriacontahedron(vec3 p, float m1, float m2, float f)
{
	float d = sdBox(p, vec3(1));

	float c = cos(3.1415 * m1);
	float s=sqrt(m2-c*c);
	vec3 n = vec3(-0.5, -c, s);

	p = abs(p);
	p -= f*min(0., dot(p, n))*n;

	p.xy = abs(p.xy);
	p -= f*min(0., dot(p, n))*n;

	p.xy = abs(p.xy);
	p -= f*min(0., dot(p, n))*n;

	d = p.z-1.;
	return d;
}