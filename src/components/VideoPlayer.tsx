'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PlayButtons } from './PlayButtons';
import { usePlayers } from './VideoProvider';

type Props = {
  src: string;
  srcMobile?: string;
  poster?: string;
  alt: string;
  hasAudio?: boolean;
  captions?: string;
  captionsLabel: string;
  labels: { play: string; pause: string };
  preload: 'auto' | 'none';   // 소개 영상 외에는 'none'
  priority?: boolean;         // 첫 화면에 보이는 포스터
  children?: ReactNode;       // 포스터 이미지가 없을 때 대신 보이는 브랜드 포스터 카드
};

export function VideoPlayer({
  src, srcMobile, poster, alt, hasAudio = false, captions, captionsLabel, labels, preload, priority = false, children,
}: Props) {
  const players = usePlayers();
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const ctrlRef = useRef<HTMLButtonElement>(null);
  const attachRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);   // play()를 불렀다(불러오는 중 포함). 버튼 이름과 누를 때 동작이 이 값을 따른다
  const [started, setStarted] = useState(false);   // 첫 프레임이 나왔다. 이때 포스터를 걷는다

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onPlaying = () => setStarted(true);
    const onEmptied = () => setPlaying(!video.paused);   // 주소를 바꾸면 브라우저가 pause 이벤트 없이 멈춘다
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('emptied', onEmptied);

    // 모바일 컷은 화면 폭으로 고른다. video의 source media는 브라우저마다 달라 쓰지 않는다.
    // 폰을 돌리거나 창 폭을 바꿔 767px를 넘나들면 컷을 바꾼다
    const narrow = srcMobile ? matchMedia('(max-width: 767px)') : null;
    const pick = () => (narrow?.matches && srcMobile ? srcMobile : src);
    let url = pick();
    let unregister: (() => void) | null = null;
    const attach = () => {
      if (unregister) return;
      video.muted = true;
      video.src = url;
      unregister = players.register({ video, hasAudio });
    };
    attachRef.current = attach;
    const onWidth = () => {
      const next = pick();
      if (next === url) return;
      url = next;
      if (!unregister) return;   // 아직 붙이기 전이면 붙일 때 새 컷을 쓴다
      setStarted(false);         // 새 컷의 첫 프레임이 나올 때까지 포스터를 다시 보인다
      players.swap(video, next);
    };
    narrow?.addEventListener('change', onWidth);

    // 포스터를 기다리는 동안 눌린 사운드 버디의 허락도 받도록 소리 영상을 미리 알린다
    const unannounce = hasAudio ? players.announce(video) : null;

    // 포스터를 먼저 받고, 영상 주소는 포스터가 그려진 뒤에 붙인다(PLAN '소개 영상 로딩')
    const img = posterRef.current;
    if (img && !img.complete) {
      img.addEventListener('load', attach, { once: true });
      img.addEventListener('error', attach, { once: true });
    } else {
      attach();
    }

    return () => {
      img?.removeEventListener('load', attach);
      img?.removeEventListener('error', attach);
      narrow?.removeEventListener('change', onWidth);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('emptied', onEmptied);
      unannounce?.();
      unregister?.();
      attachRef.current = () => {};
      video.removeAttribute('src');
      video.load();
    };
  }, [src, srcMobile, hasAudio, players]);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    attachRef.current();
    players.userPlay(video);
  };

  const toggle = () => {
    const video = videoRef.current;
    if (video && !video.paused) players.userPause(video);
    else play();
  };

  // 큰 재생 버튼은 재생되면 사라지므로 포커스를 작은 버튼으로 옮긴다. 작은 버튼이 프레임 위쪽이라 화면은 움직이지 않게 한다
  const playFromPoster = () => {
    play();
    ctrlRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player-video"
        muted
        loop
        playsInline
        preload={preload}
        aria-label={alt}
        aria-hidden={!started || undefined}
      >
        {captions ? <track kind="captions" src={captions} srcLang="ko" label={captionsLabel} /> : null}
      </video>
      {/* 어떤 경우에도 영상 자리에는 포스터가 먼저 보인다. 재생이 시작되면 사라진다 */}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- 영상 포스터는 영상과 같은 원본 크기를 그대로 쓴다
        <img
          ref={posterRef}
          className="player-cover"
          src={poster}
          alt={alt}
          aria-hidden={started || undefined}
          data-hide={started || undefined}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
        />
      ) : (
        <div className="player-cover" aria-hidden={started || undefined} data-hide={started || undefined}>{children}</div>
      )}
      <PlayButtons playing={playing} labels={labels} onPlay={playFromPoster} onToggle={toggle} ctrlRef={ctrlRef} />
    </div>
  );
}
