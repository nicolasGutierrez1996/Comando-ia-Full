import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GptService } from '../../../services/gpt.service';
import { MarkdownModule } from 'ngx-markdown';

interface MensajeIA {
  autor: 'usuario' | 'ia';
  texto: string;
}

@Component({
  selector: 'app-chat-ia',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      MarkdownModule
    ],
  templateUrl: './chat-ia.component.html',

  styleUrls: ['./chat-ia.component.css'],
})
export class ChatIaComponent {
  mensajes: MensajeIA[] = [];
  inputTexto: string = '';

constructor(
  private gptService: GptService
) {}


enviarMensaje() {
  const prompt = this.inputTexto.trim();
  if (!prompt) return;

  this.mensajes.push({ autor: 'usuario', texto: prompt });
  this.inputTexto = '';

  const indexPensando = this.mensajes.push({
    autor: 'ia',
    texto: '⏳ Pensando...'
  }) - 1;

const historialFormateado = this.mensajes.map(m => ({
  rol: m.autor === 'usuario' ? 'user' as const : 'assistant' as const,
  content: m.texto
}));

const historialReciente = historialFormateado.slice(-8);

  // Llamar al servicio GPT
   this.gptService.preguntar({ prompt, historial: historialReciente }).subscribe({
   next: (res) => {
      const respuestaIA = res.respuesta || '🤖 No se encontró respuesta.';
      this.mensajes[indexPensando].texto = respuestaIA;
    },
    error: () => {
      this.mensajes[indexPensando].texto = '❌ Error al consultar la IA.';
    }
  });
}
}
