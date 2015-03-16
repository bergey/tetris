module Tetris.Types where

import Data.Maybe

type GameState = 
  { current :: Piece
  , next :: Shape
  , board :: Board
  , piecesUsed :: Number
  , rowsFinished :: Number
  }
  
data Shape = O | L | G | T | I | S | Z
                                     
data Orientation = North | South | East | West

type Piece = { 
  shape :: Shape,
  position :: Pos,
  orientation :: Orientation
  }
             
             
type Screen = {
  cellSize :: Number,
  textSize :: Number,
  gutter :: Number,
  lineSpacing :: Number
  }
              
type Pos = {
  x :: Number,
  y :: Number
  }


pos :: Number -> Number -> Pos
pos x y = { x: x, y: y }

type Cell = Maybe Shape
            
type Board = [[Cell]]

screen :: Screen
screen = {
  cellSize: 10,
  textSize: 18,
  gutter: 10,
  lineSpacing: 24
  }
