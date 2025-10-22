# 📁 Production File Storage Guide

## 🎯 **Current Setup**
Your photos are now stored using a **configurable FileStorageService** that supports multiple storage backends.

## 🔧 **Configuration Options**

### 1. **Local Storage** (Current Default)
```properties
file.storage.type=local
file.storage.local.path=uploads/
file.storage.base-url=http://localhost:9090/api/files/uploads/
```

**✅ Pros**: Simple, no external dependencies
**❌ Cons**: Files lost on container restart, not scalable

### 2. **AWS S3** (Recommended for Production)
```properties
file.storage.type=s3
file.storage.s3.bucket=your-blog-bucket
file.storage.s3.region=us-east-1
file.storage.base-url=https://your-blog-bucket.s3.amazonaws.com/uploads/
```

**✅ Pros**: Scalable, reliable, CDN support, automatic backups
**❌ Cons**: Requires AWS account, costs money

### 3. **Google Cloud Storage**
```properties
file.storage.type=gcs
file.storage.gcs.bucket=your-blog-bucket
file.storage.base-url=https://storage.googleapis.com/your-blog-bucket/uploads/
```

### 4. **Azure Blob Storage**
```properties
file.storage.type=azure
file.storage.azure.container=uploads
file.storage.base-url=https://yourstorageaccount.blob.core.windows.net/uploads/
```

## 🚀 **Production Deployment Options**

### Option A: Local Storage with Volume Mount
```bash
# Build the application
cd backend && ./mvnw clean package

# Run with persistent volume
docker run -p 9090:9090 \
  -v /host/path/uploads:/app/uploads \
  -e FILE_STORAGE_TYPE=local \
  -e FILE_STORAGE_LOCAL_PATH=/app/uploads/ \
  your-app:latest
```

### Option B: AWS S3 (Recommended)
```bash
# Set environment variables
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Run with S3 storage
docker run -p 9090:9090 \
  -e FILE_STORAGE_TYPE=s3 \
  -e FILE_STORAGE_S3_BUCKET=your-blog-bucket \
  -e FILE_STORAGE_S3_REGION=us-east-1 \
  -e FILE_STORAGE_BASE_URL=https://your-blog-bucket.s3.amazonaws.com/uploads/ \
  -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
  -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
  your-app:latest
```

### Option C: Docker Compose
```bash
# Use the provided docker-compose.production.yml
docker-compose -f docker-compose.production.yml up -d
```

## 📋 **Implementation Steps**

### For AWS S3 (Most Common Production Choice):

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-blog-bucket
   aws s3api put-bucket-cors --bucket your-blog-bucket --cors-configuration '{
     "CORSRules": [{
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"]
     }]
   }'
   ```

2. **Create IAM User**:
   ```bash
   aws iam create-user --user-name blog-storage-user
   aws iam attach-user-policy --user-name blog-storage-user \
     --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
   ```

3. **Add AWS SDK Dependency** (if using S3):
   ```xml
   <dependency>
       <groupId>software.amazon.awssdk</groupId>
       <artifactId>s3</artifactId>
       <version>2.20.0</version>
   </dependency>
   ```

## 🔄 **Migration Strategy**

### From Local to S3:
1. Upload existing files to S3 bucket
2. Update database records to use S3 URLs
3. Deploy with S3 configuration
4. Update frontend base URL

### Database Update Script:
```sql
-- Update existing image paths to use S3 URLs
UPDATE users 
SET image = REPLACE(image, 'uploads/', 'https://your-bucket.s3.amazonaws.com/uploads/')
WHERE image IS NOT NULL;
```

## 🛡️ **Security Considerations**

1. **S3 Bucket Permissions**: Use IAM policies, not bucket policies
2. **CORS Configuration**: Restrict to your domain in production
3. **File Validation**: Validate file types and sizes
4. **Access Control**: Consider signed URLs for private files

## 💰 **Cost Estimation**

- **Local Storage**: Free (just server disk space)
- **AWS S3**: ~$0.023/GB/month + $0.0004/1000 requests
- **Google Cloud**: ~$0.020/GB/month + $0.0004/1000 requests
- **Azure Blob**: ~$0.0184/GB/month + $0.0004/1000 requests

## 🎯 **Recommendation**

For production, I recommend **AWS S3** because:
- ✅ Highly scalable and reliable
- ✅ Built-in CDN (CloudFront)
- ✅ Automatic backups and versioning
- ✅ Cost-effective for most use cases
- ✅ Easy integration with other AWS services
