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
- [ ] Criar checkpoint final
