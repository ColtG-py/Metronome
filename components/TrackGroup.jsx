import { Button } from "@/components/ui/button";

export default function TrackGroup({ trackNames, imagePrefix, buffers, activeIndex, toggleTrack }) {
  return (
    <div className="flex flex-row items-center space-x-4 space-y-4">
      {trackNames.map((_, index) => (
        <Button
          variant="ghost"
          key={index}
          className={`${activeIndex === index ? 'ring-2 ' : ''}`}
          onClick={() => toggleTrack(index)}
        >
          <img src={`${imagePrefix}${index}.png`} alt={`track${index}`} className="h-12 w-12 object-contain" />
        </Button>
      ))}
    </div>
  );
}
