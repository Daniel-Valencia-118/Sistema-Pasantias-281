<!-- resources/views/emails/registro-aprobado.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <title>Cuenta Aprobada</title>
</head>
<body>
    <h2>¡Bienvenido al Sistema de Pasantías!</h2>
    <p>Hola <strong>{{ $user->nombre }}</strong>,</p>
    <p>Tu solicitud de registro como <strong>{{ $rol }}</strong> ha sido <strong>APROBADA</strong>.</p>
    <p>Ya puedes iniciar sesión con tus credenciales:</p>
    <ul>
        <li><strong>Usuario:</strong> {{ $user->nombre_user }}</li>
        <li><strong>Contraseña:</strong> La que elegiste al registrarte</li>
    </ul>
    <a href="{{ url('/login') }}">Iniciar sesión</a>
    <hr>
    <p>¡Gracias por formar parte de nuestro sistema!</p>
</body>
</html>