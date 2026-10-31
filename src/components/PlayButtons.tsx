import type { Ref } from 'react';
import { Pause, Play } from './Icons';

type Props = {
  playing: boolean;
  labels: { play: string; pause: string };
  onPlay: () => void;
  onToggle: () => void;
  ctrlRef?: Ref<HTMLButtonElement>;
};

// 작은 재생·정지 버튼은 프레임 위쪽 모서리에 늘 보인다(WCAG 2.2.2). 키보드와 스크린리더는 이 버튼을 쓴다.
// 큰 재생 버튼은 멈춰 있을 때만 보이는 터치·마우스용이라 같은 이름의 버튼이 두 번 읽히지 않게 숨긴다
export function PlayButtons({ playing, labels, onPlay, onToggle, ctrlRef }: Props) {
  return (
    <>
      <button type="button" className="play-big" tabIndex={-1} aria-hidden="true" onClick={onPlay} data-off={playing || undefined}>
        <Play />
      </button>
      <button ref={ctrlRef} type="button" className="play-ctrl" aria-label={playing ? labels.pause : labels.play} onClick={onToggle}>
        {playing ? <Pause /> : <Play />}
      </button>
    </>
  );
}
