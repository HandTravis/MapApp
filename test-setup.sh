#!/bin/bash

echo "🧪 Testing MY-APP Setup"
echo "======================="

# Check if all required files exist
echo "📁 Checking project structure..."

required_files=(
  "README.md"
  ".gitignore"
  ".env.example"
  "Makefile"
  "docker-compose.yml"
  "contracts/openapi.yaml"
  "api/package.json"
  "api/Dockerfile"
  "api/src/index.ts"
  "web/package.json"
  "web/Dockerfile"
  "web/src/App.tsx"
  "k8s/base/namespace.yaml"
  "k8s/base/api-deployment.yaml"
  "k8s/base/web-deployment.yaml"
)

missing_files=()

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
  fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
  echo "✅ All required files present"
else
  echo "❌ Missing files:"
  printf '%s\n' "${missing_files[@]}"
  exit 1
fi

# Check if docker-compose is valid
echo "🐳 Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
  echo "✅ docker-compose.yml is valid"
else
  echo "❌ docker-compose.yml has syntax errors"
  exit 1
fi

# Check if OpenAPI spec is valid (basic check)
echo "📋 Checking OpenAPI specification..."
if grep -q "openapi: 3.0.3" contracts/openapi.yaml; then
  echo "✅ OpenAPI specification found"
else
  echo "❌ OpenAPI specification not found or invalid"
  exit 1
fi

echo ""
echo "🎉 Setup validation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Run 'make up' to start the development environment"
echo "3. Open http://localhost:3000 in your browser"
