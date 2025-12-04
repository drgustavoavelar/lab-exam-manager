# Gerenciador de Exames Laboratoriais - TODO

## Estrutura de Dados
- [x] Criar tabela de pacientes
- [x] Criar tabela de pedidos de exames
- [x] Criar tabela de resultados de exames
- [x] Criar tabela de itens de exames (exames individuais solicitados)
- [x] Criar tabela de itens de resultados (exames individuais realizados)

## Backend
- [x] Implementar upload de PDF de pedidos de exames
- [x] Implementar upload de PDF de resultados de exames
- [x] Implementar extração de texto de PDFs
- [x] Implementar análise de conformidade entre pedido e resultado
- [x] Criar procedimento tRPC para listar pacientes
- [x] Criar procedimento tRPC para criar/editar paciente
- [x] Criar procedimento tRPC para listar pedidos de exames
- [x] Criar procedimento tRPC para criar pedido de exame
- [x] Criar procedimento tRPC para listar resultados de exames
- [x] Criar procedimento tRPC para criar resultado de exame
- [x] Criar procedimento tRPC para análise de conformidade

## Frontend
- [x] Criar página inicial com dashboard
- [x] Criar página de listagem de pacientes
- [x] Criar formulário de cadastro/edição de paciente
- [x] Criar página de detalhes do paciente
- [x] Criar formulário de upload de pedido de exames
- [x] Criar formulário de upload de resultado de exames
- [x] Criar visualização de pedidos de exames
- [x] Criar visualização de resultados de exames
- [x] Criar interface de análise de conformidade
- [x] Implementar navegação entre páginas
- [x] Adicionar feedback visual (loading, success, error)

## Testes
- [x] Criar testes para procedimentos tRPC principais
- [x] Testar upload e processamento de PDFs
- [x] Testar análise de conformidade

## Finalização
- [x] Revisar e ajustar interface
- [x] Criar checkpoint final

## Refatoração - Fluxo Simplificado

### Alterações Estruturais
- [x] Remover dependência obrigatória de pacientes
- [x] Simplificar schema do banco de dados
- [x] Criar modelo de análise de exames independente

### Backend
- [x] Adicionar endpoint para análise com texto colado
- [x] Manter endpoint para upload de PDF do pedido
- [x] Adicionar suporte para upload de imagens JPG nos resultados
- [x] Refatorar lógica de análise de conformidade

### Frontend
- [x] Criar página inicial simplificada com fluxo direto
- [x] Implementar textarea para colar texto do pedido
- [x] Manter opção de upload de PDF do pedido
- [x] Implementar upload de PDF/JPG para resultados
- [x] Criar visualização clara da análise de conformidade
- [x] Remover páginas de cadastro de pacientes

### Branding
- [x] Renomear aplicação para "Compatibilidade de Exames - Instituto Elo de Saúde"
- [x] Atualizar título e meta tags
- [x] Atualizar textos da interface

### Testes e Finalização
- [x] Atualizar testes para novo fluxo
- [x] Testar análise com texto colado
- [x] Testar upload de imagens JPG
- [x] Criar checkpoint final

## Relatório de Não Conformidade

### Backend
- [x] Criar função para gerar relatório em texto formatado
- [x] Implementar endpoint tRPC para gerar PDF do relatório
- [x] Adicionar biblioteca para geração de PDF

### Frontend
- [x] Adicionar seção de relatório na tela de análise
- [x] Implementar visualização do relatório em texto
- [x] Adicionar botão de download do PDF
- [x] Mostrar apenas quando houver exames faltantes

### Testes
- [x] Testar geração de relatório em texto
- [x] Testar download do PDF
- [x] Criar checkpoint com nova funcionalidade

## Bug Encontrado - Teste com Arquivos Reais

### Problema
- [x] Erro "DOMMatrix is not defined" ao processar texto colado
- [x] Sistema tenta usar pdfjs-dist mesmo quando não há PDF

### Solução
- [x] Corrigir lógica no backend para não processar PDF quando requestText está presente
- [x] Testar novamente com texto colado
- [x] Sistema identificou 18 exames corretamente do texto colado
- [ ] Teste manual necessário: upload de resultado em PDF
- [ ] Teste manual necessário: verificar geração do relatório de não conformidade
- [x] Criar checkpoint final

## Teste Completo com Arquivos Reais

### Objetivo
- [x] Extrair texto dos PDFs fornecidos pelo usuário
- [x] Implementar extração de PDF funcional para Node.js usando pdftotext
- [x] Implementar extração inteligente com IA (LLM) para maior precisão
- [x] Implementar análise de conformidade com IA
- [x] Testar fluxo completo com IA: pedido → resultado → análise → relatório
- [x] Verificar se relatório de não conformidade é gerado corretamente
- [x] Criar checkpoint final

## Bug - Processamento Infinito no Upload de PDF

### Problema Reportado
- [ ] Upload de PDF do pedido fica "Processando..." indefinidamente
- [ ] IA pode estar demorando muito ou falhando silenciosamente
- [ ] Usuário fica preso sem feedback

### Solução
- [x] Adicionar timeout para processamento com IA (máximo 30 segundos)
- [x] Implementar fallback automático para método rápido se IA falhar
- [x] Adicionar tratamento de erro mais robusto
- [x] Melhorar feedback visual com mensagens de progresso
- [x] Sistema pronto para teste com arquivo real
- [x] Criar checkpoint com correção

## Bug - Extração de PDF Falhando

### Problema
- [ ] pdftotext não está funcionando no servidor
- [ ] Erro: "Não foi possível processar o PDF"
- [ ] Colar texto funciona, mas upload de PDF falha

### Diagnóstico
- [x] Verificar se poppler-utils está instalado
- [x] Testar pdftotext manualmente com arquivo silvia.pdf
- [x] Verificar logs de erro do servidor
- [x] Backend funciona perfeitamente em teste isolado
- [x] Erro acontece na chamada tRPC do frontend
- [ ] URL do S3 pode não estar sendo passada corretamente

### Solução
- [ ] Instalar poppler-utils se necessário
- [ ] Ou usar biblioteca JavaScript alternativa (pdf-parse, pdfjs-dist)
- [ ] Testar com arquivo real do usuário
- [ ] Criar checkpoint com correção

## Problema - Adblocker Bloqueando Aplicação

### Problema Identificado
- [ ] Adblocker está bloqueando scripts essenciais (ERR_BLOCKED_BY_CLIENT)
- [ ] Scripts de analytics (Amplitude) sendo bloqueados
- [ ] Aplicação funciona diretamente mas falha dentro de iframe do Google Sites
- [ ] Usuários precisam desabilitar adblocker ou adicionar exceções

### Solução
- [x] Remover scripts de analytics desnecessários para reduzir bloqueios
- [x] Criar página de instruções para usuários configurarem adblocker
- [x] Adicionar link de ajuda na interface principal
- [x] Interface atualizada com botão "Ajuda com Adblocker" visível
- [ ] Criar checkpoint com melhorias
