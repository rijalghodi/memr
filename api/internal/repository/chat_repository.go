package repository

import (
	"app/internal/model"
	"app/pkg/logger"
	"context"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

// CreateChat creates a new chat
func (r *ChatRepository) CreateChat(ctx context.Context, userID string) (*model.Chat, error) {
	chat := &model.Chat{
		ID:     uuid.New().String(),
		UserID: userID,
	}

	err := r.db.WithContext(ctx).Create(chat).Error
	if err != nil {
		logger.Log.Error("Failed to create chat", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return chat, nil
}

// GetChatByID retrieves a chat by ID with user validation
func (r *ChatRepository) GetChatByID(ctx context.Context, chatID, userID string) (*model.Chat, error) {
	var chat model.Chat
	err := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", chatID, userID).
		First(&chat).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		logger.Log.Error("Failed to get chat", zap.Error(err), zap.String("chatID", chatID), zap.String("userID", userID))
		return nil, err
	}

	return &chat, nil
}

// CreateMessage creates a new message
func (r *ChatRepository) CreateMessage(ctx context.Context, chatID, userID, role, content string) (*model.Message, error) {
	message := &model.Message{
		ID:      uuid.New().String(),
		ChatID:  chatID,
		UserID:  userID,
		Role:    role,
		Content: &content,
	}

	err := r.db.WithContext(ctx).Create(message).Error
	if err != nil {
		logger.Log.Error("Failed to create message", zap.Error(err), zap.String("chatID", chatID))
		return nil, err
	}

	return message, nil
}

// CreateMessageWithContent creates a new message with nullable content
func (r *ChatRepository) CreateMessageWithContent(ctx context.Context, chatID, userID, role string, content *string) (*model.Message, error) {
	message := &model.Message{
		ID:      uuid.New().String(),
		ChatID:  chatID,
		UserID:  userID,
		Role:    role,
		Content: content,
	}

	err := r.db.WithContext(ctx).Create(message).Error
	if err != nil {
		logger.Log.Error("Failed to create message", zap.Error(err), zap.String("chatID", chatID))
		return nil, err
	}

	return message, nil
}

// CreateToolCall creates a new tool call
func (r *ChatRepository) CreateToolCall(ctx context.Context, messageID, name string, arguments []byte) (*model.ToolCall, error) {
	toolCall := &model.ToolCall{
		ID:        uuid.New().String(),
		MessageID: messageID,
		Name:      &name,
		Arguments: arguments,
	}

	err := r.db.WithContext(ctx).Create(toolCall).Error
	if err != nil {
		logger.Log.Error("Failed to create tool call", zap.Error(err), zap.String("messageID", messageID))
		return nil, err
	}

	return toolCall, nil
}

// GetChatHistory retrieves all messages for a chat, ordered by created_at
func (r *ChatRepository) GetChatHistory(ctx context.Context, chatID string) ([]model.Message, error) {
	var messages []model.Message
	err := r.db.WithContext(ctx).
		Where("chat_id = ?", chatID).
		Preload("ToolCalls", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Order("created_at ASC").
		Find(&messages).Error

	if err != nil {
		logger.Log.Error("Failed to get chat history", zap.Error(err), zap.String("chatID", chatID))
		return nil, err
	}

	return messages, nil
}

// ListChatsByUserID retrieves chats for a user with pagination, ordered by latest message created_at DESC
func (r *ChatRepository) ListChatsByUserID(ctx context.Context, userID string, page, limit int) ([]model.Chat, int64, error) {
	var total int64

	// Count total chats
	err := r.db.WithContext(ctx).
		Model(&model.Chat{}).
		Where("user_id = ?", userID).
		Count(&total).Error
	if err != nil {
		logger.Log.Error("Failed to count chats", zap.Error(err), zap.String("userID", userID))
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * limit

	var chats []model.Chat

	// Get chats ordered by latest message timestamp (or created_at if no messages)
	// Use subquery to order by updated_at, then preload messages
	err = r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order(`
			COALESCE(
				(SELECT MAX(created_at) FROM messages WHERE chat_id = chats.id),
				chats.created_at
			) DESC
		`).
		Limit(limit).
		Offset(offset).
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Find(&chats).Error

	if err != nil {
		logger.Log.Error("Failed to list chats", zap.Error(err), zap.String("userID", userID))
		return nil, 0, err
	}

	return chats, total, nil
}

// GetLatestMessageTimestamp gets the latest message timestamp for a chat
func (r *ChatRepository) GetLatestMessageTimestamp(ctx context.Context, chatID string) (*time.Time, error) {
	var latestTime time.Time
	err := r.db.WithContext(ctx).
		Model(&model.Message{}).
		Where("chat_id = ?", chatID).
		Select("MAX(created_at)").
		Scan(&latestTime).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	if latestTime.IsZero() {
		return nil, nil
	}

	return &latestTime, nil
}

// CountUserMessages counts all user messages for a user
func (r *ChatRepository) CountUserMessages(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.Message{}).
		Where("user_id = ? AND role = ?", userID, "user").
		Count(&count).Error

	if err != nil {
		logger.Log.Error("Failed to count user messages", zap.Error(err), zap.String("userID", userID))
		return 0, err
	}

	return count, nil
}
