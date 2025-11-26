"use client";

import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@workflow/ai";
import { useEffect, useMemo, useRef } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import ChatInput from "@/components/chat-input";
import type { MyUIMessage } from "@/schemas/chat";

const SUGGESTIONS = [
  "I need to file a new disability claim",
  "Check the status of my case DC123ABC",
  "What documents do I need for a physical disability claim?",
  "Schedule an appointment for my medical examination",
  "I need to update my contact information on my case",
];

export default function ChatPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeWorkflowRunId = useMemo(() => {
    if (typeof window === "undefined") return;
    return localStorage.getItem("active-workflow-run-id") ?? undefined;
  }, []);

  const { stop, messages, sendMessage, status, setMessages } =
    useChat<MyUIMessage>({
      resume: !!activeWorkflowRunId,
      onError(error) {
        console.error("onError", error);
      },
      onFinish(data) {
        console.log("onFinish", data);

        // Update the chat history in `localStorage` to include the latest bot message
        console.log("Saving chat history to localStorage", data.messages);
        localStorage.setItem("chat-history", JSON.stringify(data.messages));

        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      },

      transport: new WorkflowChatTransport({
        onChatSendMessage: (response, options) => {
          console.log("onChatSendMessage", response, options);

          // Update the chat history in `localStorage` to include the latest user message
          localStorage.setItem(
            "chat-history",
            JSON.stringify(options.messages),
          );

          // We'll store the workflow run ID in `localStorage` to allow the client
          // to resume the chat session after a page refresh or network interruption
          const workflowRunId = response.headers.get("x-workflow-run-id");
          if (!workflowRunId) {
            throw new Error(
              'Workflow run ID not found in "x-workflow-run-id" response header',
            );
          }
          localStorage.setItem("active-workflow-run-id", workflowRunId);
        },
        onChatEnd: ({ chatId, chunkIndex }) => {
          console.log("onChatEnd", chatId, chunkIndex);

          // Once the chat stream ends, we can remove the workflow run ID from `localStorage`
          localStorage.removeItem("active-workflow-run-id");
        },
        // Configure reconnection to use the stored workflow run ID
        prepareReconnectToStreamRequest: ({ id, api, ...rest }) => {
          console.log("prepareReconnectToStreamRequest", id);
          const workflowRunId = localStorage.getItem("active-workflow-run-id");
          if (!workflowRunId) {
            throw new Error("No active workflow run ID found");
          }
          // Use the workflow run ID instead of the chat ID for reconnection
          return {
            ...rest,
            api: `/api/chat/${encodeURIComponent(workflowRunId)}/stream`,
          };
        },
        // Optional: Configure error handling for reconnection attempts
        maxConsecutiveErrors: 5,
      }),
    });

  // Load chat history from `localStorage`. In a real-world application,
  // this would likely be done on the server side and loaded from a database,
  // but for the purposes of this demo, we'll load it from `localStorage`.
  useEffect(() => {
    const chatHistory = localStorage.getItem("chat-history");
    if (!chatHistory) return;
    setMessages(JSON.parse(chatHistory) as MyUIMessage[]);
  }, [setMessages]);

  // Activate the input field
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-2xl pt-12 pb-24 mx-auto stretch">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Disability Case Management</h1>
        <p className="text-muted-foreground">Manage disability benefit cases using workflows</p>
      </div>

      {messages.length === 0 && (
        <div className="mb-8 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">
              How can I help you today?
            </h2>
            <p className="text-muted-foreground text-sm">
              Try one of these suggestions or ask anything about disability cases
            </p>
          </div>
          <Suggestions>
            {SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion}
                suggestion={suggestion}
                onClick={(suggestion) =>
                  sendMessage({
                    text: suggestion,
                    metadata: { createdAt: Date.now() },
                  })
                }
              />
            ))}
          </Suggestions>
          <div className="mt-10 p-3 bg-muted/25 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-3">
              To see the full extent of agentic tool-calling and workflows, use
              this prompt:
            </p>
            <button
              type="button"
              onClick={() => {
                sendMessage({
                  text: "Create a new disability case for John Smith, born 1985-03-15, with a physical disability affecting mobility due to a spinal injury. Then schedule an initial consultation appointment for next week.",
                  metadata: { createdAt: Date.now() },
                });
              }}
              className="text-sm border px-3 py-2 rounded-md bg-muted/50 text-left hover:bg-muted/75 transition-colors cursor-pointer"
            >
              Create a new disability case for John Smith, born 1985-03-15, with
              a physical disability affecting mobility due to a spinal injury.
              Then schedule an initial consultation appointment for next week.
            </button>
          </div>
        </div>
      )}
      <Conversation className="mb-10">
        <ConversationContent>
          {messages.map((message, index) => {
            const hasText = message.parts.some((part) => part.type === "text");

            return (
              <div key={message.id}>
                {message.role === "assistant" &&
                  index === messages.length - 1 &&
                  (status === "submitted" || status === "streaming") &&
                  !hasText && (
                    <Shimmer className="text-sm">Processing...</Shimmer>
                  )}
                <Message from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
                      // Render text parts
                      if (part.type === "text") {
                        return (
                          <Response key={`${message.id}-text-${partIndex}`}>
                            {part.text}
                          </Response>
                        );
                      }

                      // Render workflow data messages
                      if (part.type === "data-workflow" && "data" in part) {
                        const data = part.data as any;
                        return (
                          <div
                            key={`${message.id}-data-${partIndex}`}
                            className="text-xs px-3 py-2 rounded-md mb-2 bg-blue-700/25 text-blue-300 border border-blue-700/25"
                          >
                            {data.message}
                          </div>
                        );
                      }

                      // Render tool parts
                      // Type guard to check if this is a tool invocation part
                      if (
                        part.type === "tool-createCase" ||
                        part.type === "tool-checkCaseStatus" ||
                        part.type === "tool-updateCase" ||
                        part.type === "tool-assignCaseworker" ||
                        part.type === "tool-addDocumentation" ||
                        part.type === "tool-scheduleAppointment" ||
                        part.type === "tool-getEligibilityCriteria"
                      ) {
                        // Additional type guard to ensure we have the required properties
                        if (!("toolCallId" in part) || !("state" in part)) {
                          return null;
                        }
                        return (
                          <Tool
                            key={part.toolCallId}
                            className="hover:bg-secondary/25 transition-colors"
                          >
                            <ToolHeader type={part.type} state={part.state} />
                            <ToolContent>
                              {part.input ? (
                                <ToolInput input={part.input as any} />
                              ) : null}
                              <ToolOutput
                                output={
                                  part.state === "output-available"
                                    ? renderToolOutput(part)
                                    : undefined
                                }
                                errorText={part.errorText}
                              />
                            </ToolContent>
                          </Tool>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              </div>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <ChatInput
        status={status}
        textareaRef={textareaRef}
        setMessages={setMessages}
        sendMessage={(message) => {
          sendMessage({
            text: message.text || "",
            metadata: message.metadata,
          });
        }}
        stop={stop}
      />
    </div>
  );
}

// Helper function to render tool outputs with proper formatting
function renderToolOutput(part: any) {
  const partOutput = part.output as any;
  if (!partOutput) {
    return null;
  }
  const parsedPartOutput = JSON.parse(partOutput);
  const output = parsedPartOutput.output.value;
  const parsedOutput = JSON.parse(output);

  switch (part.type) {
    case "tool-createCase": {
      const caseData = parsedOutput;
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-600">✅ Case Created Successfully!</div>
          <div className="space-y-1 text-sm">
            <div>
              Case ID:{" "}
              <span className="font-mono font-medium">{caseData.caseId}</span>
            </div>
            <div>Applicant: {caseData.applicantName}</div>
            <div>Disability Type: {caseData.disabilityType}</div>
            <div>Status: <span className="text-yellow-600">{caseData.status}</span></div>
            <div>Caseworker: {caseData.assignedCaseworker?.name}</div>
            <div className="text-muted-foreground mt-2">
              <div className="font-medium">Next Steps:</div>
              <ul className="list-disc list-inside">
                {caseData.nextSteps?.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    case "tool-checkCaseStatus": {
      const status = parsedOutput;
      const statusColor = 
        status.status === "Approved" ? "text-green-600" :
        status.status === "Denied" ? "text-red-600" :
        status.status === "Closed" ? "text-gray-600" :
        "text-yellow-600";
      return (
        <div className="space-y-1 text-sm">
          <div className="font-medium">Case {status.caseId}</div>
          <div>
            Status:{" "}
            <span className={`${statusColor} font-medium`}>
              {status.status}
            </span>
          </div>
          <div className="text-muted-foreground">Type: {status.disabilityType}</div>
          <div className="text-muted-foreground">
            Filed: {new Date(status.filingDate).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground">
            Last Updated: {new Date(status.lastUpdated).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground">
            Est. Completion: {status.estimatedCompletion}
          </div>
          <div className="mt-2">
            <div className="font-medium">Caseworker:</div>
            <div className="text-muted-foreground">{status.assignedCaseworker?.name}</div>
            <div className="text-muted-foreground">{status.assignedCaseworker?.department}</div>
            <div className="text-muted-foreground">{status.assignedCaseworker?.phone}</div>
          </div>
          {status.pendingActions && status.pendingActions[0] !== "None - awaiting processing" && (
            <div className="mt-2">
              <div className="font-medium">Pending Actions:</div>
              <ul className="list-disc list-inside text-muted-foreground">
                {status.pendingActions.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    case "tool-updateCase": {
      const update = parsedOutput;
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-600">✅ Case Updated!</div>
          <div className="space-y-1 text-sm">
            <div>
              Update ID:{" "}
              <span className="font-mono">{update.updateId}</span>
            </div>
            <div>Case: {update.caseId}</div>
            <div>Type: {update.updateType}</div>
            <div className="text-muted-foreground">{update.message}</div>
          </div>
        </div>
      );
    }

    case "tool-assignCaseworker": {
      const assignment = parsedOutput;
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-600">✅ Caseworker Assigned!</div>
          <div className="space-y-1 text-sm">
            <div>Case: {assignment.caseId}</div>
            <div className="font-medium">{assignment.assignedCaseworker?.name}</div>
            <div className="text-muted-foreground">{assignment.assignedCaseworker?.department}</div>
            <div className="text-muted-foreground">Specialty: {assignment.assignedCaseworker?.specialty}</div>
            <div className="text-muted-foreground mt-2">{assignment.message}</div>
          </div>
        </div>
      );
    }

    case "tool-addDocumentation": {
      const doc = parsedOutput;
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-600">✅ Documentation Added!</div>
          <div className="space-y-1 text-sm">
            <div>
              Document ID:{" "}
              <span className="font-mono">{doc.documentId}</span>
            </div>
            <div>Case: {doc.caseId}</div>
            <div>Type: {doc.documentType}</div>
            <div>Status: <span className="text-yellow-600">{doc.status}</span></div>
            <div className="text-muted-foreground mt-2">{doc.message}</div>
            {doc.requiredActions && doc.requiredActions[0] !== "No additional actions required" && (
              <div className="mt-2">
                <div className="font-medium">Required Actions:</div>
                <ul className="list-disc list-inside text-muted-foreground">
                  {doc.requiredActions.map((action: string, i: number) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "tool-scheduleAppointment": {
      const appt = parsedOutput;
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-600">✅ Appointment Scheduled!</div>
          <div className="space-y-1 text-sm">
            <div>
              Appointment ID:{" "}
              <span className="font-mono">{appt.appointmentId}</span>
            </div>
            <div>Case: {appt.caseId}</div>
            <div>Type: {appt.appointmentType}</div>
            <div>Date/Time: {new Date(appt.dateTime).toLocaleString()}</div>
            <div>Location: {appt.location}</div>
            <div>Duration: {appt.duration}</div>
            <div className="mt-2">
              <div className="font-medium">Preparation Instructions:</div>
              <ul className="list-disc list-inside text-muted-foreground">
                {appt.preparationInstructions?.map((instruction: string, i: number) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    case "tool-getEligibilityCriteria": {
      const criteria = parsedOutput;
      return (
        <div className="space-y-2 text-sm">
          <div className="font-medium">{criteria.disabilityType} - Eligibility Criteria</div>
          <div>
            <div className="font-medium">Requirements:</div>
            <ul className="list-disc list-inside text-muted-foreground">
              {criteria.requirements?.map((req: string, i: number) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-medium">Required Documentation:</div>
            <ul className="list-disc list-inside text-muted-foreground">
              {criteria.requiredDocumentation?.map((doc: string, i: number) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>
          <div className="text-muted-foreground">
            Estimated Processing Time: {criteria.estimatedProcessingTime}
          </div>
          <div className="text-muted-foreground text-xs mt-2">
            {criteria.additionalInfo}
          </div>
          <div className="text-muted-foreground text-xs">
            Helpline: {criteria.helplineNumber}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
