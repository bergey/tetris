module Tetris.Error where

import Debug.Trace

foreign import undefined :: forall a. a

foreign import error
  "function error(s) {\
  \  console.log(s);\
  \}" :: forall a. String -> a
