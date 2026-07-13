import { Lottie } from '@toss/lottie';
import { lotties } from '@yourssu-inhouse/resources';

export const LottieView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <div className="p-8">
          <div className="w-[40px]">
            <Lottie json={lotties.empty} loop />
          </div>
        </div>
        <div className="bg-greyOpacity100 p-8">
          <div className="w-[40px]">
            <Lottie json={lotties.empty} loop />
          </div>
        </div>
        <div className="bg-redOpacity200 relative p-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">test</div>
          <div className="z-10 w-[40px]">
            <Lottie json={lotties.empty} loop />
          </div>
        </div>
      </div>
    </div>
  );
};
