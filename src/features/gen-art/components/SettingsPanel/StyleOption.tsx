import { MockModelOptionsData } from '../../mock/Data';

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
    className="group flex w-full cursor-pointer flex-col items-center space-y-2"
    onClick={onClick}
  >
    <div className="relative h-32 w-full overflow-hidden rounded-lg">
      <img
        src={style.images[0]}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {isSelected && (
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-black/10 to-black/70 p-2">
          <p className="text-xs font-thin text-white">Selected ✅</p>
        </div>
      )}
    </div>
    <p className="text-center">{style.name}</p>
  </div>
);

export default StyleOption;
