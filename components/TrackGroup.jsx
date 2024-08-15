import { Button } from "@/components/ui/button";

export default function TrackGroup({ trackNames, imagePrefix, buffers, activeIndex, toggleTrack }) {
  return (
    <div className="flex flex-row items-center">
      {trackNames.map((_, index) => (
        <Button
          variant="ghost"
          key={index}
          className={`${activeIndex === index ? 'ring-2 ' : ''}`}
          onClick={() => toggleTrack(index)}
        >
          <img src={`${imagePrefix}${index}.png`} alt={`track${index}`} className="h-10 w-10 object-contain" />
        </Button>
      ))}
    </div>
  );
}
