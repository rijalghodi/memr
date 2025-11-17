package usecase

import (
	"app/pkg/logger"
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/packages/param"
	"go.uber.org/zap"
)

type OpenAIUsecase struct {
	client openai.Client
}

func NewOpenAIUsecase(apiKey string) (*OpenAIUsecase, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is required")
	}

	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	return &OpenAIUsecase{
		client: client,
	}, nil
}

// GenerateEmbedding generates an embedding for the given text using text-embedding-3-small model
func (u *OpenAIUsecase) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
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
		logger.Log.Error("Failed to create embedding", zap.Error(err), zap.String("text", text))
		return nil, fmt.Errorf("failed to create embedding: %w", err)
	}

	if len(response.Data) == 0 {
		logger.Log.Warn("No embeddings returned from OpenAI")
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
