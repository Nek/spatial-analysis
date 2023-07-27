import { Box3, Color, Vector3 } from 'three'
import { Octree, KeyDesign } from 'linear-octree'

export default function marchCubes(
  { positions, colors }: { positions: Vector3[]; colors: Color[] },
  depth: number,
): { octree: Octree<Color[]>; texture3D: ImageData[] } {
  const maxDim = Math.pow(2, depth)
  const level = 0

  function pointsToOctree() {
    const keyDesign = new KeyDesign(depth, depth, depth)

    const bBox = new Box3()

    // calculate bounding box of the molecule
    bBox.setFromPoints(positions)

    // calculate the minimum and maximum of the bounding box
    let minMin = Math.min(bBox.min.x, bBox.min.y, bBox.min.z)
    let maxMax = Math.max(bBox.max.x, bBox.max.y, bBox.max.z)

    // calculate the width of a cell taking in account outer padding of always empty cells
    const cellWidth = (maxMax - minMin) / (maxDim - 2)

    // add padding to bounding box
    minMin -= cellWidth
    maxMax += cellWidth

    bBox.set(new Vector3(minMin, minMin, minMin), new Vector3(maxMax, maxMax, maxMax))

    const octree = new Octree<Color[]>(bBox, keyDesign)

    const box = new Box3()

    keyDesign.getMinKeyCoordinates(box.min)
    keyDesign.getMaxKeyCoordinates(box.max)

    const keyCoordinates = new Vector3()

    for (const key of keyDesign.keyRange(box.min, box.max)) {
      octree.set(keyDesign.unpackKey(key, keyCoordinates), level, [])
    }

    function addPoint(position: Vector3, color: Color) {
      const keyCoordinates = new Vector3()
      octree.calculateKeyCoordinates(position, level, keyCoordinates)
      const data = octree.get(keyCoordinates, level)
      octree.set(keyCoordinates, level, [...data!, color])
    }

    // calculate the radius of an atom
    const atomR = Math.sqrt(cellWidth * cellWidth) / 2

    positions.forEach((position, i) => {
      const sides = [
        [atomR, 0, 0],
        [0, atomR, 0],
        [0, 0, atomR],
        [-atomR, 0, 0],
        [0, -atomR, 0],
        [0, 0, -atomR],
      ].map((side) => {
        return position.clone().add(new Vector3(...side))
      })
      sides.forEach((side) => addPoint(side, colors[i]))
    })

    return octree
  }

  const octree = pointsToOctree()

  function octreeTo3DTexture() {
    const keyDesign = new KeyDesign(depth, depth, depth)

    const box = new Box3()

    keyDesign.getMinKeyCoordinates(box.min)
    keyDesign.getMaxKeyCoordinates(box.max)

    const keyCoordinates = new Vector3()

    const layers = []

    let maxDensity = 0
    for (const key of keyDesign.keyRange(box.min, box.max)) {
      keyDesign.unpackKey(key, keyCoordinates)
      maxDensity = Math.max(maxDensity, octree.get(keyCoordinates, level)!.length)
    }

    for (let x = 0; x < maxDim; x++) {
      const layer = new Uint8ClampedArray(maxDim * maxDim * 4)
      for (let y = 0; y < maxDim; y++) {
        for (let z = 0; z < maxDim; z++) {
          const keyCoordinates = new Vector3(x, y, z)
          const data = octree.get(keyCoordinates, level)!
          if (data.length === 0) {
            layer.set([0, 0, 0, 0], (y + z * maxDim) * 4)
          } else {
            const color = (
              data.length > 1
                ? data.reduce((acc, color) => {
                    return acc.lerp(color, 0.5)
                  })
                : data[0]
            )
              .toArray()
              .map((comp) => Math.round(comp * 255))
            const alpha = Math.round((data.length / maxDensity) * 255)
            layer.set([...color, alpha], (y + z * maxDim) * 4)
          }
        }
      }
      layers.push(new ImageData(layer, maxDim))
    }

    return layers
  }

  const texture3D = octreeTo3DTexture()

  return {
    texture3D,
    octree,
  }
}
