module Tetris.Render where

import Tetris.Types

import Graphics.Canvas
import Control.Monad.Eff
import Data.Maybe
import Data.Foldable

renderGame :: forall eff. Context2D -> GameState -> Eff (canvas :: Canvas | eff) Unit
renderGame ctx gs = renderBoard ctx (gs.board)

renderBoard :: forall eff.  Context2D -> Board -> Eff (canvas :: Canvas | eff) Unit
renderBoard ctx bd = withContext ctx $ traverse_ (renderRow ctx) bd

renderRow :: forall eff. Context2D -> [Cell] -> Eff (canvas :: Canvas | eff) Context2D
renderRow ctx row = do
  traverse_ (renderCell ctx) row
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
color (Just O) = "red3"
color (Just L) = "darkgoldenrod"
color (Just Γ) = "aquamarine"
color (Just T) = "deeppink4"
color (Just I) = "forestgreen"
color (Just S) = "royalblue4"
color (Just Z) = "blueviolet"
