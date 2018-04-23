package db

import (
	"context"
	"testing"

	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/pkg/types"
)

type MockUsers struct {
	Create               func(ctx context.Context, info NewUser) (newUser *types.User, err error)
	Update               func(userID int32, update UserUpdate) error
	GetByID              func(ctx context.Context, id int32) (*types.User, error)
	GetByUsername        func(ctx context.Context, username string) (*types.User, error)
	GetByExternalID      func(ctx context.Context, provider, id string) (*types.User, error)
	GetByCurrentAuthUser func(ctx context.Context) (*types.User, error)
	Count                func(ctx context.Context, opt UsersListOptions) (int, error)
	List                 func(ctx context.Context, opt *UsersListOptions) ([]*types.User, error)
	ListByOrg            func(ctx context.Context, orgID int32, userIDs []int32, usernames []string) ([]*types.User, error)
}

func (s *MockUsers) MockGetByID_Return(t *testing.T, returns *types.User, returnsErr error) (called *bool) {
	called = new(bool)
	s.GetByID = func(ctx context.Context, id int32) (*types.User, error) {
		*called = true
		return returns, returnsErr
	}
	return
}

func (s *MockUsers) MockGetByExternalID_Return(t *testing.T, returns *types.User, returnsErr error) (called *bool) {
	called = new(bool)
	s.GetByExternalID = func(ctx context.Context, provider, id string) (*types.User, error) {
		*called = true
		return returns, returnsErr
	}
	return
}
