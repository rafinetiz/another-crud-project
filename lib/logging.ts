/**
 * Sementara hanya keluarkan outputnya ke stdout
 * TODO: output to file
 */
export class Logging {
  private writer: NodeJS.WriteStream;

  constructor() {
    this.writer = process.stdout;
  }

  private _write(text: string, tag: string) {
    this.writer.write(`[${new Date().toISOString()}] ${tag} - ${text}\n`);
  }

  public info(text: string) {
    this._write(text, 'INFO');
  }

  public error(text: string) {
    this._write(text, 'ERROR');
  }
}

const logging: Logging = new Logging();

export default logging;
