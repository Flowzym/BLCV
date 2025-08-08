type Level = 'debug'|'info'|'warn'|'error';
let level: Level = 'info';

export function setLogLevel(l: Level){ level = l; }
export function log(l: Level, ...args:any[]){
  const lv = ['debug','info','warn','error'];
  if (lv.indexOf(l) >= lv.indexOf(level)) {
    // eslint-disable-next-line no-console
    console[l === 'debug' ? 'log' : l](...args);
  }
}
export const logger = {
  debug: (...a:any[])=>log('debug',...a),
  info:  (...a:any[])=>log('info',...a),
  warn:  (...a:any[])=>log('warn',...a),
  error: (...a:any[])=>log('error',...a),
};
