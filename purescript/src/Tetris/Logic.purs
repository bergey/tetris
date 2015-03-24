module Tetris.Logic where

import Tetris.Types
import Tetris.Error

import Data.Array
import Data.Tuple
import Data.Maybe
import Data.Foldable
import Control.Monad.Eff
import Control.Monad.Eff.Random

initialGameState :: Shape -> Shape -> GameState
initialGameState first second =
  { current: { shape: first, position: initialPosition, orientation: North }
  , next: second
  , board: replicate 20 blankRow
  , piecesUsed: 1
  , rowsFinished: 0
  }

initialPosition :: Pos
initialPosition = { x: 4, y: 0 }

blankRow :: [Cell]
blankRow = replicate 10 Nothing

stepGame :: forall eff. GameState -> Eff (random :: Random | eff) GameState
stepGame gs = if canDescend gs
              then return $ descend gs
              else do
                nextShape <- randomShape
                return $ endPiece nextShape gs

-- | @endPiece@ is called by 'stepGame' and 'dropPiece'.  It updates
-- the piece, clears full rows, and updates the scores.
endPiece :: Shape -> GameState -> GameState
endPiece sh gs = let
  new = clearRows $ installPiece gs.current gs.board 
  in gs
  { current = { shape: gs.next, position: initialPosition, orientation: North }
  , next = sh
  , board = new.bd
  , piecesUsed = gs.piecesUsed + 1
  , rowsFinished = gs.rowsFinished + new.scored
  }  

installPiece :: Piece -> Board -> Board
installPiece pc bd = foldrArray (updateBoard (Just pc.shape)) bd $ cells pc

updateBoard :: Cell -> Pos -> Board -> Board
updateBoard c p bd = modifyAt p.y (updateAt p.x c) bd                

-- TODO handle orientation
cells :: Piece -> [Pos]
cells p = plus p.position <<< reorient p.orientation <$> case p.shape of
  O -> [ pos 0 0, pos 1 0, pos 0 1, pos 1 1 ]
  L -> [ pos (-1) 0, pos 0 0, pos 1 0, pos (-1) 1 ]
  G -> [ pos (-1) 0, pos 0 0, pos 1 0, pos 1 1 ]
  T -> [ pos (-1) 0, pos 0 0, pos 1 0, pos 0 1 ]
  I -> [ pos (-1) 0, pos 0 0, pos 1 0, pos 2 0 ]
  S -> [ pos 0 0, pos 1 0, pos (-1) 1, pos 0 1 ]
  Z -> [ pos (-1) 0, pos 0 0, pos 0 1, pos 1 1 ]

-- | this is rotation by multiples of quarter-turn
reorient :: Orientation -> Pos -> Pos
reorient North p = p
reorient West p = { x: -1 * p.y, y: p.x }
reorient South p = { x: p.x, y: -1 * p.y }
reorient East p = { x: p.y, y: -1 * p.x }

plus :: Pos -> Pos -> Pos
plus u v = { x: u.x + v.x, y: u.y + v.y }

clearRows :: Board -> { scored :: Number, bd :: Board }
clearRows bd = { scored: scored, bd: append blanks kept } where
  kept = filter (not <<< all isJust) bd
  blanks = replicate scored blankRow
  scored = 20 - length kept

validMove :: Pos -> GameState -> Boolean
validMove dp gs = all (validPos gs.board) $ cells (gs.current { position = plus gs.current.position dp})

canDescend :: GameState -> Boolean
canDescend = validMove {x: 0, y: 1}

descend :: GameState -> GameState
descend gs = gs { current = gs.current { position = plus gs.current.position {x: 0, y: 1} } }

-- overBoard :: Pos -> Boolean
-- overBoard p = or [ p.x < 0, p.x > 9, p.y < 0, p.y > 19 ]

-- collision :: Board -> Pos -> Boolean
-- collision bd p = isJust $ lookupCell bd p

validPos :: Board -> Pos -> Boolean
validPos bd p = maybe false isNothing $ lookupCell' bd p

lookupCell :: Board -> Pos -> Cell
lookupCell bd p = case lookupCell' bd p of
  Nothing -> error "recieved Pos out of game board area"
  Just c -> c

lookupCell' :: Board -> Pos -> Maybe Cell
lookupCell' bd p = do
  row <- bd !! p.y
  row !! p.x

randomShape :: forall eff. Eff (random :: Random | eff) Shape
randomShape = cdf <$> random where
  cdf x | x < 1/7 = O
  cdf x | x < 2/7 = L
  cdf x | x < 3/7 = G
  cdf x | x < 4/7 = T
  cdf x | x < 5/7 = I
  cdf x | x < 6/7 = S
  cdf x | otherwise = Z

replicate :: forall a. Number -> a -> [a]
replicate n a = if n < 1 then [] else map (\_ -> a) (1..n)

dropPiece :: GameState -> GameState
dropPiece gs = if canDescend gs
                then dropPiece $ moveDown gs
                else gs

movePiece :: Pos -> GameState -> GameState
movePiece dp gs = if validMove dp gs
                  then gs { current =
                               gs.current { position = plus gs.current.position dp }}
                  else gs

moveLeft :: GameState -> GameState
moveLeft = movePiece {x: -1, y: 0}

moveRight :: GameState -> GameState
moveRight = movePiece {x: 1, y: 0}

moveDown :: GameState -> GameState
moveDown = movePiece {x: 0, y: 1}

clockwise :: Orientation -> Orientation
clockwise North = East
clockwise East = South
clockwise South = West
clockwise West = North

rotatePieceCW :: GameState -> GameState
rotatePieceCW gs = let
  newP = gs.current {
    orientation = clockwise gs.current.orientation
    }
  in if all (validPos gs.board) (cells newP) 
     then gs {current = newP }
     else gs
          
