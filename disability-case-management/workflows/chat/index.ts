import { convertToModelMessages, UIMessageChunk, type UIMessage } from "ai";
import { DurableAgent } from "@workflow/ai/agent";
import { CASE_MANAGEMENT_ASSISTANT_PROMPT, caseManagementTools } from "./steps/tools";
import { getWritable } from "workflow";

/**
 * The main chat workflow for disability case management
 */
export async function chat(messages: UIMessage[]) {
	"use workflow";

	console.log("Starting disability case management workflow");

	const writable = getWritable<UIMessageChunk>();

	const agent = new DurableAgent({
		model: "bedrock/claude-4-sonnet-20250514-v1",
		system: CASE_MANAGEMENT_ASSISTANT_PROMPT,
		tools: caseManagementTools,
	});

	await agent.stream({
		messages: convertToModelMessages(messages),
		writable,
	});

	console.log("Finished disability case management workflow");
}
