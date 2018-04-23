package graphqlbackend

import (
	"context"
	"time"

	graphql "github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/backend"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/db"
)

// accessTokenResolver resolves an access token.
type accessTokenResolver struct {
	accessToken db.AccessToken
}

func accessTokenByID(ctx context.Context, id graphql.ID) (*accessTokenResolver, error) {
	accessTokenID, err := unmarshalAccessTokenID(id)
	if err != nil {
		return nil, err
	}
	accessToken, err := db.AccessTokens.GetByID(ctx, accessTokenID)
	if err != nil {
		return nil, err
	}
	// 🚨 SECURITY: Only the user (token owner) and site admins may retrieve the token.
	if err := backend.CheckSiteAdminOrSameUser(ctx, accessToken.UserID); err != nil {
		return nil, err
	}
	return &accessTokenResolver{accessToken: *accessToken}, nil
}

func marshalAccessTokenID(id int64) graphql.ID { return relay.MarshalID("AccessToken", id) }

func unmarshalAccessTokenID(id graphql.ID) (accessTokenID int64, err error) {
	err = relay.UnmarshalSpec(id, &accessTokenID)
	return
}

func (r *accessTokenResolver) ID() graphql.ID { return marshalAccessTokenID(r.accessToken.ID) }

func (r *accessTokenResolver) User(ctx context.Context) (*userResolver, error) {
	return userByIDInt32(ctx, r.accessToken.UserID)
}

func (r *accessTokenResolver) Note() string { return r.accessToken.Note }

func (r *accessTokenResolver) CreatedAt() string {
	return r.accessToken.CreatedAt.Format(time.RFC3339)
}

func (r *accessTokenResolver) LastUsedAt() *string {
	if r.accessToken.LastUsedAt == nil {
		return nil
	}
	t := r.accessToken.LastUsedAt.Format(time.RFC3339)
	return &t
}
