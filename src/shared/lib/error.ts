export function getErrorMessage(error: unknown, fallback: string) {
  if (process.env.NODE_ENV === 'production') {
    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
