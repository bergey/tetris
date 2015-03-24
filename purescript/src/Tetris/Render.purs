module Tetris.Render where

import Tetris.Types
import Tetris.Logic

import Graphics.Canvas
import Control.Monad.Eff
import Data.Maybe
import Data.Foldable 

scoreArea :: Rectangle
-- scoreArea =
--   { translateX: 10*screen.cellSize
--   , translateY: screen.lineSpacing
--   }

scoreArea =
  { x: 10 * screen.cellSize
  , y: 0
  , w: 100
  , h: 100
  }

renderGame :: forall eff. Context2D -> GameState -> Eff (canvas :: Canvas | eff) Unit
renderGame ctx gs = do
  renderScore ctx gs
  renderBoard ctx (gs.board)
  renderPiece ctx gs.current

renderPiece :: forall eff. Context2D -> Piece -> Eff (canvas :: Canvas | eff) Unit
renderPiece ctx pc = traverse_ (renderShape ctx pc.shape) $ cells pc

renderShape :: forall eff. Context2D -> Shape -> Pos -> Eff (canvas :: Canvas | eff) Context2D
renderShape ctx sh p = do
  setFillStyle (color (Just sh)) ctx
  let s = screen.cellSize
  fillPath ctx $ rect ctx { x: s*p.x, y: s*p.y, w: s, h: s }

renderBoard :: forall eff.  Context2D -> Board -> Eff (canvas :: Canvas | eff) Unit
renderBoard ctx bd = withContext ctx $ traverse_ (renderRow ctx) bd

renderRow :: forall eff. Context2D -> [Cell] -> Eff (canvas :: Canvas | eff) Context2D
renderRow ctx row = do
  withContext ctx $ traverse_ (renderCell ctx) row
  translate { translateX: 0, translateY: screen.cellSize } ctx

renderCell :: forall eff. Context2D -> Cell -> Eff (canvas :: Canvas | eff) Context2D
renderCell ctx c= do
  setFillStyle (color c) ctx
  fillPath ctx $ rect ctx
    { x: 0
    , y: 0
    , w: screen.cellSize
    , h: screen.cellSize
    }
  translate { translateX: screen.cellSize, translateY: 0 } ctx

color :: Cell -> String
color Nothing = "gray"
color (Just O) = "red"
color (Just L) = "darkgoldenrod"
color (Just G) = "aquamarine"
color (Just T) = "deeppink"
color (Just I) = "forestgreen"
color (Just S) = "royalblue"
color (Just Z) = "blueviolet"

renderScore :: forall eff. Context2D -> GameState -> Eff (canvas :: Canvas | eff) Context2D
renderScore ctx gs = withContext ctx $ do
  setFillStyle "black" ctx
  setFont "10px sans-serif" ctx
  clearRect ctx scoreArea
  translate { translateX: scoreArea.x, translateY: scoreArea.y + screen.lineSpacing }ctx
  fillText ctx ("rows: " ++ show gs.rowsFinished) screen.gutter 0
  translate { translateX: 0, translateY: screen.lineSpacing } ctx
  fillText ctx ("pieces: " ++ show gs.piecesUsed) screen.gutter 0
