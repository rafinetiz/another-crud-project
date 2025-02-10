type ValueOrCallback<T> = T extends Function
  ? never
  : T | ((value: string) => T);

/**
 * ini adalah fungsi pembantu untuk mengambil value dari env variable
 *
 * @param name env variable name
 * @param value_or_callback a default value or callback for processing the value
 * @returns
 */
export function env<T extends unknown = string>(
  name: string,
  // for some reason T | ((value: string) => T) doesn't work.
  // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-606110995
  value_or_callback: ValueOrCallback<T>
): T {
  if (typeof value_or_callback === 'function') {
    return value_or_callback(process.env[name]);
  }

  if (!process.env[name]) {
    return value_or_callback as T;
  }

  return process.env[name] as T;
}
