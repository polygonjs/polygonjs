// https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-plane-and-ray-disk-intersection
// bool intersectPlane(vec3 plane_normal, vec3 plane_center, vec3 ray_origin, vec3 ray_dir, float &intersect)
// {
// 	// assuming vectors are all normalized
// 	float denom = dotProduct(plane_normal, ray_dir);
// 	if (denom > 1e-6) {
// 		Vec3f p0l0 = plane_center - ray_origin;
// 		intersect = dotProduct(p0l0, plane_normal) / denom;
// 		return (intersect >= 0);
// 	}

// 	return false;
// }

// https://gist.github.com/doxas/e9a3d006c7d19d2a0047
struct Intersection{
	float t;
	float hit;
	vec3  hitPoint;
	vec3  normal;
	vec3  color;
};

struct Sphere{
	vec3  position;
	float radius;
};

struct Plane{
	vec3 position;
	vec3 normal;
};
struct PointWithVelocity{
	vec3 position;
	vec3 velocity;
};
// void intersectSphere(vec3 ray, Sphere s, inout Intersection i){
// 	vec3  a = cPos - s.position;
// 	float b = dot(a, ray);
// 	float c = dot(a, a) - (s.radius * s.radius);
// 	float d = b * b - c;
// 	if(d > 0.0){
// 		float t = -b - sqrt(d);
// 		if(t > 0.0 && t < i.t){
// 			i.t = t;
// 			i.hit = 1.0;
// 			i.hitPoint = vec3(
// 				cPos.x + ray.x * t,
// 				cPos.y + ray.y * t,
// 				cPos.z + ray.z * t
// 			);
// 			i.normal = normalize(i.hitPoint - s.position);
// 			// float diff = clamp(dot(i.normal, lightDirection), 0.1, 1.0);
// 			// i.color = vec3(diff);
// 		}
// 	}
// }

void intersectPlane(vec3 ray, Plane p, inout Intersection i){
	float d = -dot(p.position, p.normal);
	float v = dot(ray, p.normal);
	float t = -(dot(cPos, p.normal) + d) / v;
	if(t > 0.0 && t < i.t){
		i.t = t;
		i.hit = 1.0;
		i.hitPoint = vec3(
			cPos.x + t * ray.x,
			cPos.y + t * ray.y,
			cPos.z + t * ray.z
		);
		i.normal = p.normal;
		// float diff = clamp(dot(i.normal, lightDirection), 0.1, 1.0);
		// float m = mod(i.hitPoint.x, 2.0);
		// float n = mod(i.hitPoint.z, 2.0);
		// if((m > 1.0 && n > 1.0) || (m < 1.0 && n < 1.0)){
		// 	diff -= 0.5;
		// }
		
		// t = min(i.hitPoint.z, 100.0) * 0.01;
		// i.color = vec3(diff + t);
	}
}
// if(i.hit > 0.0)

PointWithVelocity collide_with_plane(PointWithVelocity point, Plane plane){
	Intersection intersection;
	intersectPlane(point.velocity, plane, intersection)
	return point
}