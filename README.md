# Sistema de Compatibilidade de Exames Laboratoriais

Sistema web desenvolvido para o **Instituto Elo de Saúde** que permite comparar pedidos de exames laboratoriais com resultados recebidos, identificando automaticamente quais exames foram solicitados mas não foram realizados (análise de conformidade).

## 🎯 Funcionalidades Principais

- ✅ **Interface simplificada em 3 passos**: Inserir pedido → Inserir resultado → Ver análise
- ✅ **Opção flexível de entrada**: Colar texto do pedido OU fazer upload de PDF
- ✅ **Upload de resultados**: Suporte para PDF, JPG e PNG (formatos reais dos laboratórios)
- ✅ **Extração inteligente com IA**: Processamento automático de PDFs e identificação de exames usando LLM
- ✅ **Análise de conformidade**: Identifica exames realizados, faltantes e extras automaticamente
- ✅ **Relatório de não conformidade**: Geração de relatório profissional em texto e PDF para download
- ✅ **Compatibilidade com adblockers**: Detecção automática, modo simplificado e cache local
- ✅ **Funciona em iframe**: Otimizado para incorporação em Google Sites

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, TailwindCSS 4, Shadcn/UI
- **Backend**: Node.js, Express, tRPC 11
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Storage**: AWS S3 para armazenamento de PDFs
- **IA**: Integração com LLM para extração inteligente de exames
- **Geração de PDF**: jsPDF para relatórios de não conformidade
- **Extração de PDF**: pdftotext (poppler-utils)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/drgustavoavelar/lab-exam-manager.git
cd lab-exam-manager

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
# (veja seção de Configuração abaixo)

# Execute as migrações do banco de dados
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

## ⚙️ Configuração

O projeto requer as seguintes variáveis de ambiente:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
```

## 🎨 Funcionalidades Especiais

### Detecção de Adblockers
O sistema detecta automaticamente quando adblockers estão bloqueando recursos essenciais e exibe um banner informativo com instruções para o usuário.

### Modo Simplificado
Toggle que desabilita recursos de IA e usa apenas extração básica, garantindo funcionamento mesmo com adblockers ativos.

### Cache Local
Sistema automático que salva até 50 análises recentes no localStorage do navegador, permitindo acesso offline e evitando perda de dados.

## 📝 Como Usar

1. **Passo 1 - Pedido de Exames**: Cole o texto do pedido ou faça upload do PDF
2. **Passo 2 - Resultado**: Faça upload do resultado em PDF, JPG ou PNG
3. **Passo 3 - Análise**: Visualize a análise de conformidade e baixe o relatório se houver não conformidades

## 🔒 Segurança

- Autenticação via OAuth
- Armazenamento seguro de arquivos no S3
- Validação de tipos de arquivo
- Proteção contra uploads maliciosos

## 📄 Licença

Este projeto foi desenvolvido para uso exclusivo do Instituto Elo de Saúde.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Dr. Gustavo Avelar** com assistência da plataforma Manus AI.

---

**Instituto Elo de Saúde** - Sistema de Compatibilidade de Exames Laboratoriais
