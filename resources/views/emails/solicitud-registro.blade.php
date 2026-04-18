<!-- resources/views/emails/solicitud-registro.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <title>Solicitud de Registro</title>
</head>
<body>
    <h2>Nueva solicitud de registro</h2>
    <p><strong>Usuario:</strong> {{ $user->nombre_user }}</p>
    <p><strong>Nombre:</strong> {{ $user->nombre }} {{ $user->ap_paterno }}</p>
    <p><strong>Email:</strong> {{ $user->correo }}</p>
    <p><strong>Rol solicitado:</strong> {{ $rol }}</p>
    @if($empresa)
        <p><strong>Empresa:</strong> {{ $empresa->nombre }}</p>
        <p><strong>NIT:</strong> {{ $empresa->nit }}</p>
    @endif
    <hr>
    <p>Para aprobar o rechazar esta solicitud, ingresa al panel de administración.</p>
    <a href="{{ url('/admin/solicitudes') }}">Ir al panel</a>
</body>
</html>