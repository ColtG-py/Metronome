import { Button } from "@/components/ui/button";

export default function TrackGroup({ trackNames, imagePrefix, buffers, activeIndex, toggleTrack }) {
  return (
    <div className="flex flex-row items-center space-x-2 space-y-8">
      {trackNames.map((_, index) => (
        <Button
          variant="ghost"
          key={index}
          className={`${activeIndex === index ? 'ring-2 ' : ''}`}
          onClick={() => toggleTrack(index)}
        >
          <img src={`${imagePrefix}${index}.png`} alt={`track${index}`} className="h-24 w-24 object-contain" />
        </Button>
      ))}
    </div>
  );
}
