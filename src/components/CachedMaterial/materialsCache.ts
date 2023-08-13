import { Material } from 'three'
const memory = new Map<string, Material>()

export function createMaterial(Clazz: new (params: any) => Material, params: any) {
  const materialId = `${Clazz.name}-${JSON.stringify(params)}`
  const material = memory.get(materialId) || new Clazz(params)
  if (!memory.has(materialId)) {
    memory.set(materialId, material)
  }
  return material
}