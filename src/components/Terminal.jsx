import { useRef, useState } from 'react';
import { Reveal } from './Reveal.jsx';

const HELP = 'Commands: whoami · stack · contact · joke · sudo · clear';

function run(cmdRaw) {
  const cmd = cmdRaw.trim().toLowerCase();
  if (!cmd) return null;
  if (cmd === 'help') return HELP;
  if (cmd === 'whoami') return 'Jitendra Kulkarni — developer first, photographer and filmmaker second. Based in Pune.';
  if (cmd === 'stack') return 'React · Node · Python · Supabase · Docker · Linux — see the wall above.';
  if (cmd === 'contact') return 'WhatsApp +91 98901 01755 · 2sloowwww@gmail.com';
  if (cmd === 'joke') return 'Why do programmers prefer dark mode? Because light attracts bugs.';
  if (cmd === 'sudo' || cmd.startsWith('sudo ')) return 'Permission denied: this machine only makes websites.';
  if (cmd === 'ls') return 'stack/  brands/  work/  stills/  films/  about/  contact/';
  return `command not found: ${cmd} — try 'help'`;
}

export default function Terminal() {
  const [lines, setLines] = useState([{ out: HELP }]);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const cmd = value;
    setValue('');
    if (cmd.trim().toLowerCase() === 'clear') { setLines([]); return; }
    const out = run(cmd);
    setLines((prev) => [...prev, { cmd, out }].slice(-8));
  };

  return (
    <Reveal as="div" className="terminal" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="terminal-bar"><span></span><span></span><span></span><i>guest@vyatirikht</i></div>
      <div className="terminal-body">
        {lines.map((l, i) => (
          <div className="terminal-line" key={i}>
            {l.cmd !== undefined && <p><span className="terminal-prompt">$</span> {l.cmd}</p>}
            {l.out && <p className="terminal-out">{l.out}</p>}
          </div>
        ))}
        <form onSubmit={submit} className="terminal-input-line">
          <span className="terminal-prompt">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="try 'help'"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Terminal command"
          />
        </form>
      </div>
    </Reveal>
  );
}
