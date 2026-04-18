<?php
// app/Mail/RegistroAprobadoMail.php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistroAprobadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $rol;

    public function __construct($user, $rol)
    {
        $this->user = $user;
        $this->rol = $rol;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Tu cuenta ha sido aprobada! - Sistema de Pasantías',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registro-aprobado',
        );
    }
}