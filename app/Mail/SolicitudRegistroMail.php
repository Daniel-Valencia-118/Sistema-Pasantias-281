<?php
// app/Mail/SolicitudRegistroMail.php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudRegistroMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $rol;
    public $empresa;

    public function __construct($user, $rol, $empresa = null)
    {
        $this->user = $user;
        $this->rol = $rol;
        $this->empresa = $empresa;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nueva solicitud de registro - Sistema de Pasantías',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud-registro',
        );
    }
}