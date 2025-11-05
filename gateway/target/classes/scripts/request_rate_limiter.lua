--[[
Token Bucket Rate Limiting Algorithm
KEYS[1] - tokens key
KEYS[2] - timestamp key
ARGV[1] - replenish rate (tokens per second)
ARGV[2] - burst capacity (max tokens)
ARGV[3] - current timestamp (seconds)
ARGV[4] - requested tokens
Returns:
  allowed (1 = allowed, 0 = denied)
  tokens_left (remaining tokens)
--]]

local tokens_key = KEYS[1]
local timestamp_key = KEYS[2]

local rate = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- Default fill rate is capacity
local fill_time = capacity / rate
local ttl = math.floor(fill_time * 2)

-- Get current tokens and last update time
local last_tokens = tonumber(redis.call("get", tokens_key))
if last_tokens == nil then
  last_tokens = capacity
end

local last_refreshed = tonumber(redis.call("get", timestamp_key))
if last_refreshed == nil then
  last_refreshed = 0
end

-- Calculate time passed and tokens to add
local delta = math.max(0, now - last_refreshed)
local filled_tokens = math.min(capacity, last_tokens + (delta * rate))
local allowed = filled_tokens >= requested
local new_tokens = filled_tokens

local allowed_num = 0
if allowed then
  new_tokens = filled_tokens - requested
  allowed_num = 1
end

-- Update Redis
if ttl > 0 then
  redis.call("setex", tokens_key, ttl, new_tokens)
  redis.call("setex", timestamp_key, ttl, now)
end

-- Return result
return { allowed_num, new_tokens }

