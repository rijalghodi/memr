package openai

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/packages/param"
	"github.com/openai/openai-go/v3/shared/constant"
)

type OpenAIClient struct {
	client openai.Client
}

func NewOpenAIClient(apiKey string) (*OpenAIClient, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is required")
	}

	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	return &OpenAIClient{
		client: client,
	}, nil
}

// GenerateEmbedding generates an embedding for the given text using text-embedding-3-small model
func (u *OpenAIClient) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	if text == "" {
		return []float32{}, nil
	}

	input := openai.EmbeddingNewParamsInputUnion{
		OfString: param.Opt[string]{Value: text},
	}

	response, err := u.client.Embeddings.New(ctx, openai.EmbeddingNewParams{
		Model: openai.EmbeddingModelTextEmbedding3Small,
		Input: input,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create embedding: %w", err)
	}

	if len(response.Data) == 0 {
		return nil, fmt.Errorf("no embeddings returned")
	}

	// Convert []float64 to []float32
	embedding := response.Data[0].Embedding
	embeddingFloat32 := make([]float32, len(embedding))
	for i, v := range embedding {
		embeddingFloat32[i] = float32(v)
	}

	return embeddingFloat32, nil
}

// ChatMessage represents a message in the chat
type ChatMessage struct {
	Role       string         `json:"role"`
	Content    string         `json:"content,omitempty"`
	ToolCalls  []ChatToolCall `json:"tool_calls,omitempty"`
	ToolCallID *string        `json:"tool_call_id,omitempty"`
	Name       *string        `json:"name,omitempty"`
}

// ChatToolCall represents a tool call in the chat
type ChatToolCall struct {
	ID       string           `json:"id"`
	Type     string           `json:"type"`
	Function ChatFunctionCall `json:"function"`
}

// ChatFunctionCall represents a function call
type ChatFunctionCall struct {
	Name      string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments"`
}

// ChatTool represents a tool definition
type ChatTool struct {
	Type     string           `json:"type"`
	Function ChatToolFunction `json:"function"`
}

// ChatToolFunction represents a function definition for a tool
type ChatToolFunction struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Parameters  map[string]interface{} `json:"parameters"`
}

// ChatResponse represents the response from the chat API
type ChatResponse struct {
	Message      ChatMessage `json:"message"`
	FinishReason string      `json:"finish_reason"`
}

// CreateChatCompletion creates a chat completion with tool calling support using Chat Completions API
func (u *OpenAIClient) CreateChatCompletion(ctx context.Context, systemPrompt string, messages []ChatMessage, tools []ChatTool) (*ChatResponse, error) {
	// Convert messages to OpenAI Chat Completions API format
	chatMessages := make([]openai.ChatCompletionMessageParamUnion, 0, len(messages)+1)

	// Add system message if provided
	if systemPrompt != "" {
		chatMessages = append(chatMessages, openai.SystemMessage(systemPrompt))
	}

	// Convert user/assistant/tool messages
	for _, msg := range messages {
		if msg.ToolCallID != nil && msg.Role == "tool" {
			// Tool response message
			chatMessages = append(chatMessages, openai.ToolMessage(msg.Content, *msg.ToolCallID))
		} else if msg.Role == "user" {
			chatMessages = append(chatMessages, openai.UserMessage(msg.Content))
		} else if msg.Role == "assistant" {
			if len(msg.ToolCalls) > 0 {
				// Convert tool calls to OpenAI format
				toolCalls := make([]openai.ChatCompletionMessageToolCallUnionParam, 0, len(msg.ToolCalls))
				for _, tc := range msg.ToolCalls {
					argsBytes, err := json.Marshal(tc.Function.Arguments)
					if err != nil {
						return nil, fmt.Errorf("failed to marshal tool call arguments: %w", err)
					}
					toolCalls = append(toolCalls, openai.ChatCompletionMessageToolCallUnionParam{
						OfFunction: &openai.ChatCompletionMessageFunctionToolCallParam{
							ID:   tc.ID,
							Type: constant.Function("function"),
							Function: openai.ChatCompletionMessageFunctionToolCallFunctionParam{
								Name:      tc.Function.Name,
								Arguments: string(argsBytes),
							},
						},
					})
				}
				// Create assistant message with tool calls
				assistantMsg := openai.ChatCompletionAssistantMessageParam{
					Role:      constant.Assistant("assistant"),
					ToolCalls: toolCalls,
				}
				// Content is optional when tool_calls is present, but we include it if available
				if msg.Content != "" {
					assistantMsg.Content = openai.ChatCompletionAssistantMessageParamContentUnion{
						OfString: param.NewOpt(msg.Content),
					}
				}
				chatMessages = append(chatMessages, openai.ChatCompletionMessageParamUnion{
					OfAssistant: &assistantMsg,
				})
			} else {
				// Simple assistant message without tool calls
				chatMessages = append(chatMessages, openai.AssistantMessage(msg.Content))
			}
		}
	}

	// Convert tools to OpenAI format
	chatTools := make([]openai.ChatCompletionToolUnionParam, 0, len(tools))
	for _, tool := range tools {
		chatTools = append(chatTools, openai.ChatCompletionFunctionTool(openai.FunctionDefinitionParam{
			Name:        tool.Function.Name,
			Description: param.Opt[string]{Value: tool.Function.Description},
			Parameters:  tool.Function.Parameters,
		}))
	}

	// Create chat completion request
	params := openai.ChatCompletionNewParams{
		Model:    openai.ChatModelGPT4oMini,
		Messages: chatMessages,
	}

	if len(chatTools) > 0 {
		params.Tools = chatTools
		params.ToolChoice = openai.ChatCompletionToolChoiceOptionUnionParam{
			OfAuto: param.Opt[string]{Value: "auto"},
		}
	}

	response, err := u.client.Chat.Completions.New(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create chat completion: %w", err)
	}

	if len(response.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned from OpenAI")
	}

	choice := response.Choices[0]
	result := &ChatResponse{
		FinishReason: string(choice.FinishReason),
		Message: ChatMessage{
			Role:    string(choice.Message.Role),
			Content: choice.Message.Content,
		},
	}

	// Parse tool calls if present
	if len(choice.Message.ToolCalls) > 0 {
		resultToolCalls := make([]ChatToolCall, 0, len(choice.Message.ToolCalls))
		for _, tc := range choice.Message.ToolCalls {
			if tc.Type == "function" {
				var args map[string]interface{}
				if err := json.Unmarshal([]byte(tc.Function.Arguments), &args); err != nil {
					return nil, fmt.Errorf("failed to unmarshal tool call arguments: %w", err)
				}
				resultToolCalls = append(resultToolCalls, ChatToolCall{
					ID:   tc.ID,
					Type: "function",
					Function: ChatFunctionCall{
						Name:      tc.Function.Name,
						Arguments: args,
					},
				})
			}
		}
		result.Message.ToolCalls = resultToolCalls
	}

	return result, nil
}
