# API Sistema de Pasantías

## Autenticación
- POST /api/login - Login (usuario o email + password)
- POST /api/logout - Logout (requiere token)
- GET /api/me - Obtener usuario actual

## Registro público
- POST /api/registro/pasante - Registrar pasante (requiere aprobación)
- POST /api/registro/tutor - Registrar tutor (requiere aprobación)
- POST /api/registro/gerente - Registrar gerente + empresa (requiere aprobación)
- POST /api/registro/jefe - Registrar jefe (requiere aprobación del gerente)

## Admin (requiere token + role:admin)
- GET /api/admin/pasantes - Listar pasantes
- POST /api/admin/pasantes - Crear pasante
- PUT /api/admin/pasantes/{id} - Actualizar pasante
- GET /api/admin/solicitudes - Listar solicitudes pendientes
- POST /api/admin/solicitudes/{id}/aprobar - Aprobar solicitud

## Pasante (requiere token + role:pasante)
- GET /api/pasante/pasantias - Listar pasantías disponibles
- POST /api/pasante/inscribirse - Inscribirse a pasantía
- GET /api/pasante/bitacora - Ver mi bitácora

## Gerente (requiere token + role:gerente)
- GET /api/gerente/pasantias - Listar mis pasantías
- POST /api/gerente/pasantias - Crear pasantía
- POST /api/gerente/actividades - Crear actividad
- GET /api/gerente/solicitudes-jefes - Listar solicitudes de jefes

## Jefe (requiere token + role:jefe)
- POST /api/jefe/asignar-subactividad - Asignar subactividad
- POST /api/jefe/evaluar-bitacora - Evaluar subactividad
- POST /api/jefe/informe-final/{idInscripcion} - Generar informe final

## Tutor (requiere token + role:tutor)
- GET /api/tutor/mis-pasantes - Listar mis pasantes
- PUT /api/tutor/informe/{idInscripcion}/resultado - Modificar resultado