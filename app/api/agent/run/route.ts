import { runAgentSystem } from "@/lib/agents/orchestrator"

export async function GET() {
  const userId = "cmm4lmteq0000rzepq19zanls"
  await runAgentSystem(userId)

  return Response.json({ message: "Agent executed (GET)" })
}

export async function POST() {
  const userId = "cmm4lmteq0000rzepq19zanls"
  await runAgentSystem(userId)

  return Response.json({ message: "Agent executed (POST)" })
}