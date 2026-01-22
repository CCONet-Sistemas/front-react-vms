import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { FormSection } from "~/components/ui/form-section";
import { Camera, Wifi, Video, Radio, Eye, HardDrive, FileText } from "lucide-react";
import type { Camera as  CameraType } from "~/types";

export default function CameraForm({ camera }: { camera?: CameraType }) {

  return (
    <form className="space-y-6">
      {/* ===================== */}
      {/* DEVICE INFO */}
      {/* ===================== */}
      <FormSection title="Dispositivo">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Camera className="h-4 w-4" />
          <span className="text-xs font-medium">Informações do dispositivo</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-form-label">Nome do dispositivo</Label>
            <Input id="name" placeholder="ReoLinkWireless" defaultValue={camera?.name || ''}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-form-label">Modo</Label>
            <Input id="mode" placeholder="start" defaultValue={camera?.mode || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-form-label">Tipo</Label>
            <Input id="type" placeholder="h264" defaultValue={camera?.type || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol" className="text-form-label">Protocolo</Label>
            <Input id="protocol" placeholder="rtsp" defaultValue={camera?.protocol || ''} />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* CONNECTION */}
      {/* ===================== */}
      <FormSection title="Conexão">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Wifi className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de rede</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="host" className="text-form-label">Host</Label>
            <Input id="host" placeholder="192.168.1.40" defaultValue={camera?.connection?.host || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port" className="text-form-label">Porta</Label>
            <Input id="port" type="number" placeholder="554" defaultValue={camera?.connection?.port || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-form-label">Usuário</Label>
            <Input id="username" placeholder="admin" autoComplete="off" defaultValue={camera?.connection?.username || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-form-label">Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="off" defaultValue={camera?.connection?.password || ''} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="path" className="text-form-label">Path</Label>
            <Input id="path" placeholder="/" defaultValue={camera?.connection?.path || ''} />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* VIDEO */}
      {/* ===================== */}
      <FormSection title="Vídeo">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Video className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de vídeo</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="fps" className="text-form-label">FPS</Label>
            <Input id="fps" type="number" placeholder="30" defaultValue={camera?.video?.fps || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width" className="text-form-label">Largura</Label>
            <Input id="width" type="number" placeholder="1920" defaultValue={camera?.video?.width || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-form-label">Altura</Label>
            <Input id="height" type="number" placeholder="1080" defaultValue={camera?.video?.height || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codec" className="text-form-label">Codec</Label>
            <Input id="codec" placeholder="h264_cuvid" defaultValue={camera?.video?.codec || ''} />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* STREAM */}
      {/* ===================== */}
      <FormSection title="Stream">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Radio className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de transmissão</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="streamFps" className="text-form-label">FPS Stream</Label>
            <Input id="streamFps" type="number" placeholder="15" defaultValue={camera?.stream?.fps || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scaleX" className="text-form-label">Scale X</Label>
            <Input id="scaleX" type="number" placeholder="640" defaultValue={camera?.stream?.scale?.x || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scaleY" className="text-form-label">Scale Y</Label>
            <Input id="scaleY" type="number" placeholder="360" defaultValue={camera?.stream?.scale?.y || ''} />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Câmera
        </Button>
      </div>
    </form>
  );
}
