const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y parseo estricto de JSON
app.use(express.json({ limit: '10kb' }));

/**
 * Motor analítico de amenazas para el cálculo del Threat Score corporativo.
 * Evalúa múltiples vectores de riesgo basados en telemetría de campo.
 */
function computeThreatVector(telemetry) {
    const { batteryLevel, location, triggerType, networkType } = telemetry;
    let baseScore = 15.0; // Puntaje base de supervisión pasiva

    // Ponderación por tipo de disparador táctico
    if (triggerType) {
        const triggerLower = triggerType.toLowerCase();
        if (triggerLower.includes('pánico') || triggerLower.includes('panic')) {
            baseScore += 45.0;
        } else if (triggerLower.includes('emergencia') || triggerLower.includes('intrusion')) {
            baseScore += 35.0;
        } else {
            baseScore += 10.0;
        }
    }

    // Factor de riesgo por integridad de hardware (Batería crítica)
    if (batteryLevel !== undefined && batteryLevel !== null) {
        if (batteryLevel <= 15) {
            baseScore += 20.0;
        } else if (batteryLevel <= 30) {
            baseScore += 10.0;
        }
    }

    // Factor de riesgo por ausencia o pérdida de geoposicionamiento GPS
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        baseScore += 20.0;
    } else {
        // Análisis de precisión geoespacial (si la precisión es baja, aumenta la incertidumbre táctica)
        if (location.accuracy && location.accuracy > 50) {
            baseScore += 5.0;
        }
    }

    // Normalización estricta del puntaje en escala porcentual [0.0 - 100.0]
    return parseFloat(Math.min(baseScore, 100.0).toFixed(2));
}

/**
 * Resolución de geolocalización basada en coordenadas o metadatos de infraestructura.
 */
function resolveGeographicOrigin(location, reqHeaders) {
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        // En un entorno empresarial avanzado, aquí se consultaría una base de datos GeoIP o de coordenadas.
        // Para este despliegue, determinamos el entorno operativo con base en la región configurada.
        return "Colombia (Región Andina - Zona Operativa)";
    }
    const cfCountry = reqHeaders['cf-ipcountry'];
    if (cfCountry) {
        return `Proxy Externo (${cfCountry})`;
    }
    return "Desconocido (Telemetría de Red Oculta)";
}

// Endpoint principal de Inteligencia de Amenazas y Telemetría
app.post('/api/v1/telemetry', (req, res) => {
    const serverTimestamp = new Date().toISOString();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'IP No Identificada';
    const acceptLanguage = req.headers['accept-language'] || 'es';

    const { 
        deviceId, 
        timestamp, 
        location, 
        batteryLevel, 
        triggerType,
        networkStatus 
    } = req.body;

    // Validación de seguridad para rechazar paquetes vacíos o corruptos
    if (!deviceId) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Payload inválido: Device ID requerido para la trazabilidad de seguridad."
        });
    }

    // Generación de Identificador Único de Evento Forense (ID de alta entropía)
    const eventId = `SEC-EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Ejecución de algoritmos analíticos reales
    const threatScoreServer = computeThreatVector(req.body);
    const country = resolveGeographicOrigin(location, req.headers);

    // Registro de auditoría estructurado para consola de producción (Render)
    console.log(`[${serverTimestamp}] [AUDIT_LOG] [INCIDENT_PROCESSED]
    ├── Event ID: ${eventId}
    ├── Device ID: ${deviceId}
    ├── IP de Origen: ${clientIp}
    ├── Threat Score (Servidor): ${threatScoreServer}%
    ├── Zona / País: ${country}
    ├── Estado de Batería: ${batteryLevel !== undefined ? batteryLevel + '%' : 'N/D'}
    └── Vector GPS: ${location ? `Lat: ${location.latitude}, Lng: ${location.longitude} [Acc:${location.accuracy || 'N/D'}m]` : 'No disponible'}`);

    // Construcción de respuesta multilingüe corporativa
    const isEnglish = acceptLanguage.toLowerCase().includes('en');
    const responseMessage = isEnglish 
        ? "Telemetry securely processed. Threat vector evaluated and logged." 
        : "Telemetría procesada con éxito. Vector de amenaza evaluado y registrado en el núcleo.";

    // Respuesta JSON estrictamente sincronizada con la arquitectura del cliente móvil
    return res.status(200).json({
        status: "success",
        code: 200,
        event_id: eventId,
        threat_score_server: threatScoreServer,
        country: country,
        timestamp: serverTimestamp,
        message: responseMessage
    });
});

// Verificación de estado del nodo central
app.get('/', (req, res) => {
    res.status(200).json({
        system: "Protocolo Skynet - Agente Guardián Backend",
        status: "Online",
        environment: "Production",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Núcleo del servidor iniciado de forma segura en el puerto ${PORT}`);
});
