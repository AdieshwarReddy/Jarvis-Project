import os
import re
import subprocess
import shutil
import ctypes
import webbrowser
from typing import Dict, Any
from app.core.logging import logger

KNOWN_APPS = {
    # Code & Development
    "vs code": ["code", "vscode://", r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"],
    "vscode": ["code", "vscode://", r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"],
    "visual studio code": ["code", "vscode://"],
    "terminal": ["wt.exe", "powershell.exe"],
    "powershell": ["powershell.exe"],
    "cmd": ["cmd.exe"],
    "command prompt": ["cmd.exe"],

    # Communication & Social
    "whatsapp": ["whatsapp:", "start whatsapp:", r"%LOCALAPPDATA%\WhatsApp\WhatsApp.exe"],
    "telegram": ["telegram:", r"%APPDATA%\Telegram Desktop\Telegram.exe"],
    "discord": ["discord:", r"%LOCALAPPDATA%\Discord\Update.exe --processStart Discord.exe"],

    # Browsers
    "chrome": ["chrome", "google-chrome", r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"],
    "google chrome": ["chrome", "google-chrome"],
    "edge": ["msedge", "microsoft-edge:"],
    "microsoft edge": ["msedge", "microsoft-edge:"],
    "browser": ["chrome", "msedge"],

    # Productivity & Utilities
    "notepad": ["notepad.exe"],
    "calculator": ["calc.exe"],
    "calc": ["calc.exe"],
    "task manager": ["taskmgr.exe"],
    "settings": ["ms-settings:"],
    "control panel": ["control.exe"],
    "word": ["winword.exe"],
    "excel": ["excel.exe"],
    "powerpoint": ["powerpnt.exe"],

    # Media & Entertainment
    "spotify": ["spotify:", "spotify.exe", r"%APPDATA%\Spotify\Spotify.exe"],
    "vlc": ["vlc.exe", r"C:\Program Files\VideoLAN\VLC\vlc.exe"],

    # Folders & Explorer
    "explorer": ["explorer.exe"],
    "files": ["explorer.exe"],
    "file explorer": ["explorer.exe"],
    "downloads": ["explorer.exe shell:Downloads"],
    "documents": ["explorer.exe shell:Personal"],
    "pictures": ["explorer.exe shell:My Pictures"],
    "desktop": ["explorer.exe shell:Desktop"],
    "videos": ["explorer.exe shell:My Video"],
    "music": ["explorer.exe shell:My Music"],

    # Websites & Cloud Services
    "youtube": ["https://youtube.com"],
    "github": ["https://github.com"],
    "google": ["https://google.com"],
    "gmail": ["https://mail.google.com"],
    "linkedin": ["https://linkedin.com"],
    "twitter": ["https://x.com"],
    "x": ["https://x.com"],
    "netflix": ["https://netflix.com"],
}

def execute_open_app(app_name: str) -> Dict[str, Any]:
    """
    Launch a local application or website on Windows.
    Supports known aliases, protocol URIs, websites, and executables.
    """
    name_clean = re.sub(r'^[^\w]+|[^\w]+$', '', app_name).strip().lower()
    
    # Strip conversational prefixes
    for prefix in [
        "hey jarvis ", "jarvis ", "please ", "can you open ", "could you open ",
        "open up ", "open ", "launch ", "start ", "run ", "bring up ", "go to "
    ]:
        if name_clean.startswith(prefix):
            name_clean = name_clean[len(prefix):].strip(" .?!,;:'\"")

    # Strip conversational suffixes
    for suffix in [" app", " application", " website", " page", " please", " for me"]:
        if name_clean.endswith(suffix):
            name_clean = name_clean[:-len(suffix)].strip(" .?!,;:'\"")

    name_clean = name_clean.strip(" .?!,;:'\"")

    # Check for direct system action requests
    if any(k in name_clean for k in ["lock", "lock computer", "lock screen", "lock pc"]):
        try:
            ctypes.windll.user32.LockWorkStation()
            return {"status": "success", "app_name": "Lock Screen", "message": "Locking your workstation now, boss."}
        except Exception as e:
            return {"status": "error", "message": f"Could not lock screen: {e}"}

    if any(k in name_clean for k in ["mute", "unmute"]):
        try:
            ctypes.windll.user32.keybd_event(0xAD, 0, 0, 0)
            ctypes.windll.user32.keybd_event(0xAD, 0, 2, 0)
            return {"status": "success", "app_name": "Volume Mute", "message": "Toggled audio mute, boss."}
        except Exception as e:
            return {"status": "error", "message": f"Could not toggle mute: {e}"}

    if "volume up" in name_clean or "increase volume" in name_clean:
        try:
            for _ in range(5):
                ctypes.windll.user32.keybd_event(0xAF, 0, 0, 0)
                ctypes.windll.user32.keybd_event(0xAF, 0, 2, 0)
            return {"status": "success", "app_name": "Volume Up", "message": "Volume increased, boss."}
        except Exception as e:
            return {"status": "error", "message": f"Could not adjust volume: {e}"}

    if "volume down" in name_clean or "decrease volume" in name_clean:
        try:
            for _ in range(5):
                ctypes.windll.user32.keybd_event(0xAE, 0, 0, 0)
                ctypes.windll.user32.keybd_event(0xAE, 0, 2, 0)
            return {"status": "success", "app_name": "Volume Down", "message": "Volume decreased, boss."}
        except Exception as e:
            return {"status": "error", "message": f"Could not adjust volume: {e}"}

    targets = KNOWN_APPS.get(name_clean, [name_clean])
    launched = False
    last_err = ""

    for target in targets:
        # Check if URL
        if target.startswith("http://") or target.startswith("https://"):
            try:
                webbrowser.open(target)
                launched = True
                break
            except Exception as e:
                logger.warning(f"webbrowser open failed: {e}")
                subprocess.Popen(f'start "" "{target}"', shell=True)
                launched = True
                break

        expanded = os.path.expandvars(target)
        try:
            if expanded.endswith(":") or "://" in expanded:
                # Windows protocol scheme (e.g. whatsapp:, vscode://, spotify:)
                subprocess.Popen(f'start {expanded}', shell=True)
                launched = True
                break
            elif "explorer.exe shell:" in expanded:
                subprocess.Popen(expanded, shell=True)
                launched = True
                break
            elif os.path.exists(expanded):
                subprocess.Popen([expanded], shell=True)
                launched = True
                break
            elif shutil.which(expanded.split()[0]):
                subprocess.Popen(expanded, shell=True)
                launched = True
                break
            else:
                ret = subprocess.run(f'start "" "{expanded}"', shell=True, capture_output=True)
                if ret.returncode == 0:
                    launched = True
                    break
        except Exception as e:
            last_err = str(e)
            logger.warning(f"Error launching {target}: {e}")
            continue

    if not launched:
        try:
            subprocess.Popen(f'start {name_clean}', shell=True)
            launched = True
        except Exception as e:
            last_err = str(e)

    if launched:
        return {
            "status": "success",
            "app_name": app_name,
            "message": f"Opening {app_name} now, boss."
        }
    else:
        return {
            "status": "error",
            "app_name": app_name,
            "message": f"I couldn't open {app_name}. {last_err}"
        }

def get_system_telemetry() -> Dict[str, Any]:
    """Retrieve live CPU, Memory, Disk, and Battery diagnostics on Windows."""
    try:
        import psutil
        cpu = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("C:")
        battery = psutil.sensors_battery()
        
        return {
            "status": "success",
            "cpu_percent": round(cpu, 1),
            "ram_percent": round(mem.percent, 1),
            "ram_used_gb": round(mem.used / (1024**3), 1),
            "ram_total_gb": round(mem.total / (1024**3), 1),
            "disk_free_gb": round(disk.free / (1024**3), 1),
            "disk_total_gb": round(disk.total / (1024**3), 1),
            "battery_percent": round(battery.percent) if battery else 100,
            "battery_plugged": battery.power_plugged if battery else True,
            "message": f"All systems operational, boss. CPU is at {round(cpu, 1)}%, Memory at {round(mem.percent, 1)}%, and {round(disk.free / (1024**3), 1)} GB storage free."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Diagnostic retrieval failed: {e}",
            "cpu_percent": 12.0,
            "ram_percent": 65.0,
            "ram_used_gb": 8.0,
            "ram_total_gb": 16.0,
            "disk_free_gb": 240,
            "disk_total_gb": 512,
            "battery_percent": 100,
            "battery_plugged": True
        }
