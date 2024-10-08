import { Auth } from "../components/Authcomponents/Auth";
import { Slideshow } from "../components/Authcomponents/slideshow";

export const Signup = () => {
  return (
    <div className="grid h-screen bg-[#171722]">
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%]">
        <div className="hidden lg:block">
          <Slideshow />
        </div>
        <div>
          <Auth />
        </div>
      </div>
    </div>
  );
};
