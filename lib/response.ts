export function Ok<T>(data?: T) {
  return {
    message: 'ok',
    data: data || null,
  };
}
