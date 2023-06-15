def createTets(resolution, minQuality, oneFacePerTet, scale = 1.0):

    objs = bpy.context.selected_objects
    if len(objs) != 1:
        return

    obj = objs[0]
    tree = BVHTree.FromObject(obj, bpy.context.evaluated_depsgraph_get())

    tetMesh = bpy.data.meshes.new("Tets")
    bm = bmesh.new()

    # create vertices

    # from input mesh

    tetVerts = []

    for v in obj.data.vertices:
        tetVerts.append(mathutils.Vector((v.co[0] + randEps(), v.co[1] + randEps(), v.co[2] + randEps())))

    # measure vertices

    inf = float('inf')

    center = mathutils.Vector((0.0, 0.0, 0.0))
    bmin  = mathutils.Vector((inf, inf, inf))
    bmax  = mathutils.Vector((-inf, -inf, -inf))
    for p in tetVerts:
        center += p
        for i in range(3):
            bmin[i] = min(bmin[i], p[i])
            bmax[i] = max(bmax[i], p[i])
    center /= len(tetVerts)

    radius = 0.0
    for p in tetVerts:
        d = (p - center).magnitude
        radius = max(radius, d)

    # interior sampling

    if resolution > 0:
        dims = bmax - bmin
        dim = max(dims[0], max(dims[1], dims[2]))
        h = dim / resolution

        for xi in range(int(dims[0] / h) + 1):
            x = bmin[0] + xi * h + randEps()
            for yi in range(int(dims[1] / h) + 1):
               y = bmin[1] + yi * h + randEps()
               for zi in range(int(dims[2] / h) + 1):
                   z = bmin[2] + zi * h + randEps()
                   p = mathutils.Vector((x, y, z))
                   if isInside(tree, p, 0.5 * h):
                       tetVerts.append(p)

    # big tet to start with

    s = 5.0 * radius
    tetVerts.append(mathutils.Vector((-s, 0.0, -s)))
    tetVerts.append(mathutils.Vector((s, 0.0, -s)))
    tetVerts.append(mathutils.Vector((0.0, s, s)))
    tetVerts.append(mathutils.Vector((0.0, -s, s)))

    faces = createTetIds(tetVerts, tree, minQuality)

    numTets = int(len(faces) / 4)

    if oneFacePerTet:
        numSrcPoints = len(obj.data.vertices)
        numPoints = len(tetVerts) - 4
        # copy src points without distortion
        for i in range(0, numSrcPoints):
            co = obj.data.vertices[i].co
            bm.verts.new(co)
        for i in range(numSrcPoints, numPoints):
            p = tetVerts[i]
            bm.verts.new((p.x, p.y, p.z))
    else:
        for i in range(numTets):
            center = (tetVerts[faces[4 * i]] + tetVerts[faces[4 * i + 1]] + tetVerts[faces[4 * i + 2]] + tetVerts[faces[4 * i + 3]]) * 0.25
            for j in range(4):
                for k in range(3):
                    p = tetVerts[faces[4 * i + tetFaces[j][k]]]
                    p = center + (p - center) * scale
                    bm.verts.new((p.x, p.y, p.z))

    bm.verts.ensure_lookup_table()

    nr = 0

    for i in range(numTets):
        if oneFacePerTet:
            id0 = faces[4 * i]
            id1 = faces[4 * i + 1]
            id2 = faces[4 * i + 2]
            id3 = faces[4 * i + 3]
            bm.faces.new([bm.verts[id0], bm.verts[id1], bm.verts[id2], bm.verts[id3]])
        else:
            for j in range(4):
                bm.faces.new([bm.verts[nr], bm.verts[nr + 1], bm.verts[nr + 2]])
                nr = nr + 3

    bm.to_mesh(tetMesh)
    tetMesh.update()

    return tetMesh