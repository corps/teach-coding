import {Dispatch} from "react";
import React from 'react';

const defaultSprite = {
    x: 0,
    y: 0,
    url: "",
    text: "",
}

type Sprite = typeof defaultSprite;

type GameState = {[k: string]: Sprite}

export interface GameProps {
    sprites: GameState,
    onClickSprite: Dispatch<string>,
}

export function Game({sprites, onClickSprite}: GameProps) {
  return <div className="center" style={{position: 'relative', width: 300, height: 300, border: '1px black solid'}}>
    {Object.keys(sprites).map(spriteId => {
      const {x, y, url, text} = {...defaultSprite, ...sprites[spriteId]};
      const style = {left: x, top: y, position: "absolute" as "absolute"};

      if (url) {
          return <img key={spriteId} src={url} style={style} onClick={() => onClickSprite(spriteId)}/>
      } else {
          return <span key={spriteId} className="f6" style={style} onClick={() => onClickSprite(spriteId)}>{text}</span>
      }
    })}
  </div>
}