'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// 영상 재생과 소리 규칙을 한곳에서 정한다(PLAN '자동 재생 규칙', '소리와 사운드 버디').
// 영상은 화면에 35% 이상 보이면 무음으로 재생하고 15% 미만이면 멈춘다. 소리는 사운드 버디로만 켠다.

export type FallbackReason = 'reduced_motion' | 'save_data' | 'low_power' | 'rejected';
export type SoundState = 'off' | 'playing' | 'waiting';

export type PlayerHandle = { video: HTMLVideoElement; hasAudio: boolean };

type Entry = PlayerHandle & {
  ratio: number;         // 화면에 보이는 비율
  userPaused: boolean;   // 방문자가 멈춘 영상은 자동으로 다시 재생하지 않는다
  byUser: boolean;       // 지금 재생은 방문자가 시작했다(동작 줄이기에서도 탭에 돌아오면 잇는다)
  pausing: boolean;      // 이 컨트롤러가 부른 pause()
  resume: boolean;       // 탭이 숨겨질 때 재생 중이었다
  unmutedAt: number;     // 클릭 밖에서 컨트롤러가 소리를 켠 시각
  blocked?: FallbackReason;   // 자동 재생 대신 포스터와 큰 재생 버튼이 남은 이유
};

// 소리 있는 영상의 형편: 재생 중(audible), 화면에 있지만 멈춤(stopped), 화면 밖(away)
type Media = 'audible' | 'stopped' | 'away';

type Players = {
  announce: (video: HTMLVideoElement) => () => void;
  register: (handle: PlayerHandle) => () => void;
  userPlay: (video: HTMLVideoElement) => void;
  userPause: (video: HTMLVideoElement) => void;
  swap: (video: HTMLVideoElement, src: string) => void;
};

// stopped: 켜짐·대기 가운데 소리 영상이 화면에 있지만 멈춰 있어 재생을 눌러야 하는 경우
type Sound = { soundOn: boolean; state: SoundState; stopped: boolean; toggle: () => void };

const PLAY_AT = 0.35;
const PAUSE_BELOW = 0.15;
const MAX_PLAYING = 2;
const UNMUTE_PAUSE_MS = 1000;   // 소리를 켠 직후 브라우저가 영상을 멈춘 것으로 보는 시간(Safari)

const PlayersContext = createContext<Players | null>(null);
const SoundContext = createContext<Sound>({ soundOn: false, state: 'off', stopped: false, toggle: () => {} });

export function usePlayers() {
  const players = useContext(PlayersContext);
  if (!players) throw new Error('VideoProvider 안에서만 쓸 수 있다');
  return players;
}

export const useSound = () => useContext(SoundContext);

function saveData() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

