#!/bin/bash

# Company Hub Build Script
echo "🚀 Iniciando build do Company Hub..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

# Install dependencies
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Falha ao instalar dependências."
    exit 1
fi

# Build the React app
echo "🔨 Construindo aplicação React..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Falha no build da aplicação."
    exit 1
fi

# Check if build was successful
if [ ! -f "assets/dist/main.js" ]; then
    echo "❌ Arquivo main.js não foi gerado."
    exit 1
fi

if [ ! -f "assets/dist/main.css" ]; then
    echo "❌ Arquivo main.css não foi gerado."
    exit 1
fi

# Set proper permissions
echo "🔒 Configurando permissões..."
chmod 644 assets/dist/*
chmod 755 assets/dist/

# Create production info file
echo "📝 Criando arquivo de informações de produção..."
cat > assets/dist/build-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0.0",
  "environment": "production",
  "files": {
    "js": "main.js",
    "css": "main.css"
  }
}
EOF

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos gerados em: assets/dist/"
echo "🌐 O plugin está pronto para produção!"

# Optional: Create a zip file for distribution
if command -v zip &> /dev/null; then
    echo "📦 Criando arquivo ZIP para distribuição..."
    zip -r company-hub-plugin.zip . -x "node_modules/*" "*.git*" "build.sh" "*.log"
    echo "✅ Arquivo ZIP criado: company-hub-plugin.zip"
fi