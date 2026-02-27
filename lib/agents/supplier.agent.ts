import { prisma } from "@/lib/prisma"

export async function selectBestSupplier() {
  const suppliers = await prisma.supplierProfile.findMany({
    include: {
      contact: true
    }
  })

  if (!suppliers.length) return null

  suppliers.sort((a, b) => {
    return b.reliabilityScore - a.reliabilityScore
  })

  return suppliers[0]
}