// Extend Express namespace to include Multer types
// This ensures Express.Multer.File is available globally in NestJS
import 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer: Buffer;
        stream?: NodeJS.ReadableStream;
      }
    }
  }
}