// iPadOS는 데스크톱 Safari로 보이므로 터치 지점 수로 가린다
function isIOS() {
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

function createController(setSoundOn: (on: boolean) => void, setMedia: (media: Media) => void) {
  const entries = new Map<HTMLVideoElement, Entry>();
  const announced = new Set<HTMLVideoElement>();   // 포스터를 기다려 아직 등록되지 않은 소리 영상
  let sound = false;
  let io: IntersectionObserver | null = null;
  let reduce: MediaQueryList | null = null;

  const all = () => [...entries.values()];
  const mostVisible = (list: Entry[]) => list.reduce<Entry | undefined>((best, e) => (!best || e.ratio > best.ratio ? e : best), undefined);

  // 소리를 낼 영상은 hasAudio인 영상 가운데 재생 중이고 가장 많이 보이는 하나다
  const audible = () => mostVisible(all().filter((e) => e.hasAudio && !e.video.paused));

  // byUser는 클릭 처리 안이라는 뜻이다. 클릭 밖에서 재생 중인 영상의 소리를 켜면 Safari가 영상을 멈출 수 있어 시각을 적어 둔다.
  // 멈춘 영상은 대상이 아니다(재생이 거부되어 rejected로 간다). Chrome은 muted를 바꾸는 순간 멈추므로 재생 여부를 먼저 읽는다
  const mute = (e: Entry, muted: boolean, byUser = false) => {
    if (e.video.muted === muted) return;
    const wasPlaying = !e.video.paused;
    e.video.muted = muted;
    if (!muted && !byUser && wasPlaying) e.unmutedAt = performance.now();
  };

  const applyMute = (byUser = false) => {
    const loud = sound ? audible() : undefined;
    for (const e of entries.values()) mute(e, e !== loud, byUser);
    const stopped = all().some((e) => e.hasAudio && e.video.paused && e.ratio >= PAUSE_BELOW && (e.userPaused || e.blocked));
    setMedia(loud ? 'audible' : stopped ? 'stopped' : 'away');
  };

  const setSound = (on: boolean) => {
    sound = on;
    setSoundOn(on);
  };

  // 7단계에서 이곳에 video_fallback 이벤트(reason)를 붙인다
  const block = (e: Entry, reason: FallbackReason) => {
    e.blocked = reason;
    applyMute();
  };

  const systemPause = (e: Entry) => {
    if (e.video.paused) return;
    e.pausing = true;
    e.video.pause();
  };

  // withSound는 play()를 부를 때 소리가 켜져 있었는지다. 거부되는 사이에 다시 무음이 되어도 이 값으로 가린다
  const rejected = (e: Entry, err: unknown, withSound: boolean) => {
    const name = err instanceof DOMException ? err.name : '';
    if (name === 'AbortError') return;   // pause()나 주소 변경으로 끊긴 경우
    if (withSound) {
      // 소리를 켠 채 거부되면 무음으로 다시 재생하고 버디를 꺼짐으로 되돌린다
      setSound(false);
      mute(e, true);
      e.video.play().then(() => applyMute(), (again: unknown) => rejected(e, again, false));
      return;
    }
    systemPause(e);   // 불러오기에 실패해도 paused가 false로 남는 브라우저(Firefox)가 있다
    // iOS 저전력 모드는 무음 자동 재생도 막는다. 이유를 따로 알 수 없어 iOS의 NotAllowedError로 가린다
    block(e, name === 'NotAllowedError' && isIOS() ? 'low_power' : 'rejected');
  };

  const play = (e: Entry, byUser: boolean) => {
    if (!byUser) {
      const reason = e.blocked ?? (reduce?.matches ? 'reduced_motion' : saveData() ? 'save_data' : undefined);
      if (reason) return block(e, reason);
    }
    // 동시 재생은 2개까지다. 더 많이 보이는 영상을 남긴다
    const others = all().filter((x) => x !== e && !x.video.paused);
    if (others.length >= MAX_PLAYING) {
      const weakest = others.reduce((a, b) => (a.ratio <= b.ratio ? a : b));
      if (!byUser && weakest.ratio >= e.ratio) return;
      systemPause(weakest);
    }
    e.byUser = byUser;
    mute(e, !(sound && e.hasAudio && e === mostVisible(all().filter((x) => x.hasAudio))), byUser);
    const withSound = !e.video.muted;
    e.video.play().then(() => {
      e.blocked = undefined;
      applyMute();
    }, (err: unknown) => rejected(e, err, withSound));
  };

  const evaluate = (e: Entry) => {
    if (document.hidden) return;
    if (e.ratio >= PLAY_AT) {
      if (e.video.paused && !e.userPaused) play(e, false);
    } else if (e.ratio < PAUSE_BELOW) {
      systemPause(e);
    }
  };

  const onIntersect: IntersectionObserverCallback = (records) => {
    for (const record of records) {
      const e = entries.get(record.target as HTMLVideoElement);
      if (!e) continue;
      e.ratio = record.isIntersecting ? record.intersectionRatio : 0;
      evaluate(e);
    }
    applyMute();
  };

  // 탭이 숨겨지면 모두 멈추고, 돌아오면 화면 안에 있고 방문자가 멈추지 않은 영상만 잇는다.
  // 재생 중인 영상은 15% 미만이 될 때까지 계속 재생되므로 잇는 기준도 15%다
  const onVisibility = () => {
    for (const e of entries.values()) {
      if (document.hidden) {
        if (!e.video.paused) {
          e.resume = true;
          systemPause(e);
        }
      } else if (e.resume) {
        e.resume = false;
        if (!e.userPaused && e.ratio >= PAUSE_BELOW) play(e, e.byUser);
      }
    }
    applyMute();
  };

  const register = (handle: PlayerHandle) => {
    const e: Entry = { ...handle, ratio: 0, userPaused: false, byUser: false, pausing: false, resume: false, unmutedAt: -Infinity };
    const onPause = () => {
      if (e.pausing) {
        e.pausing = false;
      } else if (document.hidden) {
        e.resume = true;   // 탭이 숨겨지며 브라우저가 먼저 멈췄다. 돌아오면 잇는다
      } else if (!e.userPaused && !e.video.muted && performance.now() - e.unmutedAt < UNMUTE_PAUSE_MS) {
        // 클릭 밖에서 소리를 켜자 브라우저가 재생을 멈춘 경우(Safari). 무음으로 잇고 버디를 끈다
        setSound(false);
        mute(e, true);
        e.video.play().catch((err: unknown) => rejected(e, err, false));
      } else {
        // 미디어 키나 잠금 화면처럼 컨트롤러 밖에서 멈춘 것은 방문자가 멈춘 것으로 본다. 소리 설정은 그대로 둔다
        e.userPaused = true;
      }
      applyMute();
    };
    const onPlay = () => {
      e.userPaused = false;   // 컨트롤러는 방문자가 멈춘 영상을 재생하지 않는다. 미디어 키처럼 밖에서 다시 재생한 경우다
      applyMute();
    };
    handle.video.addEventListener('pause', onPause);
    handle.video.addEventListener('play', onPlay);
    announced.delete(handle.video);
    entries.set(handle.video, e);
    io?.observe(handle.video);
    return () => {
      io?.unobserve(handle.video);
      handle.video.removeEventListener('pause', onPause);
      handle.video.removeEventListener('play', onPlay);
      entries.delete(handle.video);
      applyMute();
    };
  };

  const players: Players = {
    announce: (video) => {
      announced.add(video);
      return () => announced.delete(video);
    },
    register,
    userPlay: (video) => {
      const e = entries.get(video);
      if (!e) return;
      e.userPaused = false;
      e.blocked = undefined;
      play(e, true);
    },
    userPause: (video) => {
      const e = entries.get(video);
      if (!e) return;
      e.userPaused = true;
      e.video.pause();
    },
    // 화면 폭이 767px를 넘나들면 모바일·데스크톱 컷을 바꾼다. 재생 중이었으면 같은 시점에서 잇는다
    swap: (video, src) => {
      const e = entries.get(video);
      if (!e) return;
      const wasPlaying = !video.paused;
      const at = video.currentTime;
      systemPause(e);
      video.src = src;
      e.pausing = false;   // 주소를 바꾸면 줄 서 있던 pause 이벤트가 사라진다
      if (at > 0) video.addEventListener('loadedmetadata', () => { video.currentTime = Math.min(at, video.duration || at); }, { once: true });
      if (wasPlaying) play(e, e.byUser);
    },
  };

  // 자식의 register가 먼저 실행되므로 이미 등록된 영상도 관찰한다
  const start = () => {
    reduce = matchMedia('(prefers-reduced-motion: reduce)');
    io = new IntersectionObserver(onIntersect, { threshold: [0, PAUSE_BELOW, PLAY_AT, 0.6, 1] });
    for (const video of entries.keys()) io.observe(video);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io?.disconnect();
      io = null;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  };

  // 버디의 클릭 처리 안에서 바로 muted를 바꾼다. 클릭이 브라우저가 요구하는 사용자 동작이다.
  // 멈춰 있는 소리 영상도 소리를 한 번 켰다 끈다. iOS는 이렇게 허락받은 영상만 나중에 클릭 없이 소리와 함께 재생한다
  const toggleSound = () => {
    setSound(!sound);
    if (sound) {
      const waiting = all().filter((e) => e.hasAudio && e.video.paused).map((e) => e.video);
      for (const video of [...waiting, ...announced]) {
        video.muted = false;
        video.muted = true;
      }
    }
    applyMute(true);
  };

  return { players, start, toggleSound };
}

export function VideoProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState(false);   // 저장하지 않는다. 방문마다 꺼짐으로 시작한다
  const [media, setMedia] = useState<Media>('away');
  const [controller] = useState(() => createController(setSoundOn, setMedia));

  useEffect(() => controller.start(), [controller]);

  const sound = useMemo<Sound>(() => ({
    soundOn,
    state: soundOn ? (media === 'audible' ? 'playing' : 'waiting') : 'off',
    stopped: media === 'stopped',
    toggle: controller.toggleSound,
  }), [soundOn, media, controller]);

  return (
    <PlayersContext value={controller.players}>
      <SoundContext value={sound}>{children}</SoundContext>
    </PlayersContext>
  );
}
