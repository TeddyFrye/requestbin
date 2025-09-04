CREATE TABLE baskets (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
		basket_id INTEGER NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    path TEXT,
		query JSONB DEFAULT '{}'::jsonb,
    method TEXT NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    body_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requests_created_at 
		ON requests (created_at DESC);

CREATE INDEX idx_requests_basket_created_at
		ON requests (basket_id, created_at DESC);