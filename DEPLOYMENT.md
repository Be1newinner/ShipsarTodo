# Deployment Guide

## Overview

This guide covers deploying the AI-Powered Todo Scheduler to production.

## Prerequisites

- MongoDB Atlas account or self-hosted MongoDB
- Vercel account
- GitHub repository
- Google API credentials for Gemini

## Step 1: Prepare MongoDB

### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a strong password
4. Add IP whitelist (allow 0.0.0.0/0 for Vercel or specific IPs)
5. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

### Option B: Self-Hosted
1. Ensure MongoDB is running and accessible
2. Create connection string: `mongodb://user:password@host:27017/dbname`

## Step 2: Set Up Google AI API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Generative Language API"
4. Create an API key
5. Save the API key (you'll need it for environment variables)

## Step 3: Configure Vercel

### Connect to GitHub
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Select root directory (default if monorepo at root)

### Set Environment Variables
In Vercel project settings, add these variables under "Environment Variables":

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_generated_secret_key_min_32_chars
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app
```

To generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configure for Edge Runtime (Optional)
If using Edge Functions for better performance:
1. Update `next.config.mjs` to enable edge runtime where applicable
2. Note: Database operations must remain in Node.js runtime

## Step 4: Deploy

### Automatic Deployment
- Simply push to main branch
- Vercel automatically builds and deploys

### Manual Deployment
1. In Vercel dashboard, click "Deploy" on desired branch
2. Wait for build to complete
3. Test the deployment URL

### Preview Deployments
- Vercel creates preview URLs for pull requests
- Perfect for testing before merging

## Step 5: Post-Deployment

### Verify Installation
1. Visit your deployment URL
2. Test signup/login flow
3. Create a test todo
4. Check AI features work
5. Test real-time updates

### Configure Custom Domain (Optional)
1. In Vercel project settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### Set Up Email Notifications (Optional)
1. Configure email service (SendGrid, Mailgun, etc.)
2. Update notification API routes
3. Test email delivery

## Database Migrations

### First Time Setup
The app automatically creates MongoDB collections on first run. However, you can manually initialize:

```javascript
// Run in MongoDB CLI or Atlas shell
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "password"],
      properties: {
        email: { bsonType: "string" },
        name: { bsonType: "string" },
        password: { bsonType: "string" },
        timezone: { bsonType: "string" },
        workHoursStart: { bsonType: "int" },
        workHoursEnd: { bsonType: "int" },
        profileSetup: { bsonType: "bool" }
      }
    }
  }
});

// Repeat for other collections: todos, assignments, notifications, etc.
```

### Adding Indexes
For better performance, add indexes:

```javascript
db.todos.createIndex({ userId: 1, createdAt: -1 });
db.todos.createIndex({ dueDate: 1 });
db.assignments.createIndex({ assignedTo: 1, status: 1 });
db.notifications.createIndex({ userId: 1, createdAt: -1 });
```

## Monitoring & Maintenance

### Vercel Analytics
- Monitor build times
- Check deployment status
- Review error logs
- Track performance metrics

### MongoDB Monitoring
- Check connection statistics
- Monitor query performance
- Set up alerts for high usage
- Review slow query logs

### Application Health
- Set up uptime monitoring (StatusPage, Pingdom)
- Configure error tracking (Sentry optional)
- Monitor database growth
- Review API response times

## Troubleshooting Deployment

### Build Fails
1. Check build logs in Vercel
2. Verify all environment variables are set
3. Ensure dependencies are compatible
4. Check Node.js version requirement

### Runtime Errors
1. Check Application Logs in Vercel
2. Verify database connection string
3. Ensure MongoDB is accessible
4. Check API key validity

### WebSocket Connection Issues
1. Verify WebSocket support in Vercel
2. Check Socket.IO configuration
3. Ensure proper CORS settings
4. Test with different clients

## Scaling Considerations

### Database
- Monitor connection pool usage
- Consider read replicas for scaling
- Implement connection pooling
- Archive old data periodically

### API Rate Limiting
- Implement rate limiting per user
- Set up API quotas
- Monitor API usage trends
- Consider caching strategies

### Real-time Features
- Monitor WebSocket connections
- Consider horizontal scaling with sticky sessions
- Use load balancer for WebSocket support
- Monitor memory usage per connection

## Security Checklist

- [ ] Use HTTPS (automatic with Vercel)
- [ ] Set strong JWT_SECRET
- [ ] Enable CORS properly
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Use HTTP-only cookies
- [ ] Enable CSRF protection if needed
- [ ] Audit database permissions
- [ ] Monitor for suspicious activities
- [ ] Keep dependencies updated

## Performance Optimization

### Caching
- Use SWR for client-side caching
- Implement Redis for session storage
- Add CDN for static assets
- Use ISR (Incremental Static Regeneration)

### Database
- Add proper indexes
- Optimize queries
- Use connection pooling
- Implement query caching

### Frontend
- Lazy load components
- Optimize images
- Minify JavaScript
- Use tree-shaking

## Rollback Procedure

If deployment has issues:

1. In Vercel dashboard, go to Deployments
2. Select a previous stable deployment
3. Click "Promote to Production"
4. Or use `git revert` and push to trigger new deployment

## Contact & Support

For deployment issues:
1. Check Vercel documentation
2. Review MongoDB documentation
3. Check application logs
4. Post in community forums
5. Contact support services

## Version History

- v1.0.0 - Initial release with all 5 phases
  - Authentication & todo management
  - Calendar & scheduling
  - AI integration
  - Team collaboration
  - Analytics & notifications
