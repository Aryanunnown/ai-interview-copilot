import type { Request } from 'express';
import multer from 'multer';
import { HttpError } from '../../utils/httpError.js';
import { supportedResumeMimeTypes } from './resume.types.js';

const maxResumeFileSizeBytes = 5 * 1024 * 1024;

const resumeStorage = multer.memoryStorage();

function isSupportedResumeMimeType(mimeType: string) {
  return supportedResumeMimeTypes.includes(mimeType as any);
}

export const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: maxResumeFileSizeBytes,
    files: 1,
  },
  fileFilter: (_req: Request, file, callback) => {
    if (!isSupportedResumeMimeType(file.mimetype)) {
      return callback(new HttpError(400, 'Only PDF and DOCX resume uploads are supported'));
    }

    return callback(null, true);
  },
});

export function mapMulterError(error: unknown) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new HttpError(400, 'Resume file must be 5MB or smaller');
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return new HttpError(400, 'Upload exactly one resume file');
    }

    return new HttpError(400, error.message);
  }

  return error;
}
