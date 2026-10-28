# Nexo Checkout

Checkout de assinatura feito em Angular, com telas de pagamento, sucesso e erro. Usei Angular 22 com standalone components, signals e zoneless, mais Tailwind CSS 4 pro layout.

Pra simular um backend de verdade, em vez de deixar tudo hardcoded no front, montei um json-server em cima de um `db.json`. É ele quem decide se um cartão é aprovado ou recusado e quem guarda as transações.

Pra rodar, precisa de Node 22.22.3 ou mais novo (24.15+ também serve) e npm. Depois de `npm install`, `npm start` sobe o Angular em `http://localhost:4200` e o json-server em `http://localhost:3001` ao mesmo tempo. Se quiser rodar só um dos dois, tem `npm run web` pro Angular e `npm run api` pro json-server separadamente. Pra build de produção é só `npm run build`; os arquivos saem em `dist/nexo-checkout/browser`, e como é uma SPA o servidor que for servir isso precisa redirecionar rotas desconhecidas pra `index.html`.

Pra testar os fluxos, qualquer cartão válido aprova, por exemplo 4242 4242 4242 4242. O número 4000 0000 0000 0002 simula recusa, 4000 0000 0000 9995 simula falta de limite ou saldo, e 4000 0000 0000 0119 simula instabilidade na operadora. Esses números ficam cadastrados no `db.json`, na coleção `cards`, então dá pra editar o arquivo e testar outros casos. O nome precisa ter nome e sobrenome, a validade tem que ser futura, e o CVV é de 3 dígitos (4 no caso do Amex). No Pix, clicar em "Concluir pagamento" já aprova na hora; pra ver o código expirado é só esperar o contador de 10 minutos zerar.

Na estrutura, dentro de `src/app` tem `core` com o estado (o `PaymentStore`), os modelos, o gateway de pagamento e os dados mockados; `features` com as três telas (payment, success, error); `layout` com o header e o footer; e `shared` com componentes de UI, validators e funções utilitárias. O `db.json` na raiz é a base do json-server, com os cartões de teste e as transações. Cada componente tem `.ts`, `.html` e `.css` em arquivos separados.

Sobre algumas decisões: o `PaymentStore` guarda pedido, meio de pagamento, status e resultado em signals, sem persistir nada em storage. Isso foi proposital  atualizar a página de sucesso não deveria "reconfirmar" o pagamento, e dado de cartão não deveria sobreviver a um reload. As rotas `/sucesso` e `/erro` são protegidas por um guard que checa se existe um pedido na memória; se não tiver, volta pra `/pagamento`. O gateway consulta o json-server pelo número do cartão pra decidir se aprova ou recusa, e grava a transação aprovada em `transactions`  dá pra acompanhar isso acontecendo na aba de rede do navegador.

Ficou de fora de propósito: persistência entre abas ou reload, testes automatizados (ficariam a cargo dos validators e utils em `shared`, que são funções puras e fáceis de testar) e confirmação automática do Pix, já que sem um webhook de verdade quem confirma o pagamento acaba sendo o próprio usuário, clicando em "Concluir pagamento".
# checkout-teste
