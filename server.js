const express = require('express');
const agentesRoutes = require('./routes/agentesRoutes.js');
const casosRoutes = require('./routes/casosRoutes.js');
const setupSwagger = require('./docs/swagger.js');
const errorhandler = require('./utils/errorHandler.js');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/agentes', agentesRoutes);
app.use('/casos', casosRoutes);

app.use(errorhandler);

setupSwagger(app);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost:${PORT}`);
});