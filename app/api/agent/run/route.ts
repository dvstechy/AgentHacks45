import { prisma } from "@/lib/prisma"
import { runAgentSystem } from "@/lib/agents/orchestrator"

async function executeAgent() {
  const user = await prisma.user.findFirst({
    where: { email: "bhosvivek123@gmail.com" }
  })

  if (!user) {
    console.log("User not found")
    return
  }

  await runAgentSystem(user.id)
}

export async function GET() {
  await executeAgent()
  return Response.json({ message: "Agent executed (GET)" })
}

export async function POST() {
  await executeAgent()
  return Response.json({ message: "Agent executed (POST)" })
}