# Monitor de Calidad del Aire

Prototipo visual en Angular para presentar una consulta de calidad del aire en Bogotá. Esta entrega
solo incluye frontend y datos de demostración: todavía no se conecta a OpenAQ ni a un backend.
Los valores, la clasificación y la gráfica son ficticios; no representan condiciones actuales.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Desarrollo local

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. El enlace **Ver en Maps** abre la ubicación de Bogotá en Google
Maps en una pestaña nueva.

## Estructura

```text
src/app/
├── core/
│   ├── models/air-quality.model.ts
│   └── services/air-quality.service.ts
├── data/mock-air-quality.ts
└── features/dashboard/
    ├── dashboard.component.ts
    ├── dashboard.component.html
    └── dashboard.component.scss
```

Los datos de muestra se mantienen separados del componente para facilitar una futura integración
con una API. Cuando exista backend, `AirQualityService` podrá reemplazar la fuente local sin exponer
credenciales de OpenAQ en el navegador.

## Validación

```bash
npm run build
npm test -- --watch=false
```
