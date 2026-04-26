'use client';

import { cn } from '@/lib/utils';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UnifiedVideoPlayerProps {
  /** 動画URL（HLS .m3u8 または MP4等） */
  src: string;
  /** サムネイル画像URL */
  poster?: string;
  /** 動画の長さ（秒） */
  duration?: number;
  /** 追加のクラス名 */
  className?: string;
  /** 再生開始時のコールバック */
  onPlay?: () => void;
  /** 一時停止時のコールバック */
  onPause?: () => void;
  /** 再生終了時のコールバック */
  onEnded?: () => void;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
}

// 秒数を mm:ss 形式に変換
function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/**
 * 動画プレイヤー
 */
export function VideoPlayer({
  src,
  poster,
  duration: initialDuration,
  className,
  onPlay,
  onPause,
  onEnded,
  onError,
}: UnifiedVideoPlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0); // 0-1の範囲
  const [loaded, setLoaded] = useState(0); // バッファー済み 0-1
  const [duration, setDuration] = useState(initialDuration || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seeking, setSeeking] = useState(false);

  // コンポーネントの状態とvideo要素を同期
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
      playerRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // コントロールの自動非表示
  const scheduleHide = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (playing) scheduleHide();
    else {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      setShowControls(true);
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [playing, scheduleHide]);

  // フルスクリーン変更を検知
  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeekForward();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeekBackward();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.paused) {
      player.play().catch(console.error);
    } else {
      player.pause();
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeekForward = () => {
    const player = playerRef.current;
    if (!player || !duration) return;
    player.currentTime = Math.min(duration, player.currentTime + 5);
  };

  const handleSeekBackward = () => {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime = Math.max(0, player.currentTime - 5);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setPlayed(newValue);
    setSeeking(true);
  };

  const handleSeekMouseUp = (
    e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>
  ) => {
    setSeeking(false);
    const player = playerRef.current;
    if (!player) return;
    const newValue = parseFloat((e.target as HTMLInputElement).value);
    player.currentTime = newValue * player.duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setMuted(val === 0);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleProgress = () => {
    const player = playerRef.current;
    if (!player || seeking || !player.buffered.length) return;

    const loadedSeconds = player.buffered.end(player.buffered.length - 1);
    const loadedFraction = player.duration
      ? loadedSeconds / player.duration
      : 0;
    setLoaded(loadedFraction);
  };

  const handleDurationChange = () => {
    const player = playerRef.current;
    if (!player) return;
    setDuration(player.duration);
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (!player || seeking || !player.duration) return;

    const playedFraction = player.currentTime / player.duration;
    setPlayed(playedFraction);
  };

  const handleNativePlay = () => {
    setPlaying(true);
    onPlay?.();
  };

  const handleNativePause = () => {
    setPlaying(false);
    onPause?.();
  };

  const handleEnded = () => {
    setPlaying(false);
    onEnded?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video player error:', e);
    onError?.(new Error('動画の再生中にエラーが発生しました'));
  };

  const progress = played * 100;
  const buffered = loaded * 100;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black rounded-lg overflow-hidden select-none',
        className
      )}
      style={{ aspectRatio: '16/9' }}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      onClick={(e) => {
        // コントロール以外のエリアをクリックで再生/停止
        if ((e.target as HTMLElement).closest('[data-controls]')) return;
        togglePlay();
      }}
    >
      {/* Native Video */}
      <video
        ref={playerRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onDurationChange={handleDurationChange}
        onPlay={handleNativePlay}
        onPause={handleNativePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* 大きな再生ボタン（停止中のみ表示） */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Play
              size={28}
              className="text-white translate-x-0.5"
              fill="white"
            />
          </div>
        </div>
      )}

      {/* コントロールバー */}
      <div
        data-controls
        className={cn(
          'absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10 px-3 pb-3 flex flex-col gap-2 transition-opacity duration-300 z-20',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* シークバー */}
        <div className="relative flex items-center h-5 group/seek">
          {/* バッファーバー */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/20 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-white/40 transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
          </div>
          {/* 進捗バー */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-red-600 pointer-events-none"
            style={{ width: `${progress}%`, left: 0 }}
          />
          {/* スライダー入力 */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={played}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            aria-label="シークバー"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={played * duration}
            aria-valuetext={`${formatTime(played * duration)} / ${formatTime(duration)}`}
            className="w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
          />
        </div>

        {/* ボタン列 */}
        <div className="flex items-center justify-between gap-2">
          {/* 左: 再生・音量・時間 */}
          <div className="flex items-center gap-2">
            {/* 再生/停止 */}
            <button
              onClick={togglePlay}
              aria-label={playing ? '一時停止' : '再生'}
              className="h-8 w-8 flex items-center justify-center text-white hover:text-white/80 transition-colors"
            >
              {playing ? (
                <Pause size={18} fill="white" />
              ) : (
                <Play size={18} fill="white" className="translate-x-px" />
              )}
            </button>

            {/* 音量 */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                aria-label={muted ? 'ミュート解除' : 'ミュート'}
                className="h-8 w-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="音量"
                  className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                />
              </div>
            </div>

            {/* 経過時間 */}
            <span className="text-xs text-white/90 tabular-nums leading-none ml-1 font-medium">
              {formatTime(played * duration)}
              <span className="text-white/50 mx-1">/</span>
              {formatTime(duration)}
            </span>
          </div>

          {/* 右: 設定・フルスクリーン */}
          <div className="flex items-center gap-1">
            {/* 再生速度設定 */}
            <div className="relative">
              <button
                onClick={() => setShowSettings((v) => !v)}
                aria-label="設定"
                aria-expanded={showSettings}
                className="h-8 w-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <Settings size={16} />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 min-w-[120px] shadow-xl">
                  <div className="px-3 py-2 text-xs text-white/50 font-medium border-b border-white/10">
                    再生速度
                  </div>
                  {PLAYBACK_RATES.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRateChange(r)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors',
                        playbackRate === r
                          ? 'text-white font-medium bg-white/5'
                          : 'text-white/70'
                      )}
                    >
                      {r === 1 ? '標準' : `${r}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* フルスクリーン */}
            <button
              onClick={toggleFullscreen}
              aria-label={fullscreen ? '通常画面に戻る' : '全画面表示'}
              className="h-8 w-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
