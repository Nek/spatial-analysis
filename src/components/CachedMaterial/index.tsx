import { createMaterial } from '$/components/CachedMaterial/materialsCache'

type CachedMaterialParameters = Parameters<typeof createMaterial>
type CachedMaterialProps = {constructor: CachedMaterialParameters[0], parameters: CachedMaterialParameters[1]}
export function CachedMaterial({ constructor, parameters }: CachedMaterialProps) {
  const material = createMaterial(constructor, parameters)
  return <primitive object={material} />
}

