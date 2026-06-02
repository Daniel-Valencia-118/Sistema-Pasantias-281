<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificado de Pasantía</title>
    <style>
        /* Configuración de página horizontal (típica de certificados) */
        @page { 
            size: letter landscape; 
            margin: 0; 
        }
        
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            color: #1e293b; 
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }

        /* Contenedor principal con doble borde elegante */
        .certificate-container {
            border: 2px solid #b45309; /* Borde exterior ocre/dorado fino */
            margin: 30px;
            padding: 4px;
        }

        .certificate-inner {
            border: 14px solid #1e3a8a; /* Borde interior azul marino grueso */
            padding: 50px 60px;
            text-align: center;
            background-image: radial-gradient(#ffffff 80%, #f8fafc 100%);
        }

        /* Encabezado */
        .decor-line {
            width: 120px;
            height: 3px;
            background-color: #b45309;
            margin: 15px auto;
        }

        .title { 
            font-size: 46px; 
            font-family: 'Times New Roman', Times, serif; /* Serif le da un toque académico formal */
            font-weight: bold; 
            color: #1e3a8a; 
            text-transform: uppercase;
            letter-spacing: 2px;
            /* margin-bottom: 5px; */
        }

        .subtitle { 
            font-size: 14px; 
            color: #64748b; 
            text-transform: uppercase;
            letter-spacing: 3px;
            /* margin-bottom: 45px; */
        }

        /* Cuerpo del texto */
        .introduction {
            font-size: 18px;
            font-style: italic;
            color: #475569;
            margin-bottom: 15px;
        }

        .student-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #1e3a8a; 
            margin: 20px 0;
            border-bottom: 1px dotted #b45309;
            display: inline-block;
            padding-bottom: 5px;
            width: 80%;
        }

        .body-text { 
            font-size: 16px; 
            line-height: 1.8; 
            color: #334155;
            margin: 10px auto;
            width: 85%;
        }

        .highlight { 
            font-weight: bold; 
            color: #0f172a; 
        }

        /* Bloque de Calificación Destacado */
        .meta-container {
            margin: 35px auto;
            width: 90%;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            padding: 15px 0;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-cell {
            width: 33.33%;
            text-align: center;
            font-size: 14px;
            color: #475569;
        }

        .meta-value {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 5px;
        }

        .meta-value.status-pass {
            color: #15803d; /* Verde institucional */
        }

        /* Sección de Firmas (Estructurada con tabla para DomPDF) */
        .footer-table { 
            width: 100%; 
            margin-top: 70px;
            border-collapse: collapse;
        }

        .signature-cell { 
            width: 50%; 
            text-align: center; 
            vertical-align: top;
            padding: 0 40px;
        }

        .signature-line {
            border-top: 1px solid #94a3b8;
            padding-top: 10px;
            font-size: 14px;
            color: #1e293b;
        }

        .signature-title {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
        }
    </style>
</head>
<body onload="window.print()">

    <div class="certificate-container">
        <div class="certificate-inner">
            
            <!-- Encabezado -->
            <div class="title">Certificado de Pasantía</div>
            <div class="decor-line"></div>
            <div class="subtitle">Otorgado por el Sistema de Gestión de Pasantías</div>

            <!-- Contenido Principal -->
            <div class="introduction">Por cuanto se hace constar que:</div>
            
            <div class="student-name">{{ $pasante }}</div>
            
            <div class="body-text">
                Con Cédula de Identidad <span class="highlight">{{ $cedula }}</span>, ha cumplido y aprobado satisfactoriamente el período programado de pasantías profesionales en la organización <span class="highlight">{{ $empresa }}</span>, desempeñando de manera eficiente las funciones correspondientes al cargo de <span class="highlight">{{ $pasantia }}</span>.
            </div>

            <!-- Tabla de Metadatos (Calificación, Carga Horaria, Fecha) -->
            <div class="meta-container">
                <table class="meta-table">
                    <tr>
                        <td class="meta-cell">
                            <div>CALIFICACIÓN FINAL</div>
                            <div class="meta-value {{ strtolower($resultado) == 'aprobado' ? 'status-pass' : '' }}">
                                {{ $promedio }}/100 ({{ strtoupper($resultado) }})
                            </div>
                        </td>
                        <td class="meta-cell" style="border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                            <div>CARGA HORARIA</div>
                            <div class="meta-value">{{ $cargahoraria }} Horas</div>
                        </td>
                        <td class="meta-cell">
                            <div>FECHA DE EMISIÓN</div>
                            <div class="meta-value">{{ \Carbon\Carbon::parse($fecha)->format('d/m/Y') }}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Firmas estructuradas con Tabla -->
            <table class="footer-table">
                <tr>
                    <td class="signature-cell">
                        <div style="height: 50px;"></div> <!-- Espacio simulado para firma física o digital -->
                        <div class="signature-line">
                            <strong>{{ $jefe }}</strong>
                        </div>
                        <div class="signature-title">Firma de la Autoridad / Supervisor</div>
                    </td>
                    <!-- Logo del sistema -->
                    <td class="signature-cell">
                        @if($logo)
                            <img class="logo" src="{{ storage_path('app/public/' . $logo) }}" style="max-width: 100px; max-height: 60px;">
                            <div class="signature-title">{{ $nombre_sistema }}</div>
                            <!-- <div class="signature-title" style="font-size: 10px; color: #475569;">{{ $slogan }}</div> -->
                        @endif
                    </td>
                    <td class="signature-cell">
                        <div style="height: 50px;"></div> <!-- Espacio simulado para el sello -->
                        <div class="signature-line">
                            <strong>Sello Institucional</strong>
                        </div>
                        <div class="signature-title">Validación de la empresa</div>
                    </td>
                </tr>
            </table>

        </div>
    </div>

</body>
</html>
