module Tetris.Logic where

import Tetris.Types
import Tetris.Error

import Data.Array
import Data.Tuple
import Data.Maybe
import Data.Foldable
import Control.Monad.Eff
import Control.Monad.Eff.Random

-- TODO make first shape random
initialGameState =
  { current: { shape: O, position: initialPosition, orientation: North }
  , next: L
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
cells p = plus p.position <$> case p.shape of
  O -> [ pos 0 0, pos 1 0, pos 0 1, pos 1 1 ]
  L -> [ pos (-1) 0, pos 0 0, pos 1 0, pos (-1) 1 ]
  G -> [ pos (-1) 0, pos 0 0, pos 1 0, pos 1 1 ]
  T -> [ pos (-1) 0, pos 0 0, pos 1 0, pos 0 1 ]
  I -> [ pos (-1) 0, pos 0 0, pos 1 0, pos 2 0 ]
  S -> [ pos 0 0, pos 1 0, pos (-1) 1, pos 0 1 ]
  Z -> [ pos (-1) 0, pos 0 0, pos 0 1, pos 1 1 ]

plus :: Pos -> Pos -> Pos
plus u v = { x: u.x + v.x, y: u.y + v.y }

clearRows :: Board -> { scored :: Number, bd :: Board }
clearRows bd = { scored: scored, bd: append blanks kept } where
  kept = filter (not <<< all isJust) bd
  blanks = replicate scored blankRow
  scored = 20 - length kept

canDescend :: GameState -> Boolean
canDescend gs = all (validPos gs.board) $ cells (gs.current { position = plus gs.current.position (pos 0 1)})

descend :: GameState -> GameState
descend gs = gs { current = gs.current { position = plus gs.current.position (pos 0 1) } }

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

-- notes for not-yet-implemented

-- stepTime :: GS -> IO GS
-- stepTime gs = if canAdvance gs
--               then return (dropPiece gs)
--               else nextPiece gs <$> genPiece
  

-- dropPiece :: Board -> Piece -> Piece
-- dropPiece b p = if canAdvance b p
--                      then dropPiece b (p & position.y +~ 1)
--                   else pc

