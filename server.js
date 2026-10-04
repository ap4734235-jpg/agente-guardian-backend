 const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint para recibir telemetría de la app
app.post('/api/v1/telemetry', (req, res) => {
    console.log('Telemetría recibida:', req.body);
    res.status(200).json({ status: 'ok', message: 'Telemetría recibida con éxito' });
});

app.get('/', (req, res) => {
    res.send('Servidor Agente Guardián 360 Activo');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
