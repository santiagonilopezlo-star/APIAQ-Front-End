# Monitor de calidad del aire

Front Angular del prototipo académico. Se conecta al backend Python en `http://127.0.0.1:5000`. La clave de OpenAQ queda en el servidor.

## Pantallas

- Inicio: buscar estación, consultar PM2.5, NO2 y O3, AQI EPA y referencia OMS por separado.
- Historial: tabla de consultas, filtros, gráfica PNG del backend y descarga CSV.
- Administración: acceso local `admin` / `monitor` y limpieza del historial con confirmación.

## Requisitos

- Node.js 20.19+ o 22.12+
- Backend Flask en marcha

## Desarrollo

```bash
npm install
npm start
```

Abre `http://localhost:4200/`.

En el backend, desde la raíz del repo Python y con el entorno activo:

```bash
python -m flask --app backend/app/main run
```
