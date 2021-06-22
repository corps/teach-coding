import {Dispatch} from "react";
import React from 'react';

const defaultSprite = {
    x: 0,
    y: 0,
    url: "",
}

type Sprite = typeof defaultSprite;

type GameState = {[k: string]: Sprite}

export interface GameProps {
    sprites: GameState,
    onClickSprite: Dispatch<string>,
}

export function Game({sprites, onClickSprite}: GameProps) {
  return <div style={{position: 'relative', width: '100%', height: 500, border: '1px black solid'}}>
    {Object.keys(sprites).map(spriteId => {
      const {x, y, url} = {...defaultSprite, ...sprites[spriteId]};
      return <img key={spriteId} src={url} style={{left: x, top: y, position: "absolute"}} onClick={() => onClickSprite(spriteId)}/>
    })}
  </div>
}