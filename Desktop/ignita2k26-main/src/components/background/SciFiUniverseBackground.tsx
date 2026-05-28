import SciFiScene3D, { type SciFiVariant } from "./SciFiScene3D";
import SciFiParticleNetwork from "./SciFiParticleNetwork";

type Props = {
  variant?: SciFiVariant;
};

/** Full-site sci-fi background: 3D universe + dual-tone particle network + atmosphere */
const SciFiUniverseBackground = ({ variant = "default" }: Props) => (
  <div className="scifi-universe-bg" aria-hidden>
    <div className="scifi-universe-void" />
    <SciFiScene3D variant={variant} />
    <SciFiParticleNetwork />
    <div className="scifi-universe-vignette" />
    <div className="scifi-universe-horizon" />
    <div className="scifi-universe-scan" />
  </div>
);

export default SciFiUniverseBackground;
