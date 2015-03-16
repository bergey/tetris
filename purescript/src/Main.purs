module Main where

import Tetris.Error
import Tetris.Render
import Tetris.Logic
import Tetris.Types

import Graphics.Canvas

import Data.Maybe
import Control.Bind
import Control.Monad.Eff
import Control.Monad.Eff.Ref
import Control.Timer
import Control.RAF

main = do
  canvas <- noCanvasDie "game"
  ctx <- getContext2D canvas
  gsRef <- newRef =<< initialGameState <$> randomShape <*> randomShape
  renderLoop ctx gsRef
  timeout 250 $ stepLoop gsRef 250

renderLoop :: forall eff. Context2D -> RefVal GameState -> Eff ( ref :: Ref, raf :: RAF , canvas :: Canvas| eff ) Unit
renderLoop ctx gsRef = do
  gs <- readRef gsRef
  renderGame ctx gs
  requestAnimationFrame $ renderLoop ctx gsRef

stepLoop gsRef ms = do
  oldGS <- readRef gsRef
  newGS <- stepGame oldGS
  writeRef gsRef newGS
  timeout ms $ stepLoop gsRef ms
  
noCanvasDie name = do
  mayCanvas <- getCanvasElementById name
  case mayCanvas of
    Nothing ->  error "Could not find canvas element in DOM."
    Just c -> return c

