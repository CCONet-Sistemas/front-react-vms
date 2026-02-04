import { useState } from 'react';
import { MJPEGPlayer, VideoPlayer } from '~/features/live-view/components';

// Public MJPEG test cameras
const TEST_CAMERAS = [
  {
    name: 'Camera Pública (Alemanha)',
    url: 'http://212.67.231.233/mjpg/video.mjpg',
  },
];

export default function TestMjpegPage() {
  const [customUrl, setCustomUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState(TEST_CAMERAS[0].url);
  const [playerType, setPlayerType] = useState<'mjpeg' | 'video'>('mjpeg');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Teste de Players MJPEG/JPEG</h1>
        <p className="text-muted-foreground">
          Teste os novos players de stream com câmeras públicas ou URLs customizadas.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Câmeras de teste:</label>
          <div className="flex gap-2">
            {TEST_CAMERAS.map((cam) => (
              <button
                key={cam.url}
                onClick={() => setActiveUrl(cam.url)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  activeUrl === cam.url
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {cam.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 flex-1 min-w-[300px]">
          <label className="text-sm font-medium">URL customizada:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://example.com/mjpeg"
              className="flex-1 px-3 py-1.5 text-sm border rounded bg-background"
            />
            <button
              onClick={() => customUrl && setActiveUrl(customUrl)}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Testar
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Player:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerType('mjpeg')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                playerType === 'mjpeg'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              MJPEGPlayer
            </button>
            <button
              onClick={() => setPlayerType('video')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                playerType === 'video'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              VideoPlayer
            </button>
          </div>
        </div>
      </div>

      {/* Active URL display */}
      <div className="p-3 bg-muted rounded text-sm font-mono break-all">
        <span className="text-muted-foreground">URL ativa: </span>
        {activeUrl}
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main player */}
        <div className="space-y-2">
          <h3 className="font-medium">
            {playerType === 'mjpeg' ? 'MJPEGPlayer' : 'VideoPlayer'} (Principal)
          </h3>
          <div className="aspect-video bg-black rounded overflow-hidden border">
            {playerType === 'mjpeg' ? (
              <MJPEGPlayer
                src={activeUrl}
                autoPlay
                className="w-full h-full"
                onPlaying={() => console.log('MJPEG: Playing')}
                onError={(e) => console.error('MJPEG Error:', e)}
              />
            ) : (
              <VideoPlayer
                src={activeUrl}
                autoPlay
                muted
                className="w-full h-full"
                preferredType="mjpeg"
                enableFallback={true}
                onPlaying={() => console.log('Video: Playing')}
                onError={(e) => console.error('Video Error:', e)}
              />
            )}
          </div>
        </div>

        {/* Grid simulation */}
        <div className="space-y-2">
          <h3 className="font-medium">Simulação de Grid 2x2</h3>
          <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-black rounded overflow-hidden">
                <MJPEGPlayer
                  src={activeUrl}
                  autoPlay
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-muted/50 rounded space-y-2 text-sm">
        <h4 className="font-medium">Informações:</h4>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong>MJPEGPlayer</strong>: Para URLs externas usa tag <code>&lt;img&gt;</code> nativa
            (sem CORS). Para URLs internas usa fetch + ReadableStream com autenticação.
          </li>
          <li>
            <strong>VideoPlayer</strong>: Detecta automaticamente o tipo de stream pela URL e usa o
            player apropriado (HLS, MJPEG ou JPEG).
          </li>
          <li>
            <strong>Fallback</strong>: Se MJPEG falhar, tenta JPEG automaticamente.
          </li>
          <li>
            Abra o console do navegador (F12) para ver logs de eventos.
          </li>
        </ul>
      </div>
    </div>
  );
}
