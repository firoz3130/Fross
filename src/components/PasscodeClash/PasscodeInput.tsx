import { useEffect, useRef, useState } from "react";

type Props = {
    locked?: (string | null)[];
    onSubmit: (code: string) => void;
    autoFill?: boolean;
};

export default function PasscodeInput({ locked = [null, null, null, null], onSubmit, autoFill = true }: Props) {
    const [vals, setVals] = useState<string[]>(["", "", "", ""]);
    const refs = [useRef<HTMLInputElement | null>(null), useRef<HTMLInputElement | null>(null), useRef<HTMLInputElement | null>(null), useRef<HTMLInputElement | null>(null)];

    useEffect(() => {
        if (autoFill) {
            setVals(v => v.map((c, i) => (locked[i] ? String(locked[i]) : c)));
        }
    }, [locked, autoFill]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
        const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
        setVals(prev => {
            const next = [...prev];
            next[idx] = v;
            return next;
        });
        if (v && refs[idx + 1]) {
            refs[idx + 1].current?.focus();
        }
    }

    function handleKey(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
        if (e.key === 'Backspace' && !vals[idx] && idx > 0) {
            refs[idx - 1].current?.focus();
        }
        if (e.key === 'Enter') {
            submit();
        }
    }

    function submit() {
        const code = vals.map((v, i) => locked[i] ?? v ?? '').join('');
        if (code.length === 4 && /^[0-9]{4}$/.test(code)) {
            onSubmit(code);
            setVals(["", "", "", ""]);
        }
    }

    return (
        <div className="passcode-input">
            {Array.from({ length: 4 }).map((_, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={locked[i] ? String(locked[i]) : vals[i]}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKey(e, i)}
                    className={`digit ${locked[i] ? 'locked' : ''}`}
                    disabled={!!locked[i]}
                />
            ))}
            <button className="submit-guess" onClick={submit}>Lock-In</button>
        </div>
    );
}
