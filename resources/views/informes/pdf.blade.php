<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; color: #333; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 16px; font-weight: bold; text-decoration: underline; }
    </style>
</head>
<body onload="window.print()">
    <div class="header">
        <div class="title">INFORME FINAL DE PASANTÍA</div>
        <p>Fecha de Generación: {{ \Carbon\Carbon::parse($informe['fecha'])->format('d/m/Y') }}</p>
    </div>

    <table class="table">
        <tr><th colspan="2">DATOS DEL PASANTE</th></tr>
        <tr>
            <td><strong>Nombre Completo:</strong></td>
            <td>
                {{ $informe['inscripcion']['pasante']['user']['nombre'] }} 
                {{ $informe['inscripcion']['pasante']['user']['ap_paterno'] }} 
                {{ $informe['inscripcion']['pasante']['user']['ap_materno'] }}
            </td>
        </tr>
        <tr>
            <td><strong>R.U. / Matrícula:</strong></td>
            <td>{{ $informe['inscripcion']['pasante']['ru'] }} / {{ $informe['inscripcion']['pasante']['matricula'] }}</td>
        </tr>
        <tr>
            <td><strong>Proyecto/Pasantía:</strong></td>
            <td>{{ $informe['inscripcion']['pasantia']['nombre_pas'] }}</td>
        </tr>
    </table>

    <table class="table">
        <tr><th colspan="2">CALIFICACIÓN</th></tr>
        <tr>
            <td><strong>Promedio Calculado:</strong></td>
            <td>{{ $informe['promedio'] }} / 100</td>
        </tr>
        <!-- nota final -->
        <tr>
            <td><strong>Nota Final:</strong></td>
            <td>{{ $informe['nota_final'] }} / 100</td>
        </tr>
        <tr>
            <td><strong>Resultado:</strong></td>
            <td style="font-weight: bold; color: {{ $informe['resultado'] == 'APROBADO' ? 'green' : 'red' }};">
                {{ strtoupper($informe['resultado']) }}
            </td>
        </tr>
    </table>

    <table class="table">
        <tr><th colspan="2">DATOS DEL SUPERVISOR (JEFE)</th></tr>
        <tr>
            <td><strong>Jefe Inmediato:</strong></td>
            <td>
                {{ $informe['jefe']['user']['nombre'] }} 
                {{ $informe['jefe']['user']['ap_paterno'] }} 
                {{ $informe['jefe']['user']['ap_materno'] }}
            </td>
        </tr>
        <tr>
            <td><strong>Cargo y Área:</strong></td>
            <td>{{ $informe['jefe']['cargo'] }} - {{ $informe['jefe']['area'] }}</td>
        </tr>
    </table>
</body>
</html>
