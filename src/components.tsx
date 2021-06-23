import React, {Dispatch, useCallback, useEffect, useMemo, useState} from 'react';
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs/components/prism-core";

export function CoolTextInput(props: { value: string, onChange: Dispatch<string>, placeholder: string }) {
    const {onChange, value, placeholder} = props;
    const [innerValue, setInnerValue] =  useState(value);

    useEffect(() => {
        setInnerValue(value);
    }, [value]);

    const _onChange = useCallback((s: string) => {
        if (s.includes("\n")) {
            onChange(s.replace("\n", ""));
        } else {
            setInnerValue(s);
        }
    }, [onChange])

    return <Editor
        autoFocus
        value={innerValue}
        onValueChange={_onChange}
        placeholder={placeholder}
        highlight={(s) => s}
        padding={10}
        className="editor"
        style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
        }}
    />;
}
