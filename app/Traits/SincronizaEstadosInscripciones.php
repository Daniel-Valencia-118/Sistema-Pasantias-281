<?php
// app/Traits/SincronizaEstadosInscripciones.php

namespace App\Traits;

use App\Models\Inscripcion;

trait SincronizaEstadosInscripciones
{
    /**
     * Sincroniza los estados de las inscripciones según el estado de la pasantía.
     * 
     * Reglas:
     * - Si Pasantía.estado === 'ABIERTA' y Inscripcion.estado != 'inscrito' → actualiza a 'inscrito'
     * - Si Pasantía.estado === 'INICIADO' y Inscripcion.estado != 'iniciado' → actualiza a 'iniciado'
     * - Si Pasantía.estado === 'FINALIZADO' y Inscripcion.estado === 'inscrito' → actualiza a 'iniciado'
     *
     * @param \Illuminate\Database\Eloquent\Collection $inscripciones
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function sincronizarEstadosInscripciones($inscripciones)
    {
        foreach ($inscripciones as $inscripcion) {
            $estadoPasantia = $inscripcion->pasantia->estado;
            $estadoInscripcion = $inscripcion->estado;
            $actualizado = false;

            // Regla 1: Si la pasantía está ABIERTA, la inscripción debe estar 'inscrito'
            if ($estadoPasantia === 'ABIERTA' && $estadoInscripcion !== 'inscrito') {
                $inscripcion->estado = 'inscrito';
                $actualizado = true;
            }
            
            // Regla 2: Si la pasantía está INICIADO, la inscripción debe estar 'iniciado'
            if ($estadoPasantia === 'INICIADO' && $estadoInscripcion == 'inscrito') {
                $inscripcion->estado = 'iniciado';
                $actualizado = true;
            }
            
            // Regla 3: Si la pasantía está FINALIZADO y la inscripción está 'inscrito', pasa a 'iniciado'
            if ($estadoPasantia === 'FINALIZADO' && $estadoInscripcion === 'inscrito') {
                $inscripcion->estado = 'iniciado';
                $actualizado = true;
            }

            if ($actualizado) {
                $inscripcion->save();
            }
        }

        // Refrescar cada modelo individualmente para obtener datos actualizados (opcional)
        $inscripciones->each->refresh();

        return $inscripciones;
    }
}