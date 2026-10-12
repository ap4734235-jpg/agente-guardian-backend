const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint avanzado para recibir y estructurar la telemetría
app.post('/api/v1/telemetry', (req, res) => {
    const serverTimestamp = new Date().toISOString();
    
    // Captura de la cabecera de internacionalización (i18n)
    const acceptLanguage = req.headers['accept-language'] || 'es';
    
    // Desestructuración de la telemetría JSON enviada por el dispositivo
    const { 
        deviceId, 
        timestamp, 
        location, 
        batteryLevel, 
        triggerType 
    } = req.body;

    // Registro estructurado para la consola de Render
    console.log(`[${serverTimestamp}] [TELEMETRY_RECEIVED] 
    ├── Idioma (Accept-Language): ${acceptLanguage}
    ├── Device ID: ${deviceId || 'Desconocido'}
    ├── Trigger Type: ${triggerType || 'Pánico Estándar'}
    ├── Batería: ${batteryLevel !== undefined ? batteryLevel + '%' : 'N/D'}
    ├── Ubicación GPS: ${location ? `Lat: ${location.latitude}, Lng: ${location.longitude} (Precisión: ${location.accuracy}m)` : 'No disponible'}
    └── Timestamp Dispositivo: ${timestamp || 'N/D'}`);

    // Respuesta adaptada según el idioma solicitado por el cliente
    const isEnglish = acceptLanguage.toLowerCase().includes('en');
    const responseMessage = isEnglish 
        ? "Alert successfully received, logged, and secured on server." 
        : "Alerta recibida, registrada y asegurada en el servidor con éxito.";

    // Envío de respuesta JSON de confirmación
    res.status(200).json({
        status: "success",
        code: 200,
        serverTimestamp: serverTimestamp,
        message: responseMessage
    });
});

app.get('/', (req, res) => {
    res.send('Servidor Agente Guardián 360 Activo');
});

app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Servidor corriendo en el puerto ${PORT}`);
});
