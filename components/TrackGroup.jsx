import { Button } from "@/components/ui/button";

export default function TrackGroup({ trackNames, imagePrefix, buffers, activeIndex, toggleTrack, rowIndex }) {
  return (
    <div className="flex flex-row items-center space-x-6">
      <p className="text-white">t {rowIndex}</p> {/* Display the global row index */}
      {trackNames.map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <Button
            variant="ghost"
            className={`${activeIndex === index ? 'ring-2' : ''} p-0`}
            onClick={() => toggleTrack(index)}
          >
            <img src={`${imagePrefix}${index}.png`} alt={`track${index}`} className="h-12 w-12 object-contain" />
          </Button>
        </div>
      ))}
    </div>
  );
}
