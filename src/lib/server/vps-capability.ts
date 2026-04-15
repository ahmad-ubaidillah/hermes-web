import { execFile } from 'child_process';
import { promisify } from 'util';
import { getMemInfo, getCPUCount } from '$lib/server/system-info';

const execFileAsync = promisify(execFile);

export interface VPSCapability {
  canRunOllama: boolean;
  canRunvLLM: boolean;
  canRunDocker: boolean;
  ramGB: number;
  cpuCores: number;
  gpuAvailable: boolean;
  recommendations: string[];
}

export async function checkVPSCapability(): Promise<VPSCapability> {
  const result: VPSCapability = {
    canRunOllama: false,
    canRunvLLM: false,
    canRunDocker: false,
    ramGB: 0,
    cpuCores: 0,
    gpuAvailable: false,
    recommendations: []
  };

  try {
    const memInfo = await getMemInfo();
    result.ramGB = Math.round(memInfo.totalKB / 1024 / 1024);
    result.cpuCores = await getCPUCount();

    try {
      await execFileAsync('nvidia-smi', []);
      result.gpuAvailable = true;
    } catch {
      result.gpuAvailable = false;
    }

    if (result.ramGB >= 8 && result.cpuCores >= 4) {
      result.canRunOllama = true;
    } else if (result.ramGB >= 4) {
      result.canRunOllama = true;
      result.recommendations.push('Ollama akan berjalan lambat dengan RAM < 8GB. Gunakan model kecil (qwen2.5:7b atau llama3.2:3b)');
    } else {
      result.canRunOllama = false;
      result.recommendations.push('RAM tidak mencukupi untuk Ollama. Upgrade VPS minimal 4GB RAM');
    }

    if (result.ramGB >= 16 && result.gpuAvailable) {
      result.canRunvLLM = true;
    } else if (result.ramGB >= 16) {
      result.canRunvLLM = true;
      result.recommendations.push('vLLM lebih baik dengan GPU. Tanpa GPU, performance terbatas');
    }

    try {
      await execFileAsync('docker', ['--version']);
      result.canRunDocker = true;
    } catch {
      result.canRunDocker = false;
      result.recommendations.push('Docker tidak terinstall. Install docker untuk self-hosted modules');
    }

  } catch (error) {
    result.recommendations.push('Gagal mendeteksi spesifikasi VPS');
  }

  return result;
}

export async function checkOllamaRunning(): Promise<{ running: boolean; url: string; models: string[] }> {
  try {
    const { stdout } = await execFileAsync('curl', ['-s', 'http://localhost:11434/api/tags']);
    const data = JSON.parse(stdout);
    const models = data.models?.map((m: any) => m.name) || [];
    return { running: true, url: 'http://localhost:11434', models };
  } catch {
    return { running: false, url: 'http://localhost:11434', models: [] };
  }
}