
export interface CompressionOptions {
  enabled: boolean;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // 1 = fastest, 9 = best compression
  threshold: number; // Minimum size in bytes to compress
}

export class CompressionService {
  private static instance: CompressionService;
  private compressionSupported: boolean = false;

  constructor() {
    this.checkCompressionSupport();
  }

  public static getInstance(): CompressionService {
    if (!CompressionService.instance) {
      CompressionService.instance = new CompressionService();
    }
    return CompressionService.instance;
  }

  private checkCompressionSupport(): void {
    this.compressionSupported = 'CompressionStream' in window && 'DecompressionStream' in window;
    console.log(`🗜️ Compression support: ${this.compressionSupported ? 'available' : 'not available'}`);
  }

  public async compressText(text: string, options: CompressionOptions = { enabled: true, level: 6, threshold: 1024 }): Promise<string> {
    if (!options.enabled || !this.compressionSupported || text.length < options.threshold) {
      return text;
    }

    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      // Write the text
      await writer.write(encoder.encode(text));
      await writer.close();
      
      // Read compressed data
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      // Convert to base64 for storage/transmission
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const base64 = btoa(String.fromCharCode(...compressed));
      const compressionRatio = (text.length / base64.length);
      
      console.log(`🗜️ Compressed text: ${text.length} -> ${base64.length} bytes (${compressionRatio.toFixed(2)}x)`);
      
      return `compressed:${base64}`;
    } catch (error) {
      console.warn('❌ Compression failed, returning original text:', error);
      return text;
    }
  }

  public async decompressText(compressedText: string): Promise<string> {
    if (!compressedText.startsWith('compressed:') || !this.compressionSupported) {
      return compressedText;
    }

    try {
      const base64Data = compressedText.replace('compressed:', '');
      const compressed = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      // Write compressed data
      await writer.write(compressed);
      await writer.close();
      
      // Read decompressed data
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      // Convert back to text
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const decoder = new TextDecoder();
      const result = decoder.decode(decompressed);
      
      console.log(`🗜️ Decompressed text: ${base64Data.length} -> ${result.length} bytes`);
      
      return result;
    } catch (error) {
      console.warn('❌ Decompression failed, returning original text:', error);
      return compressedText;
    }
  }

  public getCompressionSupport(): boolean {
    return this.compressionSupported;
  }
}
