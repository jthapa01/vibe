import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (msg) => msg.role === "assistant"
  );

  const lastAssistantTextMessage = result.output[lastAssistantTextMessageIndex] as TextMessage | undefined;
  
  return lastAssistantTextMessage?.content
    ? typeof lastAssistantTextMessage.content === "string"
      ? lastAssistantTextMessage.content
      : lastAssistantTextMessage.content.map((c) => c.text).join("")
    : undefined;
}
