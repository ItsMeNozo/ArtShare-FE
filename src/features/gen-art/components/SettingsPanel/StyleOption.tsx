import { MockModelOptionsData } from "../../data/Data";

interface StyleOptionProps {
  style: (typeof MockModelOptionsData)[0];
  isSelected: boolean;
  onClick: () => void;
}

const StyleOption: React.FC<StyleOptionProps> = ({
  style,
  isSelected,
  onClick,
}) => (
  <div
    className="group flex flex-col items-center space-y-2 w-full cursor-pointer"
    onClick={onClick}
  >
    <div className="relative rounded-lg w-full h-32 overflow-hidden">
      <img
        src={style.images[0]}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      {isSelected && (
        <div className="absolute inset-0 flex justify-center items-end bg-gradient-to-b from-black/10 to-black/70 p-2">
          <p className="font-thin text-white text-xs">Selected ✅</p>
        </div>
      )}
    </div>
    <p className="text-center">{style.name}</p>
  </div>
);

export default StyleOption;
