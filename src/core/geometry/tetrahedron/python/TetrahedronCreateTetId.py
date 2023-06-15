def createTetIds(verts, tree, minQuality):

    tetIds = []
    neighbors = []
    tetMarks = []
    tetMark = 0
    firstFreeTet = -1

    planesN = []
    planesD = []

    firstBig = len(verts) - 4

    # first big tet
    tetIds.append(firstBig)
    tetIds.append(firstBig + 1)
    tetIds.append(firstBig + 2)
    tetIds.append(firstBig + 3)
    tetMarks.append(0)

    for i in range(4):
        neighbors.append(-1)
        p0 = verts[firstBig + tetFaces[i][0]]
        p1 = verts[firstBig + tetFaces[i][1]]
        p2 = verts[firstBig + tetFaces[i][2]]
        n = (p1 - p0).cross(p2 - p0)
        n.normalize()
        planesN.append(n)
        planesD.append(p0.dot(n))

    center = mathutils.Vector((0.0, 0.0, 0.0))

    print(" ------------- tetrahedralization ------------------- ")
    
    for i in range(0, firstBig):
        p = verts[i]

        if i % 100 == 0:
            print("inserting vert", i + 1, "of", firstBig)

        # find non-deleted tet

        tetNr = 0
        while tetIds[4 * tetNr] < 0:
            tetNr = tetNr + 1
            
        # find containing tet

        tetMark = tetMark + 1
        found = False

        while not found:
            if tetNr < 0 or tetMarks[tetNr] == tetMark:
                break
            tetMarks[tetNr] = tetMark

            id0 = tetIds[4 * tetNr]
            id1 = tetIds[4 * tetNr + 1]
            id2 = tetIds[4 * tetNr + 2]
            id3 = tetIds[4 * tetNr + 3]

            center = (verts[id0] + verts[id1] + verts[id2] + verts[id3]) * 0.25

            minT = float('inf')
            minFaceNr = -1

            for j in range(0, 4):
                n = planesN[4 * tetNr + j]
                d = planesD[4 * tetNr + j]

                hp = n.dot(p) - d
                hc = n.dot(center) - d

                t = hp - hc
                if t == 0:
                    continue

                # time when c -> p hits the face
                t = -hc / t

                if t >= 0.0 and t < minT:
                    minT = t
                    minFaceNr = j
            
            if minT >= 1.0:
                found = True
            else:
                tetNr = neighbors[4 * tetNr + minFaceNr]
        
        if not found:
            print("*********** failed to insert vertex")
            continue
        
        # find violating tets

        tetMark = tetMark + 1

        violatingTets = []
        stack = [tetNr]

        while len(stack) != 0:
            tetNr = stack.pop()
            if tetMarks[tetNr] == tetMark:
                continue
            tetMarks[tetNr] = tetMark
            violatingTets.append(tetNr)

            for j in range(4):
                n = neighbors[4 * tetNr + j]
                if n < 0 or tetMarks[n] == tetMark:
                    continue
                
                # Delaunay condition test

                id0 = tetIds[4 * n]
                id1 = tetIds[4 * n + 1]
                id2 = tetIds[4 * n + 2]
                id3 = tetIds[4 * n + 3]

                c = getCircumCenter(verts[id0], verts[id1], verts[id2], verts[id3])

                r = (verts[id0] - c).magnitude
                if (p - c).magnitude < r:
                    stack.append(n)

        # remove old tets, create new ondes

        edges = []

        for j in range(len(violatingTets)):
            tetNr = violatingTets[j]

            # copy info before we delete it
            ids = [0] * 4
            ns = [0] * 4
            for k in range(4):
                ids[k] = tetIds[4 * tetNr + k]
                ns[k] = neighbors[4 * tetNr + k]

            # delete the tet
            tetIds[4 * tetNr] = -1
            tetIds[4 * tetNr + 1] = firstFreeTet
            firstFreeTet = tetNr

            # visit neighbors

            for k in range(4):
                n = ns[k]
                if n >= 0 and tetMarks[n] == tetMark:
                    continue

                # no neighbor or neighbor is not-violating -> we are facing the border

                # create new tet

                newTetNr = firstFreeTet
                
                if newTetNr >= 0:
                    firstFreeTet = tetIds[4 * firstFreeTet + 1]
                else:
                    newTetNr = int(len(tetIds) / 4)
                    tetMarks.append(0)
                    for l in range(4):
                        tetIds.append(-1)
                        neighbors.append(-1)
                        planesN.append(mathutils.Vector((0.0, 0.0, 0.0)))
                        planesD.append(0.0)

                id0 = ids[tetFaces[k][2]]
                id1 = ids[tetFaces[k][1]]
                id2 = ids[tetFaces[k][0]]

                tetIds[4 * newTetNr] = id0
                tetIds[4 * newTetNr + 1] = id1
                tetIds[4 * newTetNr + 2] = id2
                tetIds[4 * newTetNr + 3] = i

                neighbors[4 * newTetNr] = n

                if n >= 0:
                    for l in range(4):
                        if neighbors[4 * n + l] == tetNr:
                            neighbors[4 * n + l] = newTetNr
                        
                # will set the neighbors among the new tets later

                neighbors[4 * newTetNr + 1] = -1
                neighbors[4 * newTetNr + 2] = -1
                neighbors[4 * newTetNr + 3] = -1

                for l in range(4):
                    p0 = verts[tetIds[4 * newTetNr + tetFaces[l][0]]]
                    p1 = verts[tetIds[4 * newTetNr + tetFaces[l][1]]]
                    p2 = verts[tetIds[4 * newTetNr + tetFaces[l][2]]]
                    newN = (p1 - p0).cross(p2 - p0)
                    newN.normalize()
                    planesN[4 * newTetNr + l] = newN
                    planesD[4 * newTetNr + l] = newN.dot(p0)

                if id0 < id1:
                    edges.append((id0, id1, newTetNr, 1))
                else:
                    edges.append((id1, id0, newTetNr, 1))

                if id1 < id2:
                    edges.append((id1, id2, newTetNr, 2))
                else:
                    edges.append((id2, id1, newTetNr, 2))

                if id2 < id0:
                    edges.append((id2, id0, newTetNr, 3))
                else:
                    edges.append((id0, id2, newTetNr, 3))

            # next neighbor
        # next violating tet

        # fix neighbors

        sortedEdges = sorted(edges, key = cmp_to_key(compareEdges))

        nr = 0
        numEdges = len(sortedEdges)

        while nr < numEdges:
            e0 = sortedEdges[nr]
            nr = nr + 1

            if nr < numEdges and equalEdges(sortedEdges[nr], e0):
                e1 = sortedEdges[nr]

                id0 = tetIds[4 * e0[2]]
                id1 = tetIds[4 * e0[2] + 1]
                id2 = tetIds[4 * e0[2] + 2]
                id3 = tetIds[4 * e0[2] + 3]

                jd0 = tetIds[4 * e1[2]]
                jd1 = tetIds[4 * e1[2] + 1]
                jd2 = tetIds[4 * e1[2] + 2]
                jd3 = tetIds[4 * e1[2] + 3]

                neighbors[4 * e0[2] + e0[3]] = e1[2]
                neighbors[4 * e1[2] + e1[3]] = e0[2]
                nr = nr + 1

    # next point

    # remove outer, deleted and outside tets

    numTets = int(len(tetIds) / 4)
    num = 0
    numBad = 0

    for i in range(numTets):
        id0 = tetIds[4 * i]
        id1 = tetIds[4 * i + 1]
        id2 = tetIds[4 * i + 2]
        id3 = tetIds[4 * i + 3]

        if id0 < 0 or id0 >= firstBig or id1 >= firstBig or id2 >= firstBig or id3 >= firstBig:
            continue

        p0 = verts[id0]
        p1 = verts[id1]
        p2 = verts[id2]
        p3 = verts[id3]
        
        quality = tetQuality(p0, p1, p2, p3)
        if quality < minQuality:
            numBad = numBad + 1
            continue

        center = (p0 + p1 + p2 + p3) * 0.25
        if not isInside(tree, center):
            continue

        tetIds[num] = id0
        num = num + 1
        tetIds[num] = id1
        num = num + 1
        tetIds[num] = id2
        num = num + 1
        tetIds[num] = id3
        num = num + 1

    del tetIds[num:]

    print(numBad, "bad tets deleted")
    print(int(len(tetIds) / 4),"tets created")

    return tetIds