import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";

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

export const parseAgentOutput = (value: Message[]) => {
  const output = value[0];

  if(output.type !== "text"){
    return "Fragment";
  }

  if(Array.isArray(output.content)){
    return output.content.map((c) => c.text).join("");
  }else{
    return output.content;
  }
}