/**
 * Multimodal Architecture Service (TASK-013 PART 13)
 * Architectural foundation & interface stubs for Image Analysis, PDF/Invoice Reading,
 * Warranty OCR, Serial Number/Barcode Recognition, and Voice Notes.
 */

import { MultimodalProcessorStub } from '../../../types/aiKnowledgeEngine';

export class MultimodalArchitectureService {
  private static processors: MultimodalProcessorStub[] = [
    {
      type: 'image',
      isAvailable: true,
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      version: 'v2.0-vision-stub',
    },
    {
      type: 'pdf_invoice',
      isAvailable: true,
      supportedFormats: ['application/pdf'],
      version: 'v1.5-invoice-ocr',
    },
    {
      type: 'warranty_ocr',
      isAvailable: true,
      supportedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      version: 'v1.2-warranty-verifier',
    },
    {
      type: 'serial_barcode',
      isAvailable: true,
      supportedFormats: ['image/jpeg', 'image/png'],
      version: 'v2.1-barcode-parser',
    },
    {
      type: 'voice_note',
      isAvailable: false,
      supportedFormats: ['audio/mp3', 'audio/wav', 'audio/m4a'],
      version: 'v1.0-speech-to-text-planned',
    },
  ];

  public static getRegisteredProcessors(): MultimodalProcessorStub[] {
    return this.processors;
  }
}
