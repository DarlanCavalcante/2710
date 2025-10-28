# Deploy Instructions for Netlify

## Quick Deploy - Drag & Drop Method

1. **Build the project locally:**
   ```bash
   # Create a dist folder for production
   mkdir dist
   cp -r * dist/ 2>/dev/null || true
   rm -rf dist/dist  # Remove nested dist folder
   ```

2. **Visit Netlify:**
   - Go to: https://www.netlify.com/
   - Click "Deploy to Netlify"
   - Drag the entire project folder to the deploy area

## Git Integration Method (Recommended)

1. **Connect GitHub Repository:**
   - Login to Netlify: https://app.netlify.com/
   - Click "New site from Git"
   - Choose "GitHub"
   - Select repository: `DarlanCavalcante/2710`

2. **Build Settings:**
   - Branch: `main`
   - Build command: `echo "Static site - no build needed"`
   - Publish directory: `/` (root)

3. **Deploy:**
   - Click "Deploy site"
   - Your site will be live at: `https://[random-name].netlify.app`

## Environment Configuration

Create `netlify.toml` for advanced configuration:

```toml
[build]
  publish = "."
  command = "echo 'Tech10 - Ready for deploy!'"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]  
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.js"  
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[redirects]]
  from = "/admin/*"
  to = "/404.html"
  status = 404

[context.production.environment]
  HUGO_VERSION = "0.95.0"