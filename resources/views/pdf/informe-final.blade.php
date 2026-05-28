{{-- resources/views/pdf/informe-final.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe Final de Pasantía</title>

    <style>
        body {
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #2d3748;
            margin: 0;
            padding: 24px;
            background: #f4f6f9;
        }

        .container {
            max-width: 850px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #dfe3e8;
            padding: 35px 40px;
        }

        /* =========================
           HEADER
        ========================== */

        .header {
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 18px;
            margin-bottom: 30px;
        }

        .header-top {
            width: 100%;
        }

        .header-title {
            text-align: center;
        }

        .header-title h1 {
            margin: 0;
            font-size: 24px;
            letter-spacing: 1px;
            color: #1e3a5f;
        }

        .header-title h2 {
            margin-top: 8px;
            font-size: 15px;
            font-weight: normal;
            color: #4a5568;
        }

        .document-info {
            margin-top: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 15px;
        }

        .document-info table {
            width: 100%;
            border-collapse: collapse;
        }

        .document-info td {
            border: none;
            padding: 3px 0;
            font-size: 10px;
            background: transparent !important;
        }

        .doc-label {
            width: 160px;
            font-weight: bold;
            color: #1e3a5f;
        }

        /* =========================
           LOGO
        ========================== */

        .logo {
            text-align: center;
            margin-bottom: 18px;
        }

        .logo img {
            max-height: 65px;
        }

        /* =========================
           SECCIONES
        ========================== */

        .section {
            margin-bottom: 28px;
        }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #ffffff;
            background: #1e3a5f;
            padding: 8px 12px;
            margin-bottom: 15px;
            letter-spacing: 0.4px;
        }

        .info-box {
            border: 1px solid #e2e8f0;
            background: #fcfcfd;
            padding: 14px 16px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table tr {
            border-bottom: 1px solid #edf2f7;
        }

        .info-table tr:last-child {
            border-bottom: none;
        }

        .info-table td {
            padding: 10px 6px;
            vertical-align: top;
            background: transparent !important;
        }

        .info-label {
            width: 210px;
            font-weight: bold;
            color: #2b4c74;
        }

        .info-value {
            color: #2d3748;
        }

        /* =========================
           TABLAS
        ========================== */

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th {
            background-color: #e9eef5;
            color: #1e3a5f;
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid #d6dee8;
        }

        td {
            padding: 9px 8px;
            border: 1px solid #e2e8f0;
            font-size: 10px;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* =========================
           RESULTADO FINAL
        ========================== */

        .resultado-box {
            text-align: center;
            padding: 22px;
            border: 1px solid #dbe4ee;
            background: #f8fafc;
        }

        .resultado-label {
            font-size: 11px;
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 10px;
        }

        .promedio {
            font-size: 34px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .aprobado {
            color: #15803d;
        }

        .reprobado {
            color: #b91c1c;
        }

        .abandono {
            color: #ea580c;
        }

        .estado-badge {
            display: inline-block;
            padding: 7px 18px;
            border-radius: 30px;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        /* =========================
           UTILIDADES
        ========================== */

        .nota {
            font-weight: bold;
            text-align: center;
        }

        .sin-nota {
            color: #a0aec0;
            text-align: center;
        }

        .text-center {
            text-align: center;
        }

        /* =========================
           FOOTER
        ========================== */

        .footer {
            margin-top: 40px;
            padding-top: 14px;
            border-top: 1px solid #dbe2ea;
            text-align: center;
            font-size: 9px;
            color: #718096;
            line-height: 1.5;
        }
    </style>
</head>

<body>

    <div class="container">

        {{-- Logo temporalmente deshabilitado --}}
        {{-- @if(file_exists(public_path('images/logo.png')))
        <div class="logo">
            <img src="{{ public_path('images/logo.png') }}" alt="Logo">
        </div>
        @endif --}}

        {{-- HEADER --}}
        <div class="header">

            <div class="header-title">
                <h1>INFORME FINAL DE PASANTÍA</h1>
                <h2>{{ $pasantia['nombre'] }}</h2>
            </div>

            <div class="document-info">
                <table>
                    <tr>
                        <td class="doc-label">Fecha de generación:</td>
                        <td>
                            {{ \Carbon\Carbon::parse($fecha_generacion)->isoFormat('D [de] MMMM [de] YYYY') }}
                        </td>

                        <td class="doc-label text-center">Hora:</td>
                        <td>
                            {{ \Carbon\Carbon::parse($fecha_generacion)->format('H:i') }}
                        </td>
                    </tr>

                    <tr>
                        <td class="doc-label">Sistema:</td>
                        <td colspan="3">
                            Sistema de Gestión de Pasantías
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        {{-- DATOS GENERALES --}}
        <div class="section">

            <div class="section-title">
                DATOS GENERALES DEL PASANTE
            </div>

            <div class="info-box">
                <table class="info-table">

                    <tr>
                        <td class="info-label">Nombre Completo</td>
                        <td class="info-value">
                            {{ $pasante['nombre_completo'] }}
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">CI / Matrícula / RU</td>
                        <td class="info-value">
                            {{ $pasante['ci'] }} /
                            {{ $pasante['matricula'] }} /
                            {{ $pasante['ru'] }}
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">Universidad / Carrera</td>
                        <td class="info-value">
                            {{ $pasante['universidad'] }} -
                            {{ $pasante['carrera'] }}
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">Mención / Semestre</td>
                        <td class="info-value">
                            {{ $pasante['mencion'] }} -
                            {{ $pasante['semestre'] }}º Semestre
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">Tutor Académico</td>
                        <td class="info-value">
                            {{ $pasante['tutor'] }}
                        </td>
                    </tr>

                </table>
            </div>
        </div>

        {{-- DATOS DE LA PASANTÍA --}}
        <div class="section">

            <div class="section-title">
                INFORMACIÓN DE LA PASANTÍA
            </div>

            <div class="info-box">
                <table class="info-table">

                    <tr>
                        <td class="info-label">Empresa / NIT</td>
                        <td class="info-value">
                            {{ $pasantia['empresa_nombre'] }} /
                            {{ $pasantia['empresa_nit'] }}
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">Gerente / Jefe Responsable</td>
                        <td class="info-value">
                            {{ $pasantia['gerente_nombre'] }} /
                            {{ $pasantia['jefe_nombre'] }}
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">Periodo de Pasantía</td>
                        <td class="info-value">
                            {{ \Carbon\Carbon::parse($pasantia['fecha_ini'])->isoFormat('D [de] MMMM [de] YYYY') }}
                            -
                            {{ \Carbon\Carbon::parse($pasantia['fecha_fin'])->isoFormat('D [de] MMMM [de] YYYY') }}
                        </td>
                    </tr>

                    <tr>
                        <td class="info-label">Carga Horaria / Turno / Duración</td>
                        <td class="info-value">
                            {{ $pasantia['carga_horaria'] }} horas /
                            {{ ucfirst($pasantia['turno']) }} /
                            {{ $pasantia['duracion'] }}
                        </td>
                    </tr>

                </table>
            </div>
        </div>

        {{-- Actividades y Evaluaciones --}}
        <div class="section">

            <div class="section-title">
                📝 ACTIVIDADES Y EVALUACIONES
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="5%">Nº</th>
                        <th width="25%">Actividad</th>
                        <th width="35%">Descripción</th>
                        <th width="20%">Estado</th>
                        <th width="15%">Nota</th>
                    </tr>
                </thead>

                <tbody>

                    @foreach($actividades as $index => $act)

                    <tr>
                        <td>{{ $index + 1 }}</td>

                        <td>
                            {{ $act['nombre'] }}
                        </td>

                        <td>
                            {{ $act['descripcion'] }}
                        </td>

                        <td>
                            {{ $act['estado'] }}
                        </td>

                        <td class="nota">
                            @if($act['nota'] !== null)
                                {{ $act['nota'] }}/100
                            @else
                                <span class="sin-nota">---</span>
                            @endif
                        </td>
                    </tr>

                    @endforeach

                </tbody>
            </table>
        </div>

        {{-- Resultado Final --}}
        <div class="section">

            <div class="section-title">
                🎯 RESULTADO FINAL
            </div>

            <div class="resultado-box">

                @if($abandono)

                    <div class="resultado-label">
                        ESTADO FINAL
                    </div>

                    <div class="promedio abandono">
                        ABANDONO
                    </div>

                    <div>
                        No se realizaron actividades suficientes para calcular un promedio.
                    </div>

                @else

                    <div class="resultado-label">
                        PROMEDIO FINAL OBTENIDO
                    </div>

                    <div class="promedio {{ $aprobado ? 'APROBADO' : 'REPROBADO' }}">
                        {{ $promedio }}/100
                    </div>

                    <div
                        class="estado-badge"
                        style="
                            background: {{ $aprobado ? '#dcfce7' : '#fee2e2' }};
                            color: {{ $aprobado ? '#166534' : '#991b1b' }};
                        "
                    >
                        {{ $aprobado ? 'APROBADO' : 'REPROBADO' }}
                    </div>

                @endif

            </div>
        </div>

        {{-- FOOTER --}}
        <div class="footer">
            Informe generado automáticamente por el Sistema de Gestión de Pasantías.<br>
            {{ \Carbon\Carbon::parse($fecha_generacion)->isoFormat('D [de] MMMM [de] YYYY') }}
            -
            {{ \Carbon\Carbon::parse($fecha_generacion)->format('H:i') }}
        </div>

    </div>

</body>
</html>