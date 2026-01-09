# ProjetoFinalNuvemFront

## Instruções rápidas (front-end)

- O frontend chama um servidor REST em http://44.192.47.76:3000 para gerenciar produtos (GET, POST, PUT, DELETE).
- Para atualizar um produto: clique em "Update" ao lado do item na lista — o formulário de atualização aparecerá preenchido; altere os valores e clique em "Salvar alterações".

### Depuração do update

- Se ocorrer um erro ao atualizar, abra as Ferramentas do Desenvolvedor do navegador (Console / Network) e verifique as mensagens.
- O cliente agora tenta `PUT /products/:id` e, se o PUT falhar, faz um fallback para `PATCH /products/:id`.
- Mensagens de diagnóstico (status e corpo da resposta) são registradas no console para facilitar a correção do problema pelo backend.

- Observação: o backend do servidor de exemplo responde com texto simples (por exemplo: `"updated!!"`) ao atualizar — o cliente agora lida com respostas JSON ou texto.
