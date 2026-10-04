import { useCallback, useEffect, useReducer } from 'react';

interface State {
  index: number;
  playing: boolean;
}

type Action =
  | { type: 'tick'; total: number; loop: boolean }
  | { type: 'play'; total: number }
  | { type: 'pause' }
  | { type: 'goTo'; index: number }
  | { type: 'step'; delta: number; total: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'tick': {
      if (state.index < action.total - 1) return { ...state, index: state.index + 1 };
      return action.loop ? { ...state, index: 0 } : { ...state, playing: false };
    }
    case 'play':
      // Restart from the beginning when play is pressed at the end.
      return { playing: true, index: state.index >= action.total - 1 ? 0 : state.index };
    case 'pause':
      return { ...state, playing: false };
    case 'goTo':
      return { playing: false, index: action.index };
    case 'step':
      return {
        playing: false,
        index: Math.max(0, Math.min(action.total - 1, state.index + action.delta)),
      };
  }
}

/**
 * Drives a step-by-step animation over `total` positions (e.g. every place a kernel can sit).
 * `stepsPerSecond` controls autoplay speed.
 */
export function useStepper(total: number, stepsPerSecond: number, { loop = false } = {}) {
  const [state, dispatch] = useReducer(reducer, { index: 0, playing: false });
  const last = Math.max(0, total - 1);
  const index = Math.min(state.index, last);

  useEffect(() => {
    if (!state.playing || total <= 0) return;
    const id = window.setInterval(
      () => dispatch({ type: 'tick', total, loop }),
      1000 / stepsPerSecond,
    );
    return () => window.clearInterval(id);
  }, [state.playing, stepsPerSecond, total, loop]);

  const play = useCallback(() => dispatch({ type: 'play', total }), [total]);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const goTo = useCallback((i: number) => dispatch({ type: 'goTo', index: i }), []);
  const step = useCallback((delta = 1) => dispatch({ type: 'step', delta, total }), [total]);

  return {
    index,
    playing: state.playing,
    atEnd: index >= last,
    play,
    pause,
    toggle: state.playing ? pause : play,
    step,
    goTo,
    reset: useCallback(() => dispatch({ type: 'goTo', index: 0 }), []),
    finish: useCallback(() => dispatch({ type: 'goTo', index: last }), [last]),
  };
}
