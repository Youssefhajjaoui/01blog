#!/bin/bash
# =====================================================
# PostgreSQL Dummy Data Seeder for BlogDB
# =====================================================

DB_CONTAINER="blogdb"
DB_USER="admin"
DB_PASS="pass"
DB_NAME="postgres"
NUM_USERS=20
NUM_POSTS=50
NUM_COMMENTS=100
NUM_LIKES=80
NUM_SUBSCRIPTIONS=40
NUM_NOTIFICATIONS=30
NUM_REPORTS=15

echo "🚀 Starting data seeding into container: $DB_CONTAINER"

# Helper: run SQL inside the container
run_sql() {
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "$1"
}

# -----------------------------------------------------
# 1. USERS
# -----------------------------------------------------
echo "🧍 Creating $NUM_USERS users..."
for i in $(seq 1 $NUM_USERS); do
  username="user$i"
  email="user$i@example.com"
  password_hash="hashed_password_$i"
  image="https://picsum.photos/seed/$i/200"
  bio="This is the bio of $username."
  role=$([ $i -eq 1 ] && echo "ADMIN" || echo "USER")
  run_sql "INSERT INTO users (username, email, password_hash, image, bio, role) 
           VALUES ('$username', '$email', '$password_hash', '$image', '$bio', '$role');"
done

# -----------------------------------------------------
# 2. POSTS
# -----------------------------------------------------
echo "📝 Creating $NUM_POSTS posts..."
for i in $(seq 1 $NUM_POSTS); do
  creator_id=$(( (RANDOM % NUM_USERS) + 1 ))
  title="Post Title $i"
  content="This is a dummy post content number $i created by user $creator_id."
  media_url="https://picsum.photos/seed/post$i/600"
  media_type="image/jpeg"
  tags="{tag$i,example,blog}"
  run_sql "INSERT INTO posts (creator_id, title, content, media_url, media_type, tags)
           VALUES ($creator_id, '$title', '$content', '$media_url', '$media_type', '$tags');"
done

# -----------------------------------------------------
# 3. COMMENTS
# -----------------------------------------------------
echo "💬 Creating $NUM_COMMENTS comments..."
for i in $(seq 1 $NUM_COMMENTS); do
  creator_id=$(( (RANDOM % NUM_USERS) + 1 ))
  post_id=$(( (RANDOM % NUM_POSTS) + 1 ))
  content="This is comment $i by user $creator_id on post $post_id."
  run_sql "INSERT INTO comments (content, creator_id, post_id)
           VALUES ('$content', $creator_id, $post_id);"
done

# -----------------------------------------------------
# 4. LIKES
# -----------------------------------------------------
echo "❤️ Creating $NUM_LIKES likes..."
for i in $(seq 1 $NUM_LIKES); do
  creator_id=$(( (RANDOM % NUM_USERS) + 1 ))
  post_id=$(( (RANDOM % NUM_POSTS) + 1 ))
  run_sql "INSERT INTO likes (creator_id, post_id)
           VALUES ($creator_id, $post_id)
           ON CONFLICT DO NOTHING;"
done

# -----------------------------------------------------
# 5. SUBSCRIPTIONS
# -----------------------------------------------------
echo "👥 Creating $NUM_SUBSCRIPTIONS subscriptions..."
for i in $(seq 1 $NUM_SUBSCRIPTIONS); do
  follower_id=$(( (RANDOM % NUM_USERS) + 1 ))
  followed_id=$(( (RANDOM % NUM_USERS) + 1 ))
  if [ "$follower_id" -ne "$followed_id" ]; then
    run_sql "INSERT INTO subscriptions (follower_id, followed_id)
             VALUES ($follower_id, $followed_id)
             ON CONFLICT DO NOTHING;"
  fi
done

# -----------------------------------------------------
# 6. NOTIFICATIONS
# -----------------------------------------------------
echo "🔔 Creating $NUM_NOTIFICATIONS notifications..."
for i in $(seq 1 $NUM_NOTIFICATIONS); do
  creator_id=$(( (RANDOM % NUM_USERS) + 1 ))
  receiver_id=$(( (RANDOM % NUM_USERS) + 1 ))
  content="Notification $i from user $creator_id to user $receiver_id."
  run_sql "INSERT INTO notifications (creator_id, receiver_id, content)
           VALUES ($creator_id, $receiver_id, '$content');"
done

# -----------------------------------------------------
# 7. REPORTS
# -----------------------------------------------------
echo "🚨 Creating $NUM_REPORTS reports..."
for i in $(seq 1 $NUM_REPORTS); do
  reporter_id=$(( (RANDOM % NUM_USERS) + 1 ))
  reported_user_id=$(( (RANDOM % NUM_USERS) + 1 ))
  reported_post_id=$(( (RANDOM % NUM_POSTS) + 1 ))
  reason="Report reason number $i"
  run_sql "INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason)
           VALUES ($reporter_id, $reported_user_id, $reported_post_id, '$reason');"
done

echo "✅ Seeding completed successfully!"
