-- | bindings to https://github.com/madrobby/keymaster

module Keymaster where

import Control.Monad.Eff
import DOM (DOM(..))

foreign import bindKey """
  function bindKey(keys) {
    return function(fn) {
      return function() {
       key(keys, fn);
      };
    };
}
""" :: forall e a. String -> Eff e a -> Eff e Unit

foreign import onKeyUp """
  function onKeyUp(key) {
    return function(fn) {
      return function() {
        window.addEventListener("keyup", function(e) {
          if (e.key == key) {
            fn();
        }});
      };
    };
  };
""" :: forall e a. String -> Eff (dom :: DOM | e) a -> Eff (dom :: DOM | e) Unit

foreign import addEventListener
  "function addEventListener(name) {\
  \  return function(handler) {\
  \      return function() {\
  \        window.addEventListener(name, function(e) {\
  \          handler();\
  \          e.preventDefault();\
  \        });\
  \    };\
  \  };\
  \}" :: forall eff. String -> Eff (dom :: DOM | eff) Unit -> Eff (dom :: DOM | eff) Unit 
