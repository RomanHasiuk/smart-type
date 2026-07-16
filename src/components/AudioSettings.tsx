import { Activity } from "lucide-react";
import { ComboBox } from "./ComboBox";

const getCleanLabel = (d: MediaDeviceInfo) => {
  return d.label
    ? d.label
        .replace(/^Default - /i, "")
        .replace(/^Communications - /i, "")
        .replace(/Microphone Array/i, "Microphone")
        .trim()
    : `Microphone ${d.deviceId.substring(0, 5)}...`;
};

interface AudioSettingsProps {
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  isCapturing: boolean;
  volume: number;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export function AudioSettings({
  devices,
  selectedDeviceId,
  setSelectedDeviceId,
  isCapturing,
  volume,
  isMonitoring,
  startMonitoring,
  stopMonitoring,
}: AudioSettingsProps) {
  const micOptions = devices.map(getCleanLabel);
  const currentMicLabel = devices.find((d) => d.deviceId === selectedDeviceId)
    ? getCleanLabel(devices.find((d) => d.deviceId === selectedDeviceId)!)
    : "";

  return (
    <div className="mic-settings">
      <div className="mic-controls">
        {devices.length > 1 && (
          <ComboBox
            className="mic-combobox"
            value={currentMicLabel}
            onChange={(val) => {
              const selectedDev = devices.find((d) => getCleanLabel(d) === val);
              if (selectedDev) {
                setSelectedDeviceId(selectedDev.deviceId);
              }
            }}
            options={micOptions}
            placeholder="Select Microphone"
            disabled={isCapturing}
          />
        )}
        <div
          className="tooltip-container tooltip-right-align"
          data-tooltip={isMonitoring ? "Stop test" : "Test microphone"}
        >
          <button
            type="button"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`test-mic-button ${isMonitoring ? "active" : ""}`}
          >
            <Activity size={20} />
          </button>
        </div>
      </div>
      <div className="volume-meter-container">
        <div
          className="volume-meter-bar"
          style={{ width: `${Math.min(volume, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
