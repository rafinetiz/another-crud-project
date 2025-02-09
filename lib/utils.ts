export function env<T extends unknown = string>(
  name: string,
  value_or_callback: T | ((value: string) => T)
) {
  if (typeof value_or_callback === 'function') {
    return process.env[name] as T;
  }

  if (!process.env[name]) {
    return value_or_callback as T;
  }

  return process.env[name] as T;
}
